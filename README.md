# TechAssist AI

An AI-powered technical assistance application for job management, parts identification, and service workflow optimization.

## Features

- 🤖 **AI-Powered Diagnostics**: Use OpenAI Vision API to identify parts and issues from photos
- 📱 **Mobile-First Design**: Responsive interface optimized for mobile technicians
- 🗺️ **Interactive Maps**: Mapbox integration for job locations and nearby hardware stores
- 📊 **Job Management**: Complete workflow from scheduling to invoicing
- 🔊 **Speech Recognition**: Voice-to-text for hands-free note taking
- 📷 **Photo Analysis**: Capture and analyze equipment photos
- 💰 **Parts Search**: Find nearby hardware stores and pricing
- 📋 **Digital Invoicing**: Generate professional invoices

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **AI/ML**: OpenAI GPT-4 Vision API
- **Maps**: Mapbox GL JS
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Build Tool**: Vite
- **Runtime**: Node.js

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- OpenAI API key
- Mapbox access token

### Installation

1. **Clone and setup**
   ```bash
   cd TechAssistAI
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your actual API keys and database URL
   ```

3. **Database Setup**
   ```bash
   npm run db:push
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open Application**
   ```
   http://localhost:5000
   ```

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `OPENAI_API_KEY` | OpenAI API key for AI features | Yes |
| `MAPBOX_ACCESS_TOKEN` | Mapbox token for maps | Yes |
| `SESSION_SECRET` | Session encryption key | Yes |
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | Server port (default: 5000) | No |

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run check        # TypeScript type checking
npm run db:push      # Push database schema changes
```

## Project Structure

```
TechAssistAI/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and configurations
├── server/                # Express backend
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data layer
│   └── vite.ts           # Vite integration
├── shared/                # Shared types and schemas
└── migrations/           # Database migrations
```

## API Endpoints

### Jobs
- `GET /api/jobs` - List all jobs
- `GET /api/jobs/:id` - Get job details
- `PATCH /api/jobs/:id/update-wo` - Update work order number

### Photos
- `POST /api/photos` - Upload photo
- `POST /api/photos/:id/analyze` - Analyze photo with AI

### Notes
- `GET /api/jobs/:id/notes` - Get job notes
- `POST /api/notes` - Create note
- `POST /api/notes/:id/enhance` - Enhance note with AI

### Maps & Parts
- `GET /api/mapbox-token` - Get Mapbox token
- `GET /api/parts/search` - Search for parts
- `GET /api/stores/nearby` - Find nearby stores

## Key Features

### AI Photo Analysis
Upload photos of equipment or issues to get:
- Part identification
- Problem diagnosis
- Repair recommendations
- Cost estimates

### Smart Job Management
- Work order tracking
- Customer information
- Service notes with AI enhancement
- Photo documentation
- Estimate generation

### Mobile-Optimized Interface
- Touch-friendly controls
- Offline capability
- GPS integration
- Camera integration

## Development

### Adding New Components
```bash
# UI components go in client/src/components/ui/
# Feature components go in client/src/components/[feature]/
```

### Database Changes
```bash
# Modify shared/schema.ts
npm run db:push
```

### API Routes
```bash
# Add routes in server/routes.ts
# Follow existing patterns for consistency
```

## Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Setup
- Configure production database
- Set secure session secrets
- Use HTTPS in production
- Configure CORS for your domain

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## Security

- All API keys are environment variables
- Session data is encrypted
- Input validation on all endpoints
- CORS configured for production

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Check the documentation
- Review existing issues
- Create new issue with detailed description

---

Built with ❤️ for field technicians and service professionals