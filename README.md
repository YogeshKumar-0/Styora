<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/fa355e97-33dd-472f-bda4-73e7314239b4" /># 🛍️ Styora | Modern Full-Stack E-Commerce Platform

Styora is a scalable, cloud-integrated full-stack e-commerce platform built using React, Spring Boot, PostgreSQL, and Supabase.  
The project combines a modern responsive frontend with a secure RESTful backend architecture to provide a seamless online shopping experience.

---

## 📌 Tech Stack

### Frontend
- React.js
- React Router DOM
- Axios
- CSS3 / Styled Components
- Vercel Deployment

### Backend
- Java 17
- Spring Boot
- Spring Security
- Spring Data JPA (Hibernate)
- Maven
- JWT Authentication

### Database & Cloud
- PostgreSQL
- Supabase

---

## 🧩 Features

### 🔐 Authentication & Security
- User Registration
- User Login
- JWT-based Authentication
- Secure API Access using Spring Security

### 🛒 E-Commerce Functionalities
- Product Listing
- Product Details Page
- Category Filtering
- Shopping Cart Management
- Checkout Flow
- Inventory Handling

### ☁️ Cloud Integration
- PostgreSQL database hosted on Supabase
- Persistent cloud storage
- Production-ready backend connectivity

### 📱 Responsive User Interface
- Mobile-friendly design
- Modern UI/UX
- Optimized navigation and routing

---

# 📂 Project Structure

```text
styora/
│
├── frontend/                           # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/                # Reusable UI Components
│   │   ├── pages/                     # Route Pages
│   │   ├── services/                  # API Calls & Axios Config
│   │   ├── assets/                    # Images / Icons
│   │   ├── App.js
│   │   └── index.js
│   │
│   ├── .env
│   ├── package.json
│   └── vercel.json
│
├── backend/                            # Spring Boot Backend
│   ├── src/
│   │   └── main/
│   │       ├── java/com/styora/
│   │       │   ├── controller/
│   │       │   ├── model/
│   │       │   ├── repository/
│   │       │   ├── service/
│   │       │   ├── security/
│   │       │   └── config/
│   │       │
│   │       └── resources/
│   │           └── application.properties
│   │
│   ├── pom.xml
│   └── mvnw
│
└── README.md
```

---

# ⚙️ Prerequisites

Make sure the following tools are installed before running the project:

| Tool | Version |
|------|----------|
| Java JDK | 17+ |
| Node.js | 16+ |
| npm | Latest |
| Maven | Latest |
| Git | Latest |

You also need:
- A Supabase account
- A PostgreSQL database instance

---

# 🔐 Environment Configuration

## Backend Configuration

Navigate to:

```text
backend/src/main/resources/application.properties
```

Add the following configuration:

```properties
spring.datasource.url=jdbc:postgresql://YOUR_SUPABASE_DB_URL:5432/postgres
spring.datasource.username=YOUR_DB_USERNAME
spring.datasource.password=YOUR_DB_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

server.port=8080
```

---

## Frontend Configuration

Create a `.env` file inside the `frontend` directory:

```env
REACT_APP_API_BASE_URL=http://localhost:8080/api/v1
```

---

# 🚀 Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/styora.git
cd styora
```

---

# ▶️ Running the Backend

```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

Backend will run on:

```text
http://localhost:8080
```

---

# ▶️ Running the Frontend

Open another terminal window:

```bash
cd frontend
npm install
npm start
```

Frontend will run on:

```text
http://localhost:3000
```

---

# 📡 REST API Endpoints

| Method | Endpoint | Description | Access |
|--------|-----------|-------------|--------|
| POST | `/api/v1/auth/register` | Register User | Public |
| POST | `/api/v1/auth/login` | Login User | Public |
| GET | `/api/v1/products` | Get All Products | Public |
| GET | `/api/v1/products/{id}` | Get Product By ID | Public |
| POST | `/api/v1/orders` | Place Order | Authenticated |

---

# 🔒 Authentication Flow

1. User logs in using credentials.
2. Backend validates user.
3. JWT token is generated.
4. Frontend stores token securely.
5. Protected APIs require JWT authorization header.

Example:

```http
Authorization: Bearer your_jwt_token
```

---

# ☁️ Deployment

## Frontend Deployment — Vercel

1. Push project to GitHub
2. Import repository into Vercel
3. Set Root Directory:

```text
frontend
```

4. Add environment variables
5. Deploy

---

## Backend Deployment Options

You can deploy the Spring Boot backend on:

- Render
- Railway
- AWS EC2
- Azure
- DigitalOcean

Make sure:
- Environment variables are configured properly
- Supabase allows external connections

---

# 🗄️ Database Schema (Basic)

## Users Table

| Field | Type |
|------|------|
| id | Long |
| name | String |
| email | String |
| password | String |

---

## Products Table

| Field | Type |
|------|------|
| id | Long |
| name | String |
| description | String |
| price | Double |
| stock | Integer |
| imageUrl | String |

---

## Orders Table

| Field | Type |
|------|------|
| id | Long |
| userId | Long |
| totalAmount | Double |
| createdAt | Timestamp |

---

# 🧪 Testing

Backend Testing:

```bash
./mvnw test
```

Frontend Testing:

```bash
npm test
```

---

# 🔮 Future Enhancements

- 💳 Stripe / Razorpay Payment Gateway
- ⭐ Product Reviews & Ratings
- 🛠️ Admin Dashboard
- 📦 Order Tracking
- ❤️ Wishlist System
- 🔍 Advanced Search & Filtering
- 📧 Email Notifications
- 📊 Analytics Dashboard

---

## 📸 Screenshots

![Login Page](https://github.com/user-attachments/assets/2b7c0c39-a388-407b-8953-f32c57db948e)


![Home Page](https://github.com/user-attachments/assets/809616eb-54db-4e13-976d-b3d509138a9e)

![Collection Page](https://github.com/user-attachments/assets/37be9369-5002-4ba8-970a-66c73b51853d)


---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a new branch

```bash
git checkout -b feature-name
```

3. Commit changes

```bash
git commit -m "Add feature"
```

4. Push branch

```bash
git push origin feature-name
```

5. Open Pull Request

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Yogesh**  
B.Tech CSE Student

---

# 🌐 Project Vision

Styora aims to simulate a production-grade modern e-commerce ecosystem while helping developers understand:

- Full-stack application architecture
- REST API development
- Authentication & authorization
- Cloud database integration
- Frontend-backend communication
- Deployment pipelines

---

# ⭐ Support

If you found this project useful:

- Star the repository
- Share feedback
- Contribute improvements

---
