# Acquisitions Application - Docker Setup with Neon Database

This Node.js application is configured to work with Neon Database in both development and production environments using Docker.

## 🏗️ Architecture Overview

- **Development**: Uses Neon Local via Docker for local development with ephemeral database branches
- **Production**: Uses Neon Cloud Database for production deployment
- **Framework**: Express.js with Drizzle ORM
- **Database**: PostgreSQL via Neon (Cloud) and Neon Local (Development)

## 📋 Prerequisites

- Docker and Docker Compose installed
- Neon account and project set up
- Node.js 20+ (for local development without Docker)

## 🔧 Environment Setup

### 1. Neon Configuration

First, get your Neon project credentials from the [Neon Console](https://console.neon.tech/):

- `NEON_API_KEY`: Your Neon API key
- `NEON_PROJECT_ID`: Your project ID
- `PARENT_BRANCH_ID`: The branch ID to create ephemeral branches from (usually `main`)

### 2. Environment Files

The application uses different environment files for different environments:

- `.env.development`: Development environment with Neon Local
- `.env.production`: Production environment with Neon Cloud

#### Update Development Environment

Edit `.env.development` and replace the placeholder values:

```env
# Server configs
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

# Database configs - Neon Local (Docker Compose network)
DATABASE_URL=postgres://neon:npg@neon-local:5432/neondb?sslmode=require

# Neon Local configs (for Docker Compose)
NEON_API_KEY=your_actual_neon_api_key_here
NEON_PROJECT_ID=your_actual_project_id_here
PARENT_BRANCH_ID=your_actual_parent_branch_id_here

# Arcjet
ARCJET_KEY=ajkey_01k79wqth1fw492nhxmw0kgs1p
```

#### Update Production Environment

Edit `.env.production` and replace with your production database URL:

```env
# Server configs
PORT=3000
NODE_ENV=production
LOG_LEVEL=warn

# Database configs - Neon Cloud Database
DATABASE_URL=postgresql://your_production_neon_url_here

# Arcjet
ARCJET_KEY=ajkey_01k79wqth1fw492nhxmw0kgs1p
```

## 🚀 Development Environment

### Running with Docker Compose

The development environment uses Neon Local, which automatically creates ephemeral database branches that are created when the container starts and deleted when it stops.

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml --env-file .env.development up

# Start in detached mode
docker-compose -f docker-compose.dev.yml --env-file .env.development up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop and remove containers
docker-compose -f docker-compose.dev.yml down
```

### Development Features

- **Hot Reloading**: Source code is mounted as a volume for automatic restarting
- **Ephemeral Branches**: Each container start creates a fresh database branch
- **Debug Logging**: Enhanced logging for development debugging
- **Health Checks**: Automatic health monitoring for both app and database

### Accessing the Development Application

- Application: http://localhost:3000
- Health Check: http://localhost:3000/health
- API Endpoint: http://localhost:3000/api

### Database Management in Development

```bash
# Run database migrations
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate

# Generate database migrations
docker-compose -f docker-compose.dev.yml exec app npm run db:generate

# Open Drizzle Studio
docker-compose -f docker-compose.dev.yml exec app npm run db:studio
```

## 🏭 Production Environment

### Running with Docker Compose

The production environment connects directly to your Neon Cloud database.

```bash
# Build and start production environment
docker-compose -f docker-compose.prod.yml --env-file .env.production up --build

# Start in detached mode
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop containers
docker-compose -f docker-compose.prod.yml down
```

### Production Features

- **Optimized Build**: Multi-stage Docker build for smaller production images
- **Security**: Runs as non-root user with security restrictions
- **Resource Limits**: Memory and CPU limits configured
- **Health Checks**: Production-ready health monitoring
- **Auto-restart**: Containers restart automatically on failure

### Database Migrations in Production

```bash
# Run migrations in production
docker-compose -f docker-compose.prod.yml exec app npm run db:migrate
```

## ☁️ Cloudflare Tunnel with Traefik

Use the `docker-compose.cloudflare.yml` stack to serve the application through a Cloudflare Tunnel that terminates at Traefik.

1. **Create the tunnel** – In Cloudflare Zero Trust, create a tunnel, add a DNS route for your hostname, and copy the one-line connector token from the **Connect** tab.
2. **Store the token** – Copy `.env.cloudflare.example` to `.env.cloudflare` and paste the token value into `CLOUDFLARE_TUNNEL_TOKEN`.
3. **Set the public hostname** – Provide the hostname Traefik should match by creating (or updating) a project-level `.env` file with `TRAEFIK_APP_HOST=app.example.com`, or export it inline when running Docker Compose.
4. **Verify app configuration** – Ensure `.env.production` contains the production environment variables required by the Node.js app.
5. **Start the stack**:

   ```bash
   docker compose -f docker-compose.cloudflare.yml up -d --build
   ```

6. **Monitor connectivity** – Check the logs to confirm both Traefik and Cloudflared are healthy:

   ```bash
   docker compose -f docker-compose.cloudflare.yml logs -f cloudflared
   docker compose -f docker-compose.cloudflare.yml logs -f traefik
   ```

### Security notes

- The Traefik dashboard is available at `/dashboard`; restrict it before exposing the stack publicly (e.g., by adding basic auth or disabling `--api.dashboard`).
- Cloudflared forwards traffic to Traefik over HTTP on the internal network. If you need HTTPS between Cloudflared and Traefik, add an `websecure` entrypoint in `traefik/traefik.yml` and adjust the tunnel route accordingly.

## 🛠️ Manual Docker Commands

### Building the Application

```bash
# Build development image
docker build --target development -t acquisitions:dev .

# Build production image
docker build --target production -t acquisitions:prod .
```

### Running Individual Containers

```bash
# Run development container
docker run -p 3000:3000 --env-file .env.development acquisitions:dev

# Run production container
docker run -p 3000:3000 --env-file .env.production acquisitions:prod
```

## 📊 Monitoring and Debugging

### Checking Container Status

```bash
# Check running containers
docker ps

# Check container logs
docker logs acquisitions-dev  # or acquisitions-prod

# Execute commands in running container
docker exec -it acquisitions-dev /bin/sh
```

### Database Connection Testing

```bash
# Test database connection in development
docker-compose -f docker-compose.dev.yml exec app node -e "
import { db } from './src/config/database.js';
console.log('Database connection test...');
"
```

## 🔄 Switching Between Environments

### From Development to Production

1. Stop development containers:

   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```

2. Start production containers:
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
   ```

### Environment-Specific Database Behavior

- **Development**:
  - Uses Neon Local proxy
  - Creates ephemeral branches automatically
  - Database data is temporary and reset on container restart
  - Uses regular PostgreSQL connection via `postgres` library

- **Production**:
  - Connects directly to Neon Cloud database
  - Uses persistent data storage
  - Optimized for performance and reliability
  - Uses Neon serverless driver for optimal connection pooling

## 🧪 Testing Database Setup

### Verify Development Setup

```bash
# Check if Neon Local is accessible
docker-compose -f docker-compose.dev.yml exec neon-local pg_isready -h localhost -p 5432

# Test application database connection
curl http://localhost:3000/health
```

### Verify Production Setup

```bash
# Test application health
curl http://localhost:3000/health

# Check database connectivity
docker-compose -f docker-compose.prod.yml logs app | grep -i database
```

## ❗ Troubleshooting

### Common Issues

1. **Neon Local connection fails**:
   - Verify `NEON_API_KEY`, `NEON_PROJECT_ID`, and `PARENT_BRANCH_ID` are correct
   - Check Neon Local container logs: `docker logs neon-local`

2. **Application can't connect to database**:
   - Ensure database container is healthy before app starts
   - Check network connectivity between containers
   - Verify `DATABASE_URL` format is correct

3. **Port conflicts**:
   - Change ports in docker-compose files if 3000 or 5432 are in use
   - Use `docker ps` to check for port conflicts

4. **Permission errors**:
   - Ensure Docker has proper permissions
   - Check if running as root is required for your system

### Getting Help

- Check container logs: `docker-compose logs [service-name]`
- Inspect container: `docker exec -it [container-name] /bin/sh`
- Reset everything: `docker-compose down -v --remove-orphans`

## 📚 Additional Resources

- [Neon Documentation](https://neon.com/docs)
- [Neon Local Documentation](https://neon.com/docs/local/neon-local)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)

## 🔒 Security Notes

- Never commit `.env.*` files to version control
- Use secrets management for production deployments
- Regularly update dependencies and base images
- Monitor application logs for security issues

---

For questions or issues, please check the troubleshooting section above or consult the project documentation.
