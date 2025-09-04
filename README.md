# Retail Analytics Utility

A comprehensive retail analytics tool for tracking inventory, customers, sales, and profitability.

## Features

- Pricing scenario analysis
- Inventory management
- Customer relationship management
- Accounts receivable tracking
- Cash register functionality
- Sales and profit tracking

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL (Neon DB)
- shadcn/ui components

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (Neon DB)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

\`\`\`
DATABASE_URL="postgresql://username:password@host:port/database"
\`\`\`

### Installation

1. Clone the repository
2. Install dependencies:

\`\`\`bash
npm install
\`\`\`

3. Set up the database:

\`\`\`bash
npx prisma migrate dev --name init
\`\`\`

4. Seed the database with initial data:

\`\`\`bash
npm run seed
\`\`\`

5. Run the development server:

\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses Prisma ORM with the following models:

- BusinessData: Core business settings
- Scenario: Pricing scenarios for analysis
- Salesperson: Sales team members and commission tracking
- InventoryItem: Product inventory tracking
- Customer: Customer information and payment history
- Payment: Payment records
- Transaction: Sales and payment transactions
- Account: Financial accounts

## Deployment

This application can be deployed to Vercel:

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy!
