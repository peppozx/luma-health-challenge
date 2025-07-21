# Patient Waitlist Optimization System

A smart patient prioritization system that optimizes hospital appointment scheduling by ranking patients based on their likelihood to accept waitlist offers.

## 🎯 Overview

This system addresses the inefficiency in hospital appointment scheduling where staff members waste time calling patients who don't respond or decline offers. By implementing a sophisticated scoring algorithm that combines demographic and behavioral data, the system helps medical staff prioritize patients who are most likely to accept appointments.

## 🏗️ Architecture

```
luma-health-challenge/
├── src/
│   ├── domain/                 # Core business logic (no external dependencies)
│   │   ├── entities/          # Business entities
│   │   ├── repositories/      # Repository interfaces
│   │   └── services/          # Domain services
│   ├── application/           # Application business rules
│   │   ├── use-cases/         # Application use cases
│   │   └── dto/              # Data transfer objects
│   ├── infrastructure/        # External interfaces & frameworks
│   │   ├── repositories/      # Repository implementations
│   │   ├── api/              # REST API layer
│   │   │   ├── controllers/   # Request handlers
│   │   │   ├── documentation/ # OpenAPI/Swagger setup
│   │   │   ├── middlewares/   # Express middlewares
│   │   │   ├── routes/        # Route definitions
│   │   │   └── validations/   # Zod validation schemas
│   │   ├── config/           # Configuration files
│   │   └── server/           # Server utilities
│   ├── shared/               # Shared utilities
│   │   ├── errors/           # Custom error classes
│   │   └── utils/            # Utility functions
│   ├── app.ts                # Express app setup
│   ├── server.ts             # Server initialization
│   └── index.ts              # Application entry point
├── tests/
│   ├── unit/                 # Unit tests
│   ├── integration/          # Integration tests
│   └── fixtures/             # Test data
├── Dockerfile                # Production Docker config
├── Dockerfile.dev            # Development Docker config
├── docker-compose.yml        # Docker compose configuration
├── package.json              # Node.js dependencies
├── tsconfig.json             # TypeScript configuration
├── jest.config.js            # Jest test configuration
├── eslint.config.mjs         # ESLint configuration
└── nodemon.json              # Nodemon configuration
```

## 📋 Project Structure Details

### Domain Layer (`/src/domain`)
The heart of the application containing pure business logic with no external dependencies.

- **entities/**: Core business entities (Patient, Facility, ScoredPatient)
- **repositories/**: Repository interfaces defining data access contracts
- **services/**: Domain services implementing business rules (ScoringService, DistanceCalculator)

### Application Layer (`/src/application`)
Orchestrates the flow of data and coordinates domain layer components.

- **use-cases/**: Application-specific business rules (GetPrioritizedPatients)
- **dto/**: Data Transfer Objects for API responses

### Infrastructure Layer (`/src/infrastructure`)
Handles external concerns and framework-specific implementations.

- **repositories/**: Concrete implementations of repository interfaces
- **api/**: REST API implementation using Express.js
- **config/**: Application configuration and environment setup

### Shared Layer (`/src/shared`)
Cross-cutting concerns used across all layers.

- **errors/**: Custom error types for better error handling
- **utils/**: Utility functions and helpers

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Docker (optional, for containerized deployment)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd luma-health-challenge
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

### Running the Application

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

The API will be available at `http://localhost:3000`

**API Documentation:**
- Swagger UI: `http://localhost:3000/api-docs`
- OpenAPI JSON: `http://localhost:3000/api-docs.json`

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Linting

```bash
npm run lint
```

## 📊 Scoring Algorithm

The scoring system evaluates patients on a scale of 1-10 based on:

### Demographic Factors (20%)
- **Age (10%)**: Optimized for 30-65 age range
- **Distance to Facility (10%)**: Closer patients score higher

### Behavioral Factors (80%)
- **Accepted Offers (30%)**: Historical acceptance rate
- **Canceled Offers (30%)**: Historical cancellation rate
- **Average Reply Time (20%)**: Responsiveness to previous offers

### Fairness Mechanism
Patients with limited interaction history receive a random boost (up to 20%) to ensure fair opportunity for new patients.

## 🔌 API Documentation

### Interactive Documentation
Visit `http://localhost:3000/api-docs` for interactive Swagger UI documentation with live API testing.

### Endpoints

#### `POST /api/patients/prioritized`
Returns a prioritized list of 10 patients most likely to accept appointments.

**Request Body:**
```json
{
  "facility": {
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  }
}
```

**Response:**
```json
{
  "patients": [
    {
      "id": "uuid",
      "name": "John Doe",
      "score": 8.5,
      "distance": 12.3,
      "demographicScore": 9.0,
      "behavioralScore": 8.3
    }
  ]
}
```

## 🧪 Testing Strategy

- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test API endpoints and data flow

## 🐳 Docker Support

Build and run with Docker:

```bash
docker compose up (api-dev | api)
```

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Validation**: Zod (schema validation)
- **Testing**: Jest
- **Development**: Nodemon, ts-node
- **Containerization**: Docker

## 📈 Performance Considerations

- Algorithm complexity: ~ O(n) due to sorting
- Suitable for datasets up to 10,000 patients
- For larger datasets, consider implementing:
  - Caching mechanisms
  - Database indexing
  - Spatial data structures for geographic queries
