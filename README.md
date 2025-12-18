# Mathathlon

Real-time competitive math platform for K-8 classrooms.

## Quick Start

```bash
# Install dependencies
npm install

# Start development servers (backend + frontend)
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000

## Features

### For Teachers
- Create classrooms with unique join codes
- Start math heats with 3 difficulty levels (Warm Up, Practice, Challenge)
- View real-time results and leaderboards
- Track student progress

### For Students
- Join class with 6-character code
- Compete in 2-minute math races
- See live feedback on answers
- View rankings on podium after each heat

## Tech Stack

- **Backend:** Node.js, Express, SQLite (better-sqlite3)
- **Frontend:** Preact, Vite
- **Auth:** Cookie-based sessions, bcrypt for password hashing

## Project Structure

```
├── server/
│   ├── db/           # Database schema and connection
│   ├── middleware/   # Auth middleware
│   ├── routes/       # API endpoints
│   └── questions/    # Question generator (25 templates)
├── client/
│   ├── src/
│   │   ├── pages/    # Page components
│   │   ├── components/
│   │   └── api/      # API client
│   └── index.html
└── data/             # SQLite database (auto-created)
```

## API Endpoints

### Auth
- `POST /api/auth/signup` - Teacher registration
- `POST /api/auth/login` - Teacher login
- `GET /api/auth/me` - Get current teacher
- `POST /api/auth/logout` - Logout

### Classrooms
- `GET /api/classrooms` - List teacher's classrooms
- `POST /api/classrooms` - Create classroom
- `GET /api/classrooms/:id` - Get classroom with students
- `GET /api/classrooms/join/:code` - Get classroom by join code

### Students
- `POST /api/students/join` - Join classroom
- `GET /api/students/me` - Get current student
- `POST /api/students/leave` - Leave classroom

### Heats
- `POST /api/heats/start` - Start a heat (teacher)
- `GET /api/heats/active` - Get active heat for student
- `POST /api/heats/answer` - Submit answer
- `POST /api/heats/:id/end` - End heat (teacher)
- `GET /api/heats/:id/results` - Get heat results

## Question Templates

25 templates covering grades 3-5:
- Addition (simple, 2-digit, 3-digit, with/without carrying)
- Subtraction (simple, 2-digit, 3-digit, with/without borrowing)
- Multiplication (facts, by 10/100, 2-digit × 1-digit)
- Division (facts, 2-digit, with remainder)
- Mixed operations and order of operations
- Missing number problems (algebra prep)

## Production Deployment

```bash
# Build frontend
npm run build

# Start production server
NODE_ENV=production npm start
```

## License

MIT
