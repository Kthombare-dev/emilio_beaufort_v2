# Emilio Beaufort - Codebase Documentation

## 🏗️ Project Overview

**Emilio Beaufort** is a luxury grooming brand's complete digital presence featuring a sophisticated full-stack web application with a decoupled architecture. The project consists of a NestJS backend API and a Next.js frontend, designed with a premium, minimalist aesthetic targeting the luxury grooming market.

## 📋 Quick Facts

- **Project Type**: Full-stack luxury e-commerce web application
- **Architecture**: Decoupled (separate frontend and backend)
- **Backend**: NestJS + Prisma + PostgreSQL
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Design**: Monochrome palette with muted gold accents
- **Typography**: Playfair Display (headings) + Inter (body)

## 🏗️ Architecture Overview

```
emilio_beaufort_v2/
├── backend/          # NestJS API server
│   ├── src/
│   │   ├── products/           # Product management
│   │   ├── posts/              # Journal/blog posts
│   │   ├── partnership-inquiries/  # Partnership form handling
│   │   ├── prisma/             # Database layer
│   │   └── analytics/          # Google Analytics integration
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   └── test/                   # E2E tests
└── frontend/         # Next.js application
    ├── app/          # App router pages & API routes
    ├── components/   # Reusable UI components
    ├── lib/          # Utilities and integrations
    ├── contexts/     # React contexts
    └── functions/    # Firebase functions
```

## 🎯 Core Features

### Backend Features
- **Product Catalog**: Complete product management with featured items
- **Blog System**: Journal/blog post management with rich content
- **Partnership Inquiries**: Form handling for business partnerships
- **Analytics Integration**: Google Analytics data collection
- **Database Management**: Prisma ORM with PostgreSQL
- **API Optimization**: Combined endpoints for efficient data fetching

### Frontend Features
- **Single Page Application**: Smooth scrolling with anchor navigation
- **Responsive Design**: Mobile-first approach for all devices
- **Admin Dashboard**: Complete content management system
- **AI Blog Generation**: Gemini AI integration for automated blog creation
- **E-commerce Features**: Shopping cart, order management, payment integration
- **Performance Optimizations**: Image compression, caching, preconnect links
- **Authentication**: User authentication and role-based access
- **SEO Optimization**: Comprehensive SEO implementation

## 🛠️ Technology Stack

### Backend Technologies
```json
{
  "runtime": "Node.js",
  "framework": "NestJS 11.0.1",
  "database": "PostgreSQL",
  "orm": "Prisma 6.10.1",
  "validation": "class-validator",
  "testing": "Jest",
  "analytics": "@google-analytics/data"
}
```

### Frontend Technologies
```json
{
  "framework": "Next.js 15.3.4",
  "language": "TypeScript 5+",
  "styling": "Tailwind CSS 3.4.17",
  "ui_components": "shadcn/ui + Radix UI",
  "animations": "Framer Motion 12.20.4",
  "forms": "React Hook Form + Zod",
  "state_management": "React Context",
  "notifications": "React Hot Toast + Sonner",
  "icons": "Lucide React 0.523.0"
}
```

### Third-Party Integrations
- **Firebase**: Storage, authentication, and cloud functions
- **Supabase**: Additional storage and database services
- **Google Services**: Analytics, Sheets API, Gemini AI
- **Razorpay**: Payment processing
- **Sharp**: Image compression and optimization
- **Nodemailer**: Email functionality

## 📁 Detailed Structure

### Backend Structure (`/backend/`)
```
src/
├── analytics.controller.ts     # Google Analytics endpoints
├── analytics.service.ts        # Analytics data processing
├── app.controller.ts          # Main application controller
├── app.module.ts              # Root application module
├── main.ts                    # Application entry point
├── partnership-inquiries/     # Partnership form handling
├── posts/                     # Blog/journal post management
├── prisma/                    # Database service layer
└── products/                  # Product catalog management

prisma/
└── schema.prisma              # Database schema definition
```

### Frontend Structure (`/frontend/`)
```
app/
├── layout.tsx                 # Root layout with metadata
├── page.tsx                   # Homepage (46KB+ of content)
├── globals.css                # Global styles (36KB)
├── api/                       # API routes (20 endpoints)
│   ├── admin/                 # Admin-specific APIs
│   ├── generate-blog/         # AI blog generation
│   ├── razorpay/             # Payment processing
│   └── ...                   # Various utility APIs
├── admin/                     # Admin dashboard (28 components)
├── auth/                      # Authentication pages
├── blogs/                     # Blog listing and detail pages
├── products/                  # Product catalog pages
└── ...                       # Additional pages

components/
├── ui/                        # shadcn/ui components (22 items)
├── Navbar.tsx                 # Main navigation
├── Footer.tsx                 # Site footer
├── BagModal.tsx              # Shopping cart
├── Chatbot.tsx               # AI chatbot integration
├── AuthPages.tsx             # Authentication components
└── ...                       # 35+ reusable components

lib/
├── api.ts                     # API client functions
├── auth.ts                    # Authentication utilities
├── firebase.ts                # Firebase configuration
├── supabase.ts               # Supabase integration
├── gemini.ts                 # Google Gemini AI
├── razorpay.ts               # Payment processing
├── imageCompression.ts        # Sharp image optimization
└── ...                       # 15+ utility modules
```

## 🗄️ Database Schema

### Core Models
```prisma
model admin_user {
  id         Int      @id @default(autoincrement())
  email      String   @unique
  password   String
  created_at DateTime @default(now())
}

model Product {
  id          Int      @id @default(autoincrement())
  name        String
  description String
  image_url   String?
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
}

model Post {
  id         Int      @id @default(autoincrement())
  title      String
  content    String
  image_url  String?
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
}

model PartnershipInquiry {
  id           Int      @id @default(autoincrement())
  full_name    String
  email        String   @unique
  company      String
  message      String
  inquiry_type String
  created_at   DateTime @default(now())
}

model TrackingEvent {
  id         Int      @id @default(autoincrement())
  type       String
  data       Json?
  created_at DateTime @default(now())
}
```

