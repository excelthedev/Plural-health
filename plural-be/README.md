# Plural Backend API

A Node.js Express.js backend API with MongoDB integration.

## Features

- Express.js server
- MongoDB integration with Mongoose
- CORS enabled
- Security headers with Helmet
- Request logging with Morgan
- Environment variable configuration
- Basic API routes structure
- Error handling middleware

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:

   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration:
   - Set your MongoDB connection string
   - Configure other environment variables as needed

## Usage

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

The server will start on the port specified in your `.env` file (default: 5000).

## API Endpoints

### Base URL

- Development: `http://localhost:5000`
- Production: Your deployed URL

### Available Routes

#### General

- `GET /` - Welcome message
- `GET /health` - Health check
- `GET /api` - API information

#### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

#### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Project Structure

```
plural-be/
├── routes/
│   ├── index.js          # Main router
│   ├── authRoutes.js     # Authentication routes
│   └── userRoutes.js     # User routes
├── server.js             # Main server file
├── package.json          # Dependencies and scripts
├── .env.example          # Environment variables template
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## Environment Variables

| Variable    | Description               | Default                             |
| ----------- | ------------------------- | ----------------------------------- |
| PORT        | Server port               | 5000                                |
| NODE_ENV    | Environment               | development                         |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/plural-be |
| JWT_SECRET  | JWT secret key            | -                                   |
| JWT_EXPIRE  | JWT expiration time       | 7d                                  |
| CORS_ORIGIN | CORS origin               | http://localhost:3000               |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

## License

ISC
