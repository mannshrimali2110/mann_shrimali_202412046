We are starting to build a basic Ecommerce project from scratch using • Next.js 14+ (App Router, TypeScript) 
• Tailwind CSS or CSS Modules for styling . Both of which have been setup . Our Backend is already done in node JS and express , I shall give you all the API end points. 
We are supposed to create the frontend now. I've already set up next js project with tailwind css.
The project will have the following pages:
Navbar should be according to the user login state (logged in/logged out).
It should should Sign up Page and Login Page button redirecting to the respective pages.
Set the authorization token in local storage on successful login/signup.
Data and cart must be persisted using local storage.
Home Page which displays a list of products fetched from the backend API.
PAGES : 
## 👤 Guest (Not Logged In)

**General Access**

* ✅ Can view all products and product details without logging in.
* ✅ Can search products by name, category, and use pagination/sorting options.
* ✅ Can view the total price on product cards or listings.

**Limitations**

* 🚫 Cannot add products to cart if not logged in.
  → The “Add to Cart” button should redirect to the **Login** page with a prompt like “Please log in to add items to your cart.”
* 🚫 Cannot access the checkout page or place orders.
  → Any attempt to open `/checkout` should redirect to the login page.
* 🚫 Cannot view the Cart or Orders pages (redirect to login).
* 🚫 Cannot access Admin Dashboard or Reports routes.
* 🚫 Cannot modify any product data (Create/Update/Delete).
* 🚫 Cannot see user-specific options in the navbar (only sees “Login” and “Signup”).

---

## 🛒 Customer (Logged In User, Role = `customer`)

### 🧍 Authentication & Profile

* ✅ Can register with email and password (passwords hashed with bcrypt).
* ✅ Can log in and receive JWT for authentication.
* ✅ Navbar should display the user’s name and a “Logout” button.
* ✅ Can update profile details (name, email, password).

### 🏬 Product Browsing

* ✅ Can view, search, and filter all products.
* ✅ Can sort products by price (default: descending, server-side).
* ✅ Can view individual product details page.

### 🛍️ Cart

* ✅ Can click “Add to Cart” and have item added to the logged-in user’s cart.
  → The cart can be local (frontend) or synced with the backend.
* ✅ Can increase/decrease item quantity or remove an item from the cart.
* ✅ Cart UI should display product name, price, quantity, subtotal, and total.
* ✅ Cart contents should persist for the logged-in user across sessions.
* 🚫 Cannot manipulate item prices from the frontend (prices fetched from backend).

### 💳 Checkout

* ✅ Can proceed to checkout from the cart page.
* ✅ Checkout request must send cart items to the backend, where total is **calculated on the server**.
* ✅ On successful checkout, backend creates entries in `orders` and `order_items` tables.
* ✅ Should receive a success confirmation message (e.g., “Order placed successfully!”).
* 🚫 Cannot modify totals or prices during checkout (server re-verifies everything).
* 🚫 Cannot place an order with an empty cart.

### 📦 Orders

* ✅ Can view their own past orders on the “My Orders” page.
* ✅ Each order should show:

  * Order ID
  * Date/time
  * Total amount
  * List of items (name, quantity, priceAtPurchase)
* 🚫 Cannot view other users’ orders.

---

## 🧑‍💼 Admin (Role = `admin`)

### 🧍 Authentication

* ✅ Can log in via same login page; backend determines admin via role field.
* ✅ JWT identifies them as admin.

### 📦 Product Management

* ✅ Can create new products (name, price, category, etc.).
* ✅ Can edit/update existing products.
* ✅ Can delete products.
* ✅ Admin product list page should include “Edit” and “Delete” buttons for each item.
* ✅ Backend validates all product fields on create/update.
* 🚫 Non-admins cannot access or use these routes (secured by middleware).

### 📊 Reports & Analytics

* ✅ Can access the “Reports” section from admin dashboard.
* ✅ Can view:

  * SQL Aggregation: Daily revenue or total sales by day.
  * MongoDB Aggregation: Product sales count by category.
* ✅ Should see visual summaries (charts or tables) on frontend.
* 🚫 Customers or Guests cannot access `/reports`.

### 🧾 Orders

* ✅ Can view all customer orders with user info and total.
* ✅ Can filter or search orders by user or date.
* ✅ Can update order status (optional: e.g., “Processing”, “Shipped”).
* 🚫 Customers cannot see other users’ orders.
* 🚫 Guests cannot access orders.

---
## 🧩 UI/UX Rules Summary

| Feature                | Guest | Customer     | Admin           |
| ---------------------- | ----- | ------------ | --------------- |
| View Products          | ✅     | ✅            | ✅               |
| Search / Filter / Sort | ✅     | ✅            | ✅               |
| Add to Cart            | 🚫    | ✅            | ✅ (for testing) |
| View Cart              | 🚫    | ✅            | ✅               |
| Checkout               | 🚫    | ✅            | ✅ (for testing) |
| View My Orders         | 🚫    | ✅ (own only) | ✅ (all)         |
| CRUD Products          | 🚫    | 🚫           | ✅               |
| Access Reports         | 🚫    | 🚫           | ✅               |
| View Navbar User Info  | 🚫    | ✅            | ✅               |
| Update Profile         | 🚫    | ✅            | ✅               |

---