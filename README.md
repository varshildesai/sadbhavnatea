# SADBHAVNA TEA - Full Stack MERN E-Commerce Platform

A premium E-Commerce web application built to sell Tea products, Tea Masala, Coffee, and Coffee Machines. The design features a modern, responsive **Light Green, Light Orange, and Light Gray** customized aesthetic theme using Tailwind CSS.

## 🛠 Tech Stack

- **Frontend**: React.js (built with Vite), Tailwind CSS, React Router DOM, Lucide Icons.
- **Backend**: Node.js, Express.js (Boilerplate structure built).
- **Database**: MongoDB (Mongoose).
- **Payments**: Razorpay Integration (via UPI / Cards).

## 🚀 Features Implemented

### User Interface
- **Responsive Navigation** with Cart counter.
- **Home Page**: Hero Banner, Category boxes, Product Carousel, Testimonials.
- **Products Listing**: Sidebar filters, Search functionality, Grid view of products.
- **Product Details**: Multi-image gallery, interactive quantity selector, Add to Cart logic.
- **Cart System**: Product subtotaling, custom quantity adjustments.
- **Checkout Page**: Secure shipping form layout and native UPI/Card payment selection.
- **Authentication**: Modern Login and Register UI pages.

### Admin Dashboard (Accessible at `/admin`)
- **Main Layout**: Custom sidebar with routing to Admin subpages.
- **Dashboard Stats**: Visualized metrics (Revenue, Orders, Users, Products).
- **Product Management**: Data table visualization for CRUD actions.

## 📦 Project Structure

```text
SADBHAVNATEA/
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components (Navbar, Button, ProductCard)
│   │   ├── layouts/        # Admin Layout structures
│   │   ├── pages/          # All Route Pages (Home, Cart, Admin Dashboard)
│   │   ├── App.jsx         # Main Router Setup
│   │   └── index.css       # Tailwind entry and Base theme variables
│   ├── tailwind.config.js  # Theme colors (Primary Green, Secondary Orange, Surface Gray)
│   └── package.json
├── server/                 # Express Backend Boilerplate
│   ├── index.js            # Main server entry with Mongoose connection
│   ├── .env.example        # Environment Variable templates
│   └── package.json
└── README.md
```

## ⚙️ Installation & Running Locally

### 1. Backend Setup
1. Navigate into the backend folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your MongoDB URI.
4. Start the server (runs on Port 5000):
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the client folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Visit `http://localhost:5173/` in your browser.

## 🌍 Deployment Guide

### Frontend (Vercel)
1. Push your code to GitHub.
2. Go to [Vercel](https://vercel.com/) and Import your project repository.
3. Set the Root Directory to `client`.
4. Leave build commands as default (`npm run build`).
5. Click **Deploy**.

### Backend (Render)
1. Push your code to GitHub.
2. Go to [Render](https://render.com/) and create a new **Web Service**.
3. Point it to your repository, and set the Root Directory to `server`.
4. Build Command: `npm install`
5. Start Command: `node index.js`
6. Add Environment Variables inside Render settings by copying over the data from `.env.example` (Make sure you set `NODE_ENV` to production).
7. Deploy. Configure the `CLIENT_URL` variable to your new Vercel domain!
