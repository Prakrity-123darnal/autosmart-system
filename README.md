# AutoSmart System

AutoSmart is a full-stack Vehicle Parts Selling and Inventory Management System built for coursework milestones.  
It helps manage customers, vehicles, vendors, parts inventory, and sales invoices in a clean and modular architecture with a modern, professional UI.

## 🎨 Modern UI Implementation

This project features a completely redesigned modern user interface with:
- **Professional Design System**: Comprehensive CSS variables, modern color palette, and responsive design
- **Enhanced User Experience**: Smooth animations, hover effects, and micro-interactions
- **Mobile-Responsive**: Fully responsive design that works on all devices
- **Accessibility**: Semantic HTML and proper ARIA labels for screen readers
- **Modern Components**: Enhanced forms, modals, tables, and navigation

### 🚀 Key UI Features Implemented:
- **Modern Navigation Bar** with icons and mobile hamburger menu
- **Interactive Dashboard** with real-time statistics and quick actions
- **Enhanced Forms** with validation, placeholders, and modern styling
- **Responsive Tables** with hover states and action buttons
- **Modal Dialogs** for create/edit operations
- **Search Functionality** across all major pages
- **Loading States** and error handling for better UX
- **Professional Color Scheme** with consistent visual hierarchy

## 🏗️ Monorepo Structure

```text
autosmart-system/
├── autosmart-backend/          # ASP.NET Core Web API
│   ├── Controllers/           # HTTP endpoints and response handling
│   ├── Services/              # Business logic and validation
│   ├── Repositories/          # Data access layer
│   ├── DTOs/                  # Data Transfer Objects
│   ├── Models/                # Database entities
│   ├── Data/                  # Database context
│   ├── Program.cs             # Application entry point
│   └── appsettings.json       # Configuration
├── autosmart-frontend/        # React + Vite Frontend
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API service layer
│   │   ├── App.jsx            # Main App component
│   │   └── index.jsx          # Application entry point
│   ├── package.json           # Dependencies and scripts
│   └── vite.config.js         # Vite configuration
└── README.md                  # This file
```

## 🛠️ Tech Stack

- **Backend**: ASP.NET Core Web API (.NET 9), Entity Framework Core, PostgreSQL
- **Frontend**: React + Vite, Axios, React Router
- **Database**: PostgreSQL

## 🚀 Quick Start

### Prerequisites
- .NET 9 SDK
- Node.js 18+
- PostgreSQL

### 1. Backend Setup
```bash
cd autosmart-backend
dotnet restore
dotnet run
```
The API will run on `http://localhost:5000`

### 2. Frontend Setup
```bash
cd autosmart-frontend
npm install
npm run dev
```
The frontend will run on `http://localhost:5173`

### 3. Database Setup
Update connection string in `autosmart-backend/appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=vehicle_db;Username=postgres;Password=YOUR_PASSWORD"
  }
}
```

## 📡 API Configuration

Frontend is configured to connect to backend at:
- **Base URL**: `http://localhost:5000/api`
- **Configuration file**: `autosmart-frontend/src/services/api.js`

## 🏛️ Architecture

### Backend (Clean Architecture)
- **Controllers**: HTTP endpoints and response handling
- **Services**: Business logic and validation  
- **Repositories**: Data access layer
- **DTOs**: Data transfer objects for API communication
- **Models**: Database entities

### Frontend (Component-based)
- **Components**: Reusable UI components
- **Pages**: Route-level components
- **Services**: API communication layer
- **App.jsx**: Main application router and layout

## 📋 Features

- Customer Management
- Vehicle Management  
- Vendor Management
- Parts Inventory
- Sales Invoice System
- RESTful API
- Responsive UI

## 🔄 Development Workflow

This monorepo follows feature-wise commits:

- "Setup monorepo structure for AutoSmart"
- "Add backend customer API"
- "Add frontend customer page"  
- "Connect frontend to backend API"

## 📝 Notes

- Backend runs on port 5000
- Frontend runs on port 5173 (default Vite port)
- API endpoints are prefixed with `/api`
- CORS is configured for development
- Repositories: data-access logic (EF Core)
- DTOs: request/response contracts
- Models: entity classes
- Data: `AppDbContext` and EF setup

## Completed API Features

1. Initial project setup with clean folder structure
2. PostgreSQL connection and `AppDbContext`
3. Customer API - Create customer (`POST /api/customers`)
4. Customer API - Get all customers (`GET /api/customers`)
5. Vehicle API - Add and list vehicles (`POST/GET /api/vehicles`)
6. Vendor API - Add and list vendors (`POST/GET /api/vendors`)
7. Parts CRUD API (`POST /api/parts`, `GET /api/parts`, `PUT /api/parts/{id}`)
8. Sales Invoice API (`POST /api/sales`)
9. Customer details with vehicles (`GET /api/customers/{id}`)
10. Customer search (`GET /api/customers/search?query=...`)

## Database Configuration

Set your PostgreSQL connection in `AutoSmart.API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=vehicle_db;Username=postgres;Password=YOUR_PASSWORD"
  }
}
```

## How to Run the Backend

```bash
cd AutoSmart.API
dotnet restore
dotnet build
dotnet run
```

Default API base URL used by frontend:

`http://localhost:5000/api`

## How to Run the Frontend

```bash
cd autosmart-ui
npm install
npm run dev
```

## API Examples (Postman)

### Create Customer

`POST /api/customers`

```json
{
  "name": "Ram Sharma",
  "phone": "9800000000"
}
```

### Create Vendor

`POST /api/vendors`

```json
{
  "name": "ABC Auto Suppliers",
  "phone": "9811111111"
}
```

### Create Part

`POST /api/parts`

```json
{
  "name": "Brake Pad",
  "price": 2500,
  "stock": 20,
  "vendorId": 1
}
```

### Create Sales Invoice

`POST /api/sales`

```json
{
  "customerId": 1,
  "items": [
    { "partId": 1, "quantity": 2 }
  ]
}
```

## Notes

- The code uses async/await and simple validation in services.
- APIs return clear status codes and error messages.
- Project naming and namespace conventions are unified as `AutoSmart.API`.
