# Floussly - Moroccan Fintech Application

A modern fintech application built with React, TypeScript, Node.js, and Express, focusing on stability, reliability, and performance.

## Features

- **Enhanced Error Handling**: Comprehensive error handling system with custom error classes and detailed error logging
- **Circuit Breaker Pattern**: Robust implementation for external service calls with fallback mechanisms
- **Advanced Caching**: Redis-based caching system with configurable TTL and cache invalidation strategies
- **Metrics Collection**: Prometheus integration for collecting and monitoring various metrics
- **Health Checks**: Detailed health check endpoints for monitoring system status
- **Security**: Implemented security best practices including rate limiting, CORS, and helmet
- **Logging**: Structured logging with Winston and CloudWatch integration

## Tech Stack

- **Frontend**: React, TypeScript, Material-UI
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Cache**: Redis
- **Monitoring**: Prometheus, CloudWatch
- **Containerization**: Docker
- **Cloud**: AWS

## Prerequisites

- Node.js >= 14
- PostgreSQL >= 12
- Redis >= 6
- Docker (optional)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/floussly.git
cd floussly
```

2. Install dependencies:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables:
```bash
# Server
cp server/.env.example server/.env
# Edit server/.env with your configuration

# Client
cp client/.env.example client/.env
# Edit client/.env with your configuration
```

4. Start the development servers:
```bash
# Start server
cd server
npm run dev

# Start client
cd ../client
npm start
```

## Project Structure

```
floussly/
├── client/                 # React frontend
├── server/                 # Node.js backend
│   ├── config/            # Configuration files
│   ├── middleware/        # Express middleware
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   └── app.ts             # Express application
└── docker/                # Docker configuration
```

## API Documentation

The API documentation is available at `/api-docs` when running the server.

### Key Endpoints

- `/health` - Health check endpoint
- `/metrics` - Prometheus metrics endpoint
- `/api/auth` - Authentication endpoints
- `/api/users` - User management
- `/api/transactions` - Transaction management
- `/api/banking` - Banking integration

## Monitoring

The application includes comprehensive monitoring:

- **Metrics**: Available at `/metrics` endpoint
- **Health Checks**: Available at `/health` endpoint
- **Logging**: Structured logs with Winston
- **Error Tracking**: Enhanced error handling with detailed context

## Security Features

- Rate limiting
- CORS protection
- Helmet security headers
- API key validation
- Request sanitization
- Circuit breaker pattern for external services

## Development

### Running Tests

```bash
# Server tests
cd server
npm test

# Client tests
cd ../client
npm test
```

### Code Style

The project uses ESLint and Prettier for code formatting:

```bash
# Server
cd server
npm run lint
npm run format

# Client
cd ../client
npm run lint
npm run format
```

## Deployment

### Docker

Build and run with Docker:

```bash
docker-compose up --build
```

### Manual Deployment

1. Build the client:
```bash
cd client
npm run build
```

2. Start the server:
```bash
cd server
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@floussly.com or open an issue in the GitHub repository. 