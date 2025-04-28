# Floussly

A modern web application built with TypeScript, React, and Node.js.

## Features

- TypeScript for type safety
- React for frontend
- Node.js with Express for backend
- Redis for caching and token storage
- Jest for testing
- ESLint and Prettier for code quality

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Redis server

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/floussly.git
cd floussly
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
REDIS_URL=redis://localhost:6379
```

## Development

Start the development server:
```bash
npm run dev
# or
yarn dev
```

## Testing

Run tests:
```bash
npm test
# or
yarn test
```

## Building for Production

Build the application:
```bash
npm run build
# or
yarn build
```

Start the production server:
```bash
npm start
# or
yarn start
```

## Project Structure

```
floussly/
├── client/           # React frontend
├── server/           # Node.js backend
│   ├── redis/        # Redis service
│   └── public/       # Static files
├── tests/            # Test files
├── .env              # Environment variables
├── .gitignore        # Git ignore file
├── jest.config.js    # Jest configuration
├── package.json      # Project dependencies
└── README.md         # Project documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 