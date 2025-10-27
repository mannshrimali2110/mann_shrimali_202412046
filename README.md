
---
# E-Commerce Web Application

This project is a full-stack E-Commerce application developed using the MVC architecture, with a primary focus on backend implementation, database integration, and automated testing.
It uses a hybrid database structure combining MySQL for relational data and MongoDB for product data.

---

## Tech Stack

**Backend:** Node.js, Express.js, Sequelize
**Databases:**

* **MySQL** – for users, orders, and order items
* **MongoDB** – for product catalog

**Authentication:** JWT (JSON Web Tokens) and bcrypt for password hashing
**Frontend:** Next.js 14+ with Tailwind CSS
**Testing Framework:** Jest and Supertest

---

## Testing

**Framework Used:** Jest with Supertest

**Command to Run Tests:**

```bash
cd backend
npm run test
```

**Test Coverage Overview:**

| Test File           | Description                                                                                                                                                           |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **auth.test.js**    | Tests user registration and login APIs. Verifies password hashing, JWT generation, and proper error handling for invalid credentials.                                 |
| **product.test.js** | Tests product-related APIs including admin CRUD operations, server-side sorting (by price), filtering, and pagination.                                                |
| **order.test.js**   | Tests the checkout process, ensuring order and order items are created correctly. Verifies total calculation on the server and validation for empty or invalid carts. |
| **report.test.js**  | Tests admin-only report endpoints. Validates SQL aggregation (daily revenue) and MongoDB aggregation (sales by category).                                             |

All tests execute against isolated databases using Jest lifecycle hooks to maintain consistency and independence.

---

## How to Run the Project Locally

1. Install dependencies

   ```bash
   npm install
   ```

2. Configure environment variables in a `.env` file.

3. Start the backend server

   ```bash
   npm start
   ```

4. Run automated tests

   ```bash
   npm run test
   ```

---

## .env.example

```bash
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce
MYSQL_URL=mysql://root:password@127.0.0.1:3306/ecommerce
JWT_SECRET="YOUR JWT SECRET KEY HERE"
NODE_ENV=development
```

---

