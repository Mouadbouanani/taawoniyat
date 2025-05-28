# Taawoniyate API Documentation

## Base URL
```
http://localhost:8080/api/v1
```

## Authentication
All API endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### Authentication
#### Register Client
- **POST** `/api/users/register/client`
- **Description**: Register a new client account
- **Body**:
  ```json
  {
    "fullName": "John Doe",
    "email": "client@example.com",
    "password": "password123",
    "region": "Region",
    "city": "City",
    "phone": "1234567890",
    "address": "123 Street"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "id": 1,
    "fullName": "John Doe",
    "email": "client@example.com",
    "role": "CLIENT"
  }
  ```

#### Register Seller
- **POST** `/api/users/register/seller`
- **Description**: Register a new seller account
- **Body**:
  ```json
  {
    "fullName": "Jane Smith",
    "email": "seller@example.com",
    "password": "password123",
    "region": "Region",
    "city": "City",
    "phone": "1234567890",
    "businessName": "My Store",
    "address": "123 Business Street"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "id": 1,
    "fullName": "Jane Smith",
    "email": "seller@example.com",
    "role": "SELLER",
    "businessName": "My Store"
  }
  ```

#### Login
- **POST** `/api/users/authenticate`
- **Description**: Authenticate user
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "role": "CLIENT",
    "token": "jwt_token"
  }
  ```

### Products
#### Get All Products
- **GET** `/store/products`
- **Description**: Get all products
- **Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "name": "Product Name",
      "description": "Product Description",
      "price": 99.99,
      "quantity": 10,
      "category": "Category",
      "images": ["url1", "url2"]
    }
  ]
  ```

#### Search Products
- **GET** `/store/products/search?keyword={keyword}`
- **Description**: Search products by keyword
- **Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "name": "Product Name",
      "description": "Product Description",
      "price": 99.99,
      "quantity": 10,
      "category": "Category",
      "images": ["url1", "url2"]
    }
  ]
  ```

#### Get Products by Category
- **GET** `/store/products/category/{name}`
- **Description**: Get products by category
- **Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "name": "Product Name",
      "description": "Product Description",
      "price": 99.99,
      "quantity": 10,
      "category": "Category",
      "images": ["url1", "url2"]
    }
  ]
  ```

### Cart (Panier)
#### Get Cart
- **GET** `/panier/history`
- **Description**: Get user's cart history
- **Response**: `200 OK`
  ```json
  [
    {
      "panier_id": 1,
      "date": "2024-03-20",
      "items": [
        {
          "id": 1,
          "quantity": 2,
          "price": 99.99,
          "product": "Product Name",
          "seller": "Store Name"
        }
      ],
      "totalAmount": 199.98
    }
  ]
  ```

#### Save Cart
- **POST** `/panier/save`
- **Description**: Save current cart
- **Body**:
  ```json
  {
    "items": [
      {
        "productId": 1,
        "quantity": 2
      }
    ]
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "message": "Cart saved successfully"
  }
  ```

### User Management
#### Get Current User
- **GET** `/api/users/me`
- **Description**: Get current user profile
- **Response**: `200 OK`
  ```json
  {
    "id": 1,
    "fullName": "John Doe",
    "email": "user@example.com",
    "role": "CLIENT",
    "region": "Region",
    "city": "City",
    "phone": "1234567890",
    "address": "123 Street"
  }
  ```

#### Get User Favorites
- **GET** `/api/users/me/favorites`
- **Description**: Get user's favorite products
- **Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "name": "Product Name",
      "description": "Product Description",
      "price": 99.99,
      "quantity": 10,
      "category": "Category",
      "images": ["url1", "url2"]
    }
  ]
  ```

### Admin Operations
#### Get System Statistics
- **GET** `/api/admin/statistics`
- **Description**: Get system-wide statistics
- **Response**: `200 OK`
  ```json
  {
    "totalUsers": 100,
    "totalClients": 80,
    "totalSellers": 20,
    "totalProducts": 500,
    "totalOrders": 1000
  }
  ```

#### Get All Users
- **GET** `/api/admin/users`
- **Description**: Get paginated list of all users
- **Query Parameters**:
  - `page`: Page number (default: 0)
  - `size`: Items per page (default: 10)
  - `sortBy`: Sort field (default: "id")
  - `sortDir`: Sort direction (default: "asc")
- **Response**: `200 OK`
  ```json
  {
    "content": [
      {
        "id": 1,
        "fullName": "John Doe",
        "email": "user@example.com",
        "role": "CLIENT"
      }
    ],
    "totalElements": 100,
    "totalPages": 10,
    "currentPage": 0
  }
  ```

## Error Codes

| Code | Description |
|------|-------------|
| 400  | Bad Request - Invalid input data |
| 401  | Unauthorized - Authentication required |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Resource doesn't exist |
| 409  | Conflict - Resource already exists |
| 422  | Unprocessable Entity - Validation failed |
| 500  | Internal Server Error - Server error |

## Rate Limiting

- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users
- Rate limit headers included in response:
  ```
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 99
  X-RateLimit-Reset: 1620000000
  ```

## Security Considerations

1. **Authentication**
   - JWT token-based authentication
   - Token expiration and refresh mechanism
   - Secure password hashing

2. **Authorization**
   - Role-based access control (CLIENT, SELLER, ADMIN)
   - Resource ownership validation
   - Permission checks for sensitive operations

3. **Data Protection**
   - Input validation and sanitization
   - SQL injection prevention
   - XSS protection
   - CSRF protection

4. **API Security**
   - Rate limiting
   - Request size limits
   - HTTPS enforcement
   - CORS configuration
