# DailyDev Backend API

Backend API server for the DailyDev learning platform built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **Journal Management**: Create, read, update, delete journal entries
- **Task Management**: Full CRUD operations for tasks with priorities and categories
- **Course Management**: Track learning progress and course completion
- **Data Validation**: Comprehensive input validation using express-validator
- **Security**: Helmet, CORS, rate limiting, and secure headers
- **Error Handling**: Centralized error handling with meaningful messages

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository and navigate to server directory:**

   ```bash
   cd daily-dev-jurney/server
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   ```bash
   cp env.example .env
   ```

   Edit `.env` file with your configuration:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/dailydev
   JWT_SECRET=your-super-secret-jwt-key
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start MongoDB** (if using local MongoDB):

   ```bash
   # On Windows
   mongod

   # On macOS/Linux
   sudo systemctl start mongod
   ```

5. **Run the server:**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 📚 API Endpoints

### Authentication

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| POST   | `/api/auth/register` | Register new user   |
| POST   | `/api/auth/login`    | Login user          |
| GET    | `/api/auth/me`       | Get current user    |
| PUT    | `/api/auth/profile`  | Update user profile |
| POST   | `/api/auth/logout`   | Logout user         |

### Users

| Method | Endpoint              | Description         |
| ------ | --------------------- | ------------------- |
| GET    | `/api/users/profile`  | Get user profile    |
| PUT    | `/api/users/profile`  | Update user profile |
| PUT    | `/api/users/password` | Change password     |
| DELETE | `/api/users/account`  | Delete account      |
| GET    | `/api/users/stats`    | Get user statistics |

### Journal

| Method | Endpoint                     | Description                |
| ------ | ---------------------------- | -------------------------- |
| GET    | `/api/journal`               | Get all journal entries    |
| POST   | `/api/journal`               | Create new journal entry   |
| GET    | `/api/journal/:id`           | Get specific journal entry |
| PUT    | `/api/journal/:id`           | Update journal entry       |
| DELETE | `/api/journal/:id`           | Delete journal entry       |
| GET    | `/api/journal/stats/summary` | Get journal statistics     |

### Tasks

| Method | Endpoint                   | Description            |
| ------ | -------------------------- | ---------------------- |
| GET    | `/api/tasks`               | Get all tasks          |
| POST   | `/api/tasks`               | Create new task        |
| GET    | `/api/tasks/:id`           | Get specific task      |
| PUT    | `/api/tasks/:id`           | Update task            |
| DELETE | `/api/tasks/:id`           | Delete task            |
| PATCH  | `/api/tasks/:id/toggle`    | Toggle task completion |
| GET    | `/api/tasks/stats/summary` | Get task statistics    |

### Courses

| Method | Endpoint                     | Description            |
| ------ | ---------------------------- | ---------------------- |
| GET    | `/api/courses`               | Get all courses        |
| POST   | `/api/courses`               | Create new course      |
| GET    | `/api/courses/:id`           | Get specific course    |
| PUT    | `/api/courses/:id`           | Update course          |
| DELETE | `/api/courses/:id`           | Delete course          |
| PATCH  | `/api/courses/:id/progress`  | Update course progress |
| GET    | `/api/courses/stats/summary` | Get course statistics  |

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📝 Request Examples

### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login User

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Journal Entry

```bash
curl -X POST http://localhost:5000/api/journal \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "learned": "Today I learned React hooks",
    "challenges": "Understanding useEffect dependencies",
    "timeSpent": 120
  }'
```

### Create Task

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "title": "Complete React project",
    "description": "Finish the todo app",
    "priority": "גבוה",
    "category": "לימודים"
  }'
```

### Create Course

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "name": "React Fundamentals",
    "description": "Learn React basics",
    "duration": 480,
    "type": "תכנות",
    "difficulty": "מתחיל"
  }'
```

## 🗄️ Database Models

### User

- `name`: String (required)
- `email`: String (required, unique)
- `password`: String (required, hashed)
- `avatar`: String (default: 👤)
- `isActive`: Boolean (default: true)
- `lastLogin`: Date

### JournalEntry

- `user`: ObjectId (ref: User)
- `learned`: String (required)
- `challenges`: String (required)
- `timeSpent`: Number (required, minutes)
- `mood`: String (enum)
- `tags`: [String]
- `isPublic`: Boolean

### Task

- `user`: ObjectId (ref: User)
- `title`: String (required)
- `description`: String
- `priority`: String (enum)
- `status`: String (enum)
- `category`: String (enum)
- `dueDate`: Date
- `estimatedTime`: Number (minutes)
- `actualTime`: Number (minutes)
- `tags`: [String]

### Course

- `user`: ObjectId (ref: User)
- `name`: String (required)
- `description`: String
- `duration`: Number (required, minutes)
- `type`: String (enum)
- `progress`: Number (0-100)
- `status`: String (enum)
- `difficulty`: String (enum)
- `platform`: String
- `url`: String
- `startDate`: Date
- `endDate`: Date
- `rating`: Number (1-5)
- `notes`: String
- `tags`: [String]

## 🔧 Development

### Project Structure

```
server/
├── models/          # MongoDB models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── server.js        # Main server file
├── package.json     # Dependencies
└── README.md        # This file
```

### Available Scripts

- `npm start`: Start production server
- `npm run dev`: Start development server with nodemon
- `npm test`: Run tests (not implemented yet)

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dailydev
JWT_SECRET=your-super-secret-production-key
FRONTEND_URL=https://your-frontend-domain.com
```

### Recommended Platforms

- **Backend**: Railway, Heroku, DigitalOcean
- **Database**: MongoDB Atlas
- **Frontend**: Vercel, Netlify

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Input Validation**: Comprehensive validation using express-validator
- **CORS**: Configured for specific origins
- **Rate Limiting**: Prevents abuse
- **Helmet**: Security headers
- **Error Handling**: No sensitive information in error messages

## 📊 Health Check

Check if the server is running:

```bash
curl http://localhost:5000/api/health
```

Response:

```json
{
  "status": "OK",
  "message": "DailyDev API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support, please open an issue in the repository or contact the development team.
