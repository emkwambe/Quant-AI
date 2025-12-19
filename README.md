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

### Free Tier
- Create classrooms with unique join codes
- K-5 grade levels
- Start math heats with 3 difficulty levels (Warm Up, Practice, Challenge)
- View real-time results and leaderboards
- Basic student tracking

### Pro Tier ($5/mo or $40/yr)
- All grade levels (K-8)
- Historical student tracking (30-day trends)
- Performance analytics and skill breakdown
- Export results to CSV
- Class vs Class competition mode

### For Students
- Join class with 6-character code
- Compete in 2-minute math races
- See live feedback on answers
- View rankings on podium after each heat

## Tech Stack

- **Backend:** Node.js, Express, SQLite (better-sqlite3), Stripe
- **Frontend:** Preact, Vite
- **Auth:** Cookie-based sessions, bcrypt for password hashing

## Project Structure

```
├── server/
│   ├── db/           # Database schema and connection
│   ├── middleware/   # Auth middleware
│   ├── routes/
│   │   ├── auth.js         # Teacher authentication
│   │   ├── classrooms.js   # Classroom management
│   │   ├── students.js     # Student join flow
│   │   ├── heats.js        # Competition engine
│   │   ├── analytics.js    # Pro: Performance tracking
│   │   ├── subscriptions.js # Pro: Stripe payments
│   │   └── challenges.js   # Pro: Class vs Class
│   └── questions/    # Question generator (55 templates)
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

### Analytics (Pro)
- `GET /api/analytics/student/:id` - Student performance history
- `GET /api/analytics/classroom/:id` - Classroom analytics
- `GET /api/analytics/classroom/:id/export` - Export to CSV

### Subscriptions
- `GET /api/subscriptions/status` - Get subscription status
- `POST /api/subscriptions/checkout` - Create Stripe checkout
- `POST /api/subscriptions/portal` - Billing portal

### Challenges (Pro)
- `GET /api/challenges/search` - Find opponent classrooms
- `GET /api/challenges/pending` - Pending challenges
- `POST /api/challenges/create` - Create challenge
- `POST /api/challenges/:id/accept` - Accept challenge
- `POST /api/challenges/:id/start` - Start challenge heat
- `GET /api/challenges/:id/results` - Challenge results

## Question Templates

55 templates covering K-8 curriculum:

### Grades K-2 (13 templates)
- Counting objects, skip counting (2s, 5s, 10s)
- Addition/subtraction within 5, 10, 20, 100
- Doubles

### Grades 3-5 (25 templates)
- Multi-digit addition/subtraction
- Multiplication facts, by 10/100
- Division facts, with remainder
- Mixed operations and order of operations
- Missing number problems (algebra prep)
- Squares

### Grades 6-8 (17 templates)
- Integer operations (negatives)
- Absolute value, exponents, square roots
- Percentages and fractions
- Ratios and proportions
- GCF and LCM
- Algebraic equations (1-step, 2-step)
- Distributive property
- Pythagorean theorem

## Environment Variables

```bash
# Optional: Stripe for payments
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PRICE_MONTHLY=price_xxx
STRIPE_PRICE_YEARLY=price_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Optional: Production settings
NODE_ENV=production
PORT=3000
APP_URL=https://mathathlon.com
```

## Production Deployment

```bash
# Build frontend
npm run build

# Start production server
NODE_ENV=production npm start
```

## License

MIT
