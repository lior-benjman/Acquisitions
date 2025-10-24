# Authentication Middleware

This project includes a comprehensive authentication and authorization system using JWT tokens.

## Middleware Functions

### 1. `authenticateToken`

**Purpose**: Validates JWT tokens and ensures user authentication
**Usage**: For routes that require authentication

```javascript
import { authenticateToken } from '../middleware/auth.middleware.js';

router.get('/protected', authenticateToken, (req, res) => {
  // req.user will contain authenticated user data
  res.json({ message: 'Protected route', user: req.user });
});
```

### 2. `optionalAuth`

**Purpose**: Attempts authentication but doesn't fail if no token is provided
**Usage**: For routes that work for both authenticated and guest users

```javascript
import { optionalAuth } from '../middleware/auth.middleware.js';

router.get('/public', optionalAuth, (req, res) => {
  if (req.user) {
    res.json({ message: 'Hello authenticated user', user: req.user });
  } else {
    res.json({ message: 'Hello guest user' });
  }
});
```

### 3. `requireRole(allowedRoles)`

**Purpose**: Checks if authenticated user has required role(s)
**Usage**: For role-based access control

```javascript
import {
  authenticateToken,
  requireRole,
} from '../middleware/auth.middleware.js';

// Single role
router.get('/admin-only', authenticateToken, requireRole('admin'), handler);

// Multiple roles
router.get(
  '/user-or-admin',
  authenticateToken,
  requireRole(['user', 'admin']),
  handler
);
```

## Token Sources

The middleware supports JWT tokens from two sources:

1. **HTTP-only Cookie** (preferred): `token` cookie
2. **Authorization Header**: `Bearer <token>`

## Current Route Protection

### Auth Routes (`/api/auth`)

- `POST /sign-up` - Public (no authentication)
- `POST /sign-in` - Public (no authentication)
- `POST /sign-out` - Public (no authentication)

### User Routes (`/api/user`)

- `GET /` - **Admin only** (requires admin role)
- `GET /:id` - **Authenticated** (users can view their own profile, admins can view any)
- `PUT /:id` - **Authenticated** (users can update their own info, admins can update anyone)
- `DELETE /:id` - **Authenticated** (users can delete their own account, admins can delete anyone)

## Error Responses

### 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Access token is required"
}
```

### 403 Forbidden

```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found (if user doesn't exist)

```json
{
  "error": "Unauthorized",
  "message": "User not found"
}
```

## Request Object Enhancement

After successful authentication, `req.user` contains:

```javascript
{
  id: 1,
  email: "user@example.com",
  name: "John Doe",
  role: "user", // or "admin"
  created_at: "2023-01-01T00:00:00.000Z",
  updated_at: "2023-01-01T00:00:00.000Z"
}
```

## Security Features

1. **Token Verification**: Validates JWT signature and expiration
2. **User Existence Check**: Ensures user still exists in database
3. **Comprehensive Logging**: Logs all authentication attempts and errors
4. **Multiple Token Sources**: Supports both cookies and Authorization headers
5. **Role-based Access**: Fine-grained permission control
6. **Error Handling**: Proper HTTP status codes and error messages

## Example Usage Patterns

### Protected Route with Role Check

```javascript
router.post(
  '/admin-action',
  authenticateToken,
  requireRole('admin'),
  (req, res) => {
    // Only admins can access this
  }
);
```

### User-specific Resource Access

```javascript
router.get('/profile/:id', authenticateToken, (req, res) => {
  const requestedUserId = parseInt(req.params.id);

  // Users can only access their own profile, admins can access any
  if (req.user.id !== requestedUserId && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Continue with logic...
});
```

### Optional Authentication

```javascript
router.get('/posts', optionalAuth, (req, res) => {
  const isAuthenticated = !!req.user;

  if (isAuthenticated) {
    // Show personalized content
  } else {
    // Show public content
  }
});
```
