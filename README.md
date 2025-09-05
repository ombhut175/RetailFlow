# 🚀 Hackathon Demo2 - Quodo Learning Platform

## ⚡ Quick Start (Hackathon Mode)

### 1. First Time Setup
```bash
# Run this once
quick-setup.bat
```

### 2. Start Development
```bash
# Start everything at once
dev.bat
```

### 3. Validate Environment
```bash
node validate-env.js
```

## 🎯 Hackathon Essentials

### Development URLs
- **Frontend**: http://localhost:3656
- **Backend**: http://localhost:5099
- **API Docs**: http://localhost:5099/api/docs
- **DB Studio**: https://local.drizzle.studio

### Quick Commands
```bash
# Root level commands (use these!)
npm run dev              # Start both frontend & backend
npm run db:studio        # Open database studio
npm run db:push          # Push schema changes
npm run build            # Build everything
npm run test:backend     # Run backend tests

# Individual services
npm run dev:frontend     # Frontend only
npm run dev:backend      # Backend only
```

### 🐛 Debugging
- **Backend**: Use VS Code debugger with "Debug NestJS with Watch"
- **Frontend**: Use VS Code debugger with "Debug Fullstack (Server + Client)"
- **API Testing**: `node test-api.js`

### 📁 Project Structure
```
demo2/
├── frontend/          # Next.js 15 + React 19
├── backend/           # NestJS + PostgreSQL
├── dev.bat           # Start everything
├── quick-setup.bat   # First-time setup
└── validate-env.js   # Environment checker
```

### 🔧 Tech Stack
- **Frontend**: Next.js 15, React 19, TailwindCSS, TypeScript
- **Backend**: NestJS, PostgreSQL, Drizzle ORM, Supabase
- **Auth**: Supabase Auth with custom NestJS integration
- **Deployment**: Vercel (Frontend) + Render.com (Backend)

### 🚨 Troubleshooting
1. **Environment issues**: Run `node validate-env.js`
2. **Dependencies**: Run `quick-setup.bat`
3. **Database**: Run `npm run db:push`
4. **API not working**: Run `node test-api.js`

---
*Optimized for 4-hour hackathon development* 🏆