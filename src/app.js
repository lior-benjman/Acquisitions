import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '#config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from '#routes/auth.routes.js';
import securityMiddleware from '#middleware/security.middleware.js';
import usersRoutes from '#routes/users.routes.js';
import productsRoutes from '#routes/products.routes.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');

const cspDirectives = helmet.contentSecurityPolicy
  ? helmet.contentSecurityPolicy.getDefaultDirectives()
  : null;
const helmetOptions =
  cspDirectives !== null
    ? {
      contentSecurityPolicy: {
        directives: {
          ...cspDirectives,
          'img-src': ["'self'", 'data:', 'https:'],
          'media-src': ["'self'", 'data:', 'https:'],
        },
      },
    }
    : undefined;

const metricStore = {
  totalRequests: new Map(),
  durationSum: new Map(),
  durationCount: new Map(),
};

const labelKey = ({ method, route, statusCode }) =>
  `${method}|${route}|${statusCode}`;

const recordMetrics = (labels, durationSeconds) => {
  const key = labelKey(labels);
  metricStore.totalRequests.set(
    key,
    (metricStore.totalRequests.get(key) || 0) + 1
  );
  metricStore.durationSum.set(
    key,
    (metricStore.durationSum.get(key) || 0) + durationSeconds
  );
  metricStore.durationCount.set(
    key,
    (metricStore.durationCount.get(key) || 0) + 1
  );
};

const escapeLabelValue = value =>
  String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');

const serialiseLabels = ({ method, route, statusCode }) =>
  `method="${escapeLabelValue(method)}",route="${escapeLabelValue(route)}",status_code="${escapeLabelValue(
    statusCode
  )}"`;

const collectMetrics = () => {
  const lines = [
    '# HELP acquisitions_http_request_duration_seconds Duration of HTTP requests in seconds',
    '# TYPE acquisitions_http_request_duration_seconds summary',
  ];

  for (const [key, sum] of metricStore.durationSum.entries()) {
    const [method, route, statusCode] = key.split('|');
    const labels = { method, route, statusCode };
    const count = metricStore.durationCount.get(key) || 0;
    lines.push(
      `acquisitions_http_request_duration_seconds_sum{${serialiseLabels(labels)}} ${sum.toFixed(6)}`
    );
    lines.push(
      `acquisitions_http_request_duration_seconds_count{${serialiseLabels(labels)}} ${count}`
    );
  }

  lines.push(
    '# HELP acquisitions_http_request_total Total number of HTTP requests handled by the application',
    '# TYPE acquisitions_http_request_total counter'
  );

  for (const [key, count] of metricStore.totalRequests.entries()) {
    const [method, route, statusCode] = key.split('|');
    const labels = { method, route, statusCode };
    lines.push(
      `acquisitions_http_request_total{${serialiseLabels(labels)}} ${count}`
    );
  }

  return `${lines.join('\n')}\n`;
};

app.use(helmet(helmetOptions));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(publicDir));

app.use(
  morgan('combined', {
    stream: { write: message => logger.info(message.trim()) },
  })
);

app.use((req, res, next) => {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const rawRoute =
      req.route?.path || req.baseUrl || req.originalUrl?.split('?')[0];
    const route = rawRoute && rawRoute !== '' ? rawRoute : 'unknown_route';
    const durationNs = process.hrtime.bigint() - start;
    const durationSeconds = Number(durationNs) / 1e9;

    recordMetrics(
      {
        method: req.method,
        route,
        statusCode: res.statusCode,
      },
      durationSeconds
    );
  });

  next();
});

app.get('/', (req, res) => {
  logger.info('Serving DevOps blog homepage');
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.get('/shop', (req, res) => {
  logger.info('Serving curated shop experience');
  res.sendFile(path.join(publicDir, 'shop.html'));
});

app.get('/creator', (req, res) => {
  logger.info('Serving creator console page');
  res.sendFile(path.join(publicDir, 'creator.html'));
});

app.get('/sign-in', (req, res) => {
  res.sendFile(path.join(publicDir, 'signin.html'));
});

app.get('/sign-up', (req, res) => {
  res.sendFile(path.join(publicDir, 'signup.html'));
});

app.use('/api', securityMiddleware);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/metrics', (req, res) => {
  try {
    res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.set('Cache-Control', 'no-cache');
    res.send(collectMetrics());
  } catch (error) {
    logger.error('Failed to serve /metrics endpoint', { error });
    res.status(503).json({ error: 'Metrics unavailable' });
  }
});

app.get('/api', (req, res) => {
  res.status(200).json({ message: 'Acquisitions API is running!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/products', productsRoutes);

app.use((error, req, res, next) => {
  logger.error('Unhandled error while processing request', {
    path: req.path,
    method: req.method,
    error,
  });

  if (res.headersSent) {
    return next(error);
  }

  const status = error?.status || error?.statusCode || 500;
  const response = {
    error: status >= 500 ? 'Internal server error' : 'Request failed',
  };

  const missingShopTable =
    typeof error?.message === 'string' &&
    error.message.toLowerCase().includes('shop_products');

  if (error?.code === 'SHOP_NOT_READY') {
    response.error = 'Shop catalog is not initialised';
    response.details =
      error.details ||
      'Run `npm run db:migrate` to create the shop_products table with its seed data.';
  } else if (missingShopTable) {
    response.error = 'Shop catalog is not initialised';
    response.details =
      'Run the latest database migrations (npm run db:migrate) to create the shop_products table.';
  } else if (
    error?.message &&
    (process.env.NODE_ENV !== 'production' || status < 500)
  ) {
    response.details = error.message;
  }

  res.status(status).json(response);
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;
