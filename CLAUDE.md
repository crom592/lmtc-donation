# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a donation ticket system for 구리 성광교회 LMTC 4기 (Guri Sungkwang Church LMTC 4th) mission trip fundraising. The system will issue and manage digital tickets that can be used at church bazaars and cafes.

## Current Status

**Planning Phase** - Only PRD document exists (lmtc-ticket-prd.md). No code implementation yet.

## Planned Tech Stack

Based on PRD specifications:

### Frontend
- Next.js 14 (App Router)
- Tailwind CSS + shadcn/ui
- React Context API for state management
- qrcode.js and jsqr for QR code functionality

### Backend
- Next.js API Routes
- Neon PostgreSQL database
- Prisma ORM

### Infrastructure
- Vercel hosting
- Vercel-provided SSL

## Key System Components

### User Types
1. **구매자 (Buyer)**: Church members purchasing donation tickets
2. **판매자 (Seller)**: Bazaar/cafe operators scanning and redeeming tickets
3. **관리자 (Admin)**: LMTC team managing the system

### Core Features
1. **Ticket Purchase System**: Select tickets → Enter info → Payment guide → Receive QR code
2. **QR Code Management**: Unique QR codes for each ticket with status tracking
3. **Redemption System**: QR scanning and usage processing
4. **Admin Dashboard**: Real-time statistics and transaction management

## Database Schema

Main tables planned:
- `users`: User information and roles
- `ticket_types`: Different ticket categories and prices
- `orders`: Purchase records
- `tickets`: Individual tickets with QR codes
- `usage_logs`: Ticket redemption history

## Development Commands

Since this is a Next.js project (once implemented), typical commands will be:

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Database operations (with Prisma)
npx prisma generate
npx prisma db push
npx prisma migrate dev
```

## Important Considerations

1. **Mobile-First Design**: Primary users will access via smartphones
2. **Korean Language**: All user interfaces should be in Korean
3. **Security**: QR codes need hash verification to prevent forgery
4. **Offline Handling**: System should work with intermittent connectivity
5. **Payment Flow**: Manual bank transfer confirmation (no automatic payment gateway initially)

## Project Structure (Recommended)

```
/
├── app/                    # Next.js 14 App Router pages
│   ├── api/               # API routes
│   ├── (buyer)/           # Buyer pages
│   ├── (seller)/          # Seller pages
│   └── admin/             # Admin dashboard
├── components/            # React components
├── lib/                   # Utility functions
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

## Key Files to Reference

- `lmtc-ticket-prd.md`: Complete product requirements and specifications