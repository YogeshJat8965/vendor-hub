# Marketplace Platform - Backend

## Tech Stack
- **Framework:** Spring Boot 3.2.5
- **Language:** Java 17
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** Spring Security with BCrypt password hashing

## Prerequisites
- Java 17 or higher
- Maven 3.6+
- MongoDB (local or cloud instance)

## Environment Variables
Create a `.env` file or set these environment variables:

```bash
MONGODB_URI=mongodb://localhost:27017/marketplace
JWT_SECRET=YourSecretKeyHere (min 256 bits)
ALLOWED_ORIGINS=http://localhost:3000
```

## Installation

```bash
# Build the project
mvn clean package -DskipTests

# Run the application
java -jar target/marketplace-backend-1.0.0.jar

# Or use Maven
mvn spring-boot:run
```

## Phase 1 - Completed ✅
- [x] Project structure created
- [x] MongoDB models created (User, Vendor, QuoteRequest, Review, etc.)
- [x] Configuration files setup
- [x] Main application class

## API Endpoints (Coming in Phase 2+)
Documentation will be added as phases are completed.

## Testing
```bash
# Run all tests
mvn test

# Run with coverage
mvn verify
```

## Development Phases
- **Phase 1:** Project Setup & Core Models ✅
- **Phase 2:** Authentication & Security (Next)
- **Phase 3:** Vendor Management
- **Phase 4:** Quote & Review System
- **Phase 5:** Admin & Advanced Features

## Port
Backend runs on: `http://localhost:8080`