## 🚀 Performance Optimizations

### Applied Optimizations
1. **Preconnect Links**: 480ms performance savings through DNS prefetching
2. **Image Compression**: Sharp library for WebP conversion under 1MB
3. **Webpack Optimization**: Tree shaking, chunk splitting, vendor bundling
4. **Caching Headers**: Static assets cached for 1 year, API responses cached appropriately
5. **Font Optimization**: Google Fonts with display: swap for better loading
6. **Bundle Splitting**: Separate chunks for vendors and Framer Motion

### Next.js Configuration Highlights
```javascript
{
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    minimumCacheTTL: 60
  },
  experimental: {
    optimizePackageImports: ["framer-motion", "lucide-react"]
  },
  compress: true,
  poweredByHeader: false
}
```

## 🔌 API Endpoints

### Backend API (`NestJS`)
- `GET /api/products/featured` - Featured products
- `GET /api/posts/recent` - Recent journal posts  
- `GET /api/home` - Combined home page data
- `POST /api/partnership-inquiries` - Submit partnership inquiry
- `GET /api/analytics/*` - Google Analytics data

### Frontend API Routes (`Next.js`)
- `POST /api/admin/*` - Admin management (5 endpoints)
- `POST /api/generate-blog` - AI blog generation with Gemini
- `POST /api/generate-blog-ideas` - AI blog idea generation
- `POST /api/purchase` - Order processing
- `POST /api/razorpay/*` - Payment processing (2 endpoints)
- `POST /api/send-job-application-email` - Career applications
- `GET /api/sitemap-data` - Dynamic sitemap generation
- Various utility and testing endpoints

## 🎨 Design System

### Color Palette
- **Primary**: Monochrome (black, white, grays)
- **Accent**: Muted gold tones
- **Philosophy**: Minimalist, professional, luxury aesthetic

### Typography
- **Headings**: Playfair Display (serif, elegant)
- **Body**: Inter (sans-serif, readable)
- **Display**: Swap loading for performance

### Component Architecture
- **UI Components**: shadcn/ui + Radix UI primitives
- **Styling**: Tailwind CSS with custom configurations
- **Animations**: Framer Motion for smooth interactions
- **Icons**: Lucide React icon library

## 🔧 Development Workflow

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- PostgreSQL database

### Backend Setup
```bash
cd backend
pnpm install
cp .env.example .env  # Configure DATABASE_URL
pnpm prisma generate
pnpm prisma db push
pnpm run start:dev    # Development server on port 3001
```

### Frontend Setup  
```bash
cd frontend
pnpm install
pnpm run dev          # Development server on port 3000
```

### Build Commands
```bash
# Backend
pnpm run build        # Production build
pnpm run test         # Run tests

# Frontend  
pnpm run build        # Production build
pnpm run lint         # Lint code
```

## 🚀 Deployment & Infrastructure

### Current Setup
- **Frontend**: Optimized for Vercel/Netlify deployment
- **Backend**: NestJS production build ready
- **Database**: PostgreSQL (production ready)
- **Storage**: Firebase + Supabase for assets
- **CDN**: Next.js automatic optimization

### Performance Monitoring
- Google Analytics integration
- Performance monitoring component
- Error tracking and logging
- Cache hit rate monitoring

## 🔐 Security Features

- **Authentication**: Multi-provider auth system
- **Role-based Access**: Admin and user permissions
- **CORS Configuration**: Proper cross-origin setup
- **Input Validation**: class-validator on backend, Zod on frontend
- **Security Headers**: XSS protection, content type options
- **Rate Limiting**: API endpoint protection

## 📱 Key Features Deep Dive

### AI Blog Generation System
- **Gemini AI Integration**: Automated blog content creation
- **Image Compression**: Automatic WebP conversion under 1MB
- **Fallback System**: Multiple AI models with graceful degradation
- **Content Management**: Rich text editor with TipTap

### E-commerce Functionality
- **Shopping Cart**: Context-based state management
- **Payment Processing**: Razorpay integration
- **Order Management**: Complete order lifecycle
- **Product Catalog**: Dynamic product display

### Admin Dashboard
- **Content Management**: Full CRUD operations
- **Analytics Dashboard**: Google Analytics integration
- **User Management**: Role-based access control
- **Media Management**: Image upload and optimization

## 📊 Performance Metrics

### Optimization Results
- **Preconnect Savings**: 480ms faster resource loading
- **Image Compression**: 85%+ size reduction with WebP
- **Bundle Optimization**: Efficient code splitting
- **Cache Hit Rates**: 95%+ for static assets
- **Core Web Vitals**: Optimized for Google rankings

## 🔄 Recent Updates

Based on the git history and recent changes:
- Updated Next.js configuration for better performance
- Enhanced image optimization with Sharp library
- Fixed blog generation JSON parsing issues
- Implemented comprehensive caching strategies
- Added Nginx server-side caching setup
- Performance monitoring and analytics integration

## 📞 Support & Maintenance

### Key Areas for Ongoing Development
1. **Performance Monitoring**: Continuous optimization
2. **Security Updates**: Regular dependency updates
3. **Feature Enhancement**: Based on user feedback
4. **SEO Optimization**: Ongoing improvements
5. **Mobile Experience**: Responsive design refinements

---

*This documentation provides a comprehensive overview of the Emilio Beaufort codebase. For specific implementation details, refer to individual component files and API documentation.*
