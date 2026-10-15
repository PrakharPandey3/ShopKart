# 🛍️ ShopKart — Full-Stack E-Commerce Application

ShopKart is a full-stack e-commerce web application that allows users to browse products, search and filter products by category, manage their wishlist and shopping cart, and place orders through an online payment workflow.

The project is built using React for the frontend, Node.js and Express.js for the backend, and MongoDB for database management.

## ✨ Features

- **User Authentication:** Register, log in, and log out securely.
- **Product Browsing:** View products and individual product details.
- **Search & Filtering:** Search for products and filter by category.
- **Shopping Cart:** Add products, update quantities, and manage cart items.
- **Stock Validation:** Prevent cart quantities from exceeding available stock.
- **Wishlist:** Add and remove products from a persistent, account-based wishlist.
- **Order Management:** Create orders and view order-related information.
- **Online Payments:** Razorpay integration for processing payments.
- **Protected Routes:** Restrict authenticated features to logged-in users.
- **Persistent Storage:** Store customer, product, wishlist, cart, and order data in MongoDB, according to the implemented models.
- **Responsive UI:** A React and Tailwind CSS interface designed for a smooth shopping experience.

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React, JavaScript |
| Styling | Tailwind CSS |
| Build Tool | Vite |
| Routing | React Router |
| API Requests | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, HTTP cookies |
| Payment Gateway | Razorpay |
| Version Control | Git and GitHub |


## ⚙️ Prerequisites

Before running ShopKart locally, install:

- [Node.js](https://nodejs.org/) — preferably an LTS version.
- [npm](https://www.npmjs.com/) — included with Node.js.
- [MongoDB](https://www.mongodb.com/) — a local installation or MongoDB Atlas account.
- [Git](https://git-scm.com/) — for cloning and version control.
- A [Razorpay account](https://razorpay.com/) with test API credentials if payment functionality is enabled.

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd ShopKart
```

Replace the repository URL with your actual GitHub repository URL.

### 2. Set up the backend

Open a terminal in the backend directory:

```bash
cd server
npm install
```

Create a `.env` file in the backend directory and add the environment variables required by your implementation.

Example configuration:

```env
PORT=9000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

These variable names are illustrative. Use the exact names referenced by your backend code.

**Important:**
- Replace the example values with your own credentials.
- Never commit `.env` to GitHub.
- Use Razorpay test credentials during development.
- If your project uses additional variables, configure those as well.

Start the backend using the script defined in `server/package.json`. If the project has a `dev` script, run:

```bash
npm run dev
```

The backend is expected to run at:

```text
http://localhost:9000
```

### 3. Set up the frontend

Open a second terminal from the project root:

```bash
cd client
npm install
```

Configure the frontend API base URL to point to the backend:

```text
http://localhost:9000
```

For example, if your Axios instance uses a Vite environment variable, you may configure:

```env
VITE_API_BASE_URL=http://localhost:9000
```

Make sure the variable name matches the one used in your frontend code. If the API URL is hardcoded in your Axios instance, update it there instead.

Start the frontend:

```bash
npm run dev
```

Vite will display the local URL, commonly:

```text
http://localhost:5173
```

Open that URL in your browser.

## 🔐 Authentication & Security

ShopKart uses JWT-based authentication with HTTP cookies.

- Users register and log in through the authentication endpoints.
- Protected backend routes validate the authentication token.
- Authenticated requests use cookies through Axios with `withCredentials: true`.
- Wishlist and other account-specific features require authentication where implemented.

For local development, configure CORS on the backend to allow the frontend origin and credentials. Cookie settings must also be compatible with the local development environment.

Never expose JWT secrets, database credentials, or Razorpay secret keys in frontend code.

## 🛒 Shopping Cart & Wishlist

### Shopping Cart

The cart allows users to manage products before checkout.

- Add products to the cart.
- Update item quantities.
- Calculate the subtotal from product prices and quantities.
- Validate quantities against available stock.
- Keep shared cart state accessible to components such as the Navbar and checkout page.

### Wishlist

The wishlist allows authenticated customers to save products for later.

- Add products to the wishlist.
- Remove saved products.
- Retrieve the wishlist associated with the logged-in customer.
- Persist wishlist data in MongoDB so it can be retrieved across sessions.

The precise behavior depends on the implemented frontend and backend routes.

## 💳 Payment Workflow

ShopKart integrates Razorpay for online payments.

The intended checkout workflow is:

1. The customer reviews their cart and proceeds to checkout.
2. The backend validates the order details and calculates the payable amount.
3. The backend creates the appropriate order or payment request.
4. The frontend opens the Razorpay checkout interface.
5. The payment result is verified by the backend using the appropriate verification mechanism.
6. The order is updated according to the verified payment status.
7. The frontend displays the corresponding success, failure, or order status page.

**Security note:** Never trust a payment-success response from the browser alone. Verify payment details on the server before treating an order as paid. Use webhooks where appropriate for reliable payment-status updates.

## 🧪 Testing

Run the commands supported by your respective `package.json` files.

For example, if a test script is configured:

```bash
npm test
```

Run this command separately in the frontend or backend directory as applicable.

You can also test the application manually by checking:

- Registration, login, and logout.
- Access restrictions on protected routes.
- Product search and category filtering.
- Cart quantity and stock validation.
- Wishlist persistence after refreshing the page.
- Checkout and payment verification.
- Order status after successful or failed payment.

## 🐛 Troubleshooting

**Backend connection errors**
- Confirm the backend is running on port `9000`.
- Verify the frontend API base URL.
- Check the browser console and backend terminal for errors.

**Authentication or cookie issues**
- Confirm Axios uses `withCredentials: true` where required.
- Check the backend CORS configuration.
- Verify that cookie options are appropriate for local HTTP development.

**MongoDB connection errors**
- Check the connection string in `.env`.
- Confirm the database is running or that your Atlas cluster is accessible.
- Verify database access permissions.

**Razorpay payment issues**
- Confirm your test API credentials are configured correctly.
- Check the backend payment creation and verification endpoints.
- Inspect backend logs for failed requests.




**Developed as a full-stack e-commerce project using React, Express.js, MongoDB, and Razorpay.**
