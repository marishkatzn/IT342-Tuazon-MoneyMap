# MoneyMap - Financial Management Application

## Project Description

MoneyMap is a full-stack web and mobile application designed to help users manage their finances effectively. The application provides user authentication, profile management, and financial tracking capabilities. It consists of three main components: a Spring Boot backend API, a React web frontend, and a mobile application.

## Technologies Used

### Backend
- **Java** 17 LTS
- **Spring Boot** 3.2.5
- **Spring Data JPA** - Object-relational mapping
- **Spring Security** - Authentication and authorization
- **MySQL** - Database
- **Maven** - Build tool
- **Lombok** - Annotation-based code generation

### Frontend (Web)
- **React** 19.2.4
- **React Router** 7.13.0
- **React Scripts** 5.0.1
- **Testing Library** - Unit and integration testing
- **CSS** - Styling

### Mobile
- [To be implemented]

### Database
- **MySQL** - Relational database for user data and financial information

---

## Steps to Run Backend

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- MySQL Server running on `localhost:3306`
- MySQL database named `moneymap_db`

### Setup Instructions

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Configure database credentials in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/moneymap_db
   spring.datasource.username=<your_username>
   spring.datasource.password=<your_password>
   ```

3. Build the project using Maven:
   ```bash
   mvn clean install
   ```

4. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```

   Or build a JAR and run it:
   ```bash
   mvn clean package
   java -jar target/moneymap-0.0.1-SNAPSHOT.jar
   ```

5. The backend will start on `http://localhost:8081`

---

## Steps to Run Web App

### Prerequisites
- Node.js 14+ and npm 6+

### Setup Instructions

1. Navigate to the web directory:
   ```bash
   cd web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   The web application will open on `http://localhost:3000`

4. Build for production:
   ```bash
   npm run build
   ```

5. Run tests:
   ```bash
   npm test
   ```

### Configuration
The web app communicates with the backend API at `http://localhost:8081` by default. Update API endpoints in the React context or service files if needed.

---

## Steps to Run Mobile App

### Prerequisites
- [To be determined based on mobile framework]

### Setup Instructions
[To be completed when mobile app is implemented]

---

## API Endpoints

### Authentication Endpoints
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/api/auth/register` | Register a new user | `{"email": "string", "password": "string", ...}` |
| POST | `/api/auth/login` | User login | `{"email": "string", "password": "string"}` |

### User Endpoints
| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|------------------|
| GET | `/api/user/me` | Get current user profile | Required |

### Response Format
All endpoints return JSON responses with appropriate HTTP status codes:
- **200 OK** - Successful request
- **201 Created** - Resource created successfully
- **400 Bad Request** - Invalid input
- **401 Unauthorized** - Authentication failed
- **403 Forbidden** - Access denied
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

---

## Project Structure

```
IT342_G5_Tuazon_Lab1/
├── backend/                    # Spring Boot backend
│   ├── src/main/java/
│   │   └── com/it342/moneymap/
│   │       ├── MoneymapApplication.java
│   │       ├── config/         # Security configurations
│   │       ├── controller/     # REST controllers
│   │       ├── entity/         # JPA entities
│   │       ├── repository/     # Data repositories
│   │       └── service/        # Business logic
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── pom.xml
│   └── target/
├── web/                        # React web frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── context/            # Context API
│   │   ├── pages/              # Page components
│   │   ├── assets/             # Images and static files
│   │   └── index.js
│   ├── package.json
│   └── public/
├── mobile/                     # Mobile app (placeholder)
├── docs/                       # Documentation
└── README.md
```

---

## Getting Started Quick Start

1. **Start MySQL Database:**
   ```bash
   # Ensure MySQL is running and database 'moneymap_db' is created
   ```

2. **Start Backend:**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

3. **In a new terminal, start Web Frontend:**
   ```bash
   cd web
   npm install
   npm start
   ```

4. Open browser to `http://localhost:3000`

---

## Development Notes

- CORS is enabled on the backend for cross-origin requests from the frontend
- Spring Security is configured for protecting API endpoints
- Database migrations are handled by Hibernate (ddl-auto: update)
- Lombok is used to reduce boilerplate code

---

## Troubleshooting

### Backend Issues
- Ensure MySQL is running and accessible
- Check database credentials in `application.properties`
- Verify Java version: `java -version` (should be 17+)
- Clear Maven cache: `mvn clean`

### Frontend Issues
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear npm cache: `npm cache clean --force`
- Verify backend is running on port 8081

---

## Team Information
- **Project:** MoneyMap
- **Course:** IT342
- **Group:** G5 (Tuazon)
- **Version:** 0.0.1

---

## License
[To be determined]
