# E-Commerce Backend API Endpoints (Postman Testing Guide)

This document lists all API endpoints for the backend, suitable for testing with tools like Postman or Insomnia.

## Base URL

All endpoints are relative to the base URL where your server is running. If running locally on port 5000, the base URL is: `http://localhost:5000/api`

## Authentication Tokens

Several endpoints require authentication. You will need to obtain tokens by registering and logging in users.

* **Customer Token:** Obtain by logging in with a user whose `role` is 'customer'.
* **Admin Token:** Obtain by logging in with a user whose `role` is 'admin'.

When required, send the token in the `Authorization` header:
`Authorization: Bearer <YOUR_TOKEN>`

---

## 1. Authentication (`/api/auth`)

### Register User

* **Endpoint:** `POST /api/auth/register`
* **Description:** Creates a new user with the default role 'customer'.
* **Headers:** None
* **Payload (Body):**
    ```json
    {
      "name": "Test User",
      "email": "customer@example.com",
      "password": "password123"
    }
    ```
* **Responses:**
    * `201 Created`: Success. Returns `{ status: 'success', token, data: { user: { ... } } }`.
    * `400 Bad Request`: Validation error (e.g., missing field, invalid email, weak password) or if email already exists. Returns `{ status: 'fail', errors: [...] }` or `{ status: 'fail', message: '...' }`.

### Login User

* **Endpoint:** `POST /api/auth/login`
* **Description:** Authenticates a user and returns a JWT.
* **Headers:** None
* **Payload (Body):**
    ```json
    {
      "email": "customer@example.com",
      "password": "password123"
    }
    ```
* **Responses:**
    * `200 OK`: Success. Returns `{ status: 'success', token, data: { user: { ... } } }`.
    * `400 Bad Request`: Validation error (e.g., missing field). Returns `{ status: 'fail', errors: [...] }`.
    * `401 Unauthorized`: Invalid credentials (email not found or password incorrect). Returns `{ status: 'fail', message: 'Invalid credentials' }`.

---

## 2. Products (`/api/products`)

### Create Product (Admin Only)

* **Endpoint:** `POST /api/products`
* **Description:** Adds a new product to the database.
* **Headers:** `Authorization: Bearer <ADMIN_TOKEN>`
* **Payload (Body):**
    ```json
    {
      "name": "Wireless Mouse",
      "sku": "WM-LOGI-001",
      "price": 49.99,
      "category": "Electronics"
    }
    ```
* **Responses:**
    * `201 Created`: Success. Returns `{ status: 'success', data: { product: { ... } } }`.
    * `400 Bad Request`: Validation error (e.g., missing field, price <= 0). Returns `{ status: 'fail', errors: [...] }` or if SKU already exists.
    * `401 Unauthorized`: Invalid or missing token.
    * `403 Forbidden`: User is not an admin.

### Get All Products (Public)

* **Endpoint:** `GET /api/products`
* **Description:** Retrieves a list of products with optional filtering, sorting, and pagination.
* **Headers:** None
* **Query Parameters (Optional):**
    * `?category=Electronics` (Filter by category)
    * `?name=mouse` (Filter by name, case-insensitive partial match)
    * `?sort=price_asc` (Sort by price ascending. Default: price descending)
    * `?page=1` (Page number for pagination)
    * `?limit=10` (Number of items per page)
* **Payload (Body):** None
* **Responses:**
    * `200 OK`: Success. Returns `{ status: 'success', data: { products: [...], pagination: { ... } } }`.

### Get Single Product (Public)

* **Endpoint:** `GET /api/products/:id` (Replace `:id` with MongoDB Product ID)
* **Description:** Retrieves details for a specific product.
* **Headers:** None
* **Payload (Body):** None
* **Responses:**
    * `200 OK`: Success. Returns `{ status: 'success', data: { product: { ... } } }`.
    * `400 Bad Request`: Invalid ID format. Returns `{ status: 'fail', errors: [...] }`.
    * `404 Not Found`: No product found with that ID.

### Update Product (Admin Only)

* **Endpoint:** `PUT /api/products/:id` (Replace `:id` with MongoDB Product ID)
* **Description:** Updates details for a specific product. SKU cannot be updated via this route.
* **Headers:** `Authorization: Bearer <ADMIN_TOKEN>`
* **Payload (Body):** (Include only fields to update)
    ```json
    {
      "name": "Wireless Mouse v2",
      "price": 55.00
    }
    ```
* **Responses:**
    * `200 OK`: Success. Returns `{ status: 'success', data: { product: { ... } } }` (with updated data).
    * `400 Bad Request`: Invalid ID format or validation error (e.g., empty name, price <= 0). Returns `{ status: 'fail', errors: [...] }`.
    * `401 Unauthorized`: Invalid or missing token.
    * `403 Forbidden`: User is not an admin.
    * `404 Not Found`: No product found with that ID.

### Delete Product (Admin Only)

* **Endpoint:** `DELETE /api/products/:id` (Replace `:id` with MongoDB Product ID)
* **Description:** Deletes a specific product.
* **Headers:** `Authorization: Bearer <ADMIN_TOKEN>`
* **Payload (Body):** None
* **Responses:**
    * `204 No Content`: Success. No response body.
    * `400 Bad Request`: Invalid ID format. Returns `{ status: 'fail', errors: [...] }`.
    * `401 Unauthorized`: Invalid or missing token.
    * `403 Forbidden`: User is not an admin.
    * `404 Not Found`: No product found with that ID.

---

## 3. Orders (`/api/orders`)

### Checkout

* **Endpoint:** `POST /api/orders/checkout`
* **Description:** Creates a new order based on the items in the cart. Calculates total server-side.
* **Headers:** `Authorization: Bearer <CUSTOMER_TOKEN>` (or Admin Token)
* **Payload (Body):**
    ```json
    [
      { "productId": "mongodb_product_id_1", "quantity": 2 },
      { "productId": "mongodb_product_id_2", "quantity": 1 }
    ]
    ```
    *(Note: Can also send as `{"cart": [...]}`)*
* **Responses:**
    * `201 Created`: Success. Returns `{ status: 'success', data: { order: { id, userId, total } } }`.
    * `400 Bad Request`: Validation error (empty cart, invalid productId format, quantity <= 0). Returns `{ status: 'fail', errors: [...] }`.
    * `401 Unauthorized`: Invalid or missing token.
    * `404 Not Found`: A `productId` in the cart does not exist in the database.

---

## 4. Reports (`/api/reports`) (Admin Only)

### Get Daily Revenue

* **Endpoint:** `GET /api/reports/daily-revenue`
* **Description:** Retrieves a report summing total order revenue grouped by date.
* **Headers:** `Authorization: Bearer <ADMIN_TOKEN>`
* **Payload (Body):** None
* **Responses:**
    * `200 OK`: Success. Returns `{ status: 'success', data: { report: [ { date, total: "sum.00" }, ... ] } }`.
    * `401 Unauthorized`: Invalid or missing token.
    * `403 Forbidden`: User is not an admin.

### Get Category Sales

* **Endpoint:** `GET /api/reports/category-sales`
* **Description:** Retrieves a report counting the number of products in each category.
* **Headers:** `Authorization: Bearer <ADMIN_TOKEN>`
* **Payload (Body):** None
* **Responses:**
    * `200 OK`: Success. Returns `{ status: 'success', data: { report: [ { _id: "CategoryName", count: N }, ... ] } }`.
    * `401 Unauthorized`: Invalid or missing token.
    * `403 Forbidden`: User is not an admin.