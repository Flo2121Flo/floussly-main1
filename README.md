# Floussly - Modern Financial Platform

Floussly is a comprehensive financial platform that provides secure and efficient money management solutions.

## 🚀 Features

- Secure user authentication and authorization
- Real-time transaction monitoring
- AML (Anti-Money Laundering) compliance
- Multi-currency support
- Mobile-first responsive design
- RTL (Right-to-Left) support for Arabic
- Comprehensive security measures
- Real-time notifications
- Transaction history and analytics

## 🛠️ Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Ant Design for UI components
- React Query for data fetching
- React Router for navigation
- i18next for internationalization

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL with Prisma ORM
- Redis for caching and session management
- JWT for authentication
- Winston for logging

### Security
- Content Security Policy (CSP)
- Rate limiting
- Input validation and sanitization
- CSRF protection
- Secure session management
- Password encryption
- 2FA support

## 📁 Project Structure

```
floussly/
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── config/         # Configuration files
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   ├── pages/          # Page components
│   │   └── i18n/           # Internationalization files
│   └── public/             # Static assets
│
├── server/                 # Backend application
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Express middleware
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   └── validations/        # Input validation schemas
│
├── shared/                 # Shared types and utilities
├── .github/               # GitHub workflows
└── deployment/            # Deployment configurations
```

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Session management
- Password policies
- 2FA support

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Secure storage

### Monitoring & Compliance
- AML monitoring
- Transaction pattern detection
- Suspicious activity alerts
- Audit logging
- Rate limiting

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL
- Redis
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/floussly.git
cd floussly
```

2. Install dependencies:
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Set up environment variables:
```bash
# Create .env files
cp .env.example .env
cp client/.env.example client/.env
cp server/.env.example server/.env
```

4. Start the development servers:
```bash
# Start the backend server
cd server
npm run dev

# Start the frontend server
cd ../client
npm run dev
```

## 📝 API Documentation

The API documentation is available at `/api/docs` when running the server in development mode.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run client tests
cd client
npm test

# Run server tests
cd server
npm test
```

## 🚀 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, email support@floussly.com or join our Slack channel. 