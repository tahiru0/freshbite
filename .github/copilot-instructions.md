# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a Next.js food delivery application with the following stack:
- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **UI Components**: Radix UI + Tailwind CSS

## Key Features
- Food ordering system with categories and menu items
- Shopping cart functionality
- User authentication and authorization
- Admin panel for managing products, orders, and users
- Order management system
- Real-time order status updates

## Code Style Guidelines
- Use TypeScript for all files
- Follow Next.js 14 App Router patterns
- Use Prisma for database operations
- Implement proper error handling
- Use Tailwind CSS for styling
- Create reusable UI components
- Follow RESTful API design principles

## Database Schema
- Users (customers and admins)
- Categories (food categories)
- Products (food items)
- Orders and OrderItems
- Shopping cart functionality

## Authentication
- Use NextAuth.js for authentication
- Implement role-based access (admin/customer)
- Protect admin routes
