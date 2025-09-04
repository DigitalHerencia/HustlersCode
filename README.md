<!-- HustlersCode - Street Business Analytics -->

<h1 align="center">💰 HustlersCode 📊</h1>

<p align="center">
  <b>Next-Level Street Business Analytics Platform</b><br/>
  <a href="#features">Features</a> • <a href="#tech-stack">Tech Stack</a> • <a href="#getting-started">Getting Started</a> • <a href="#the-code">The Code</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/TypeScript-blue?logo=typescript" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/PostgreSQL-Powered-336791?logo=postgresql" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Status-Getting%20Money-gold" alt="Status"/>
</p>

---

> **HustlersCode** is the ultimate street-smart business analytics platform. Track your inventory, manage your clients, handle transactions, and analyze your profits like a boss. Built for entrepreneurs who understand that knowledge is power and data is money. 💯

---

## 🔥 Features

- **💳 Cash Register:** Lightning-fast POS system with smart pricing and payment tracking
- **📦 Inventory Management:** Track your products, costs, and profits down to the gram
- **🤝 Client Management:** Keep tabs on who owes you and collect your money on time
- **📊 Business Analytics:** Real-time dashboards showing profit margins and performance
- **🎯 Pricing Scenarios:** Test different pricing strategies to maximize your hustle
- **📱 Mobile Ready:** Run your business from anywhere with responsive design
- **🌙 Street Mode:** Dark theme optimized for late-night operations
- **⚡ Fast AF:** Built with Next.js for blazing speed and reliability

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components:** shadcn/ui with custom gangster theming
- **Database:** PostgreSQL (Neon DB), Prisma ORM  
- **Styling:** Custom CSS with street-inspired color scheme
- **Fonts:** Permanent Marker (graffiti style) + Inter (clean business)
- **Analytics:** Real-time profit tracking and business intelligence
- **Deployment:** Vercel-ready with edge optimization

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (the foundation)
- PostgreSQL database (Neon DB recommended)
- A hustle mindset 😤

### Quick Setup

```bash
# Clone the repo
git clone https://github.com/DigitalHerencia/HustlersCode.git
cd HustlersCode

# Install dependencies
npm install

# Set up your environment
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL
```

### Environment Variables

Create a `.env.local` file with your database connection:

```env
DATABASE_URL="postgresql://username:password@host:port/database"
```

### Database Setup

```bash
# Initialize the database
npx prisma migrate dev --name init

# Seed with starter data
npm run seed
```

### Launch Your Empire

```bash
# Start the development server
npm run dev

# Open http://localhost:3000 and start making money
```

---

## 📈 The Code

### Database Schema

Built on Prisma ORM with business-focused models:

- **BusinessData:** Your empire's core settings and configuration
- **InventoryItem:** Product catalog with cost tracking and profit margins  
- **Customer:** Client database with payment history and debt tracking
- **Transaction:** Every sale, every payment, every move tracked
- **Payment:** Money in, money out - all accounted for
- **Scenario:** Test pricing strategies before you commit
- **Account:** Financial accounts and cash flow management

### Key Components

- **Cash Register:** The heart of daily operations
- **Customer Analytics:** Know your clients, collect your money
- **Inventory Tracker:** Never run out, never lose profit
- **Hustle Stats:** Real-time business intelligence
- **Profit Dashboard:** See where your money comes from

---

## 🎨 Design Philosophy

HustlersCode combines street-smart functionality with clean, professional design:

- **Color Scheme:** Gold, blood red, midnight black, smoke gray
- **Typography:** Permanent Marker for headers, Inter for business
- **Sharp Edges:** No rounded corners - we keep it real
- **Dark Mode:** Optimized for late-night operations
- **Mobile First:** Business doesn't stop when you're on the move

---

## 🚀 Deployment

Deploy to Vercel in minutes:

1. Push your code to GitHub
2. Connect to Vercel
3. Add your environment variables
4. Deploy and start collecting that money!

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## 📚 Documentation

- **User Guide:** See the `/docs` folder for operational guides
- **API Reference:** Built-in API routes for data management
- **Component Library:** Reusable components with street style

---

## 💪 The Hustle Never Stops

- **Branch Strategy:** `feature/new-hustle`, `fix/money-problems`
- **Code Quality:** ESLint, TypeScript strict mode
- **Performance:** Optimized for speed and reliability
- **Security:** Your data stays secure, your business stays private

---

<p align="center">
  <b>HustlersCode – Where Data Meets Street Smarts 💰📊</b><br/>
  <em>Remember: Knowledge is power, but applied knowledge is profit.</em>
</p>

---

## 📄 License

MIT License - Build your empire, share the knowledge.

<!-- End of README -->
