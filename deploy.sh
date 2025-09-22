#!/bin/bash
# Quick deployment script for Teen Mental Health App

set -e

echo "🚀 Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "app/package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Navigate to app directory
cd app

print_status "Installing dependencies..."
npm install --legacy-peer-deps

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_warning ".env.production not found. Creating from example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env.production
        print_warning "Please edit .env.production with your production values"
        exit 1
    else
        print_error ".env.example not found. Please create .env.production manually"
        exit 1
    fi
fi

print_status "Generating Prisma client..."
npx prisma generate

print_status "Building application..."
npm run build

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 not found. Installing PM2 globally..."
    sudo npm install -g pm2
fi

print_status "Setting up database..."
read -p "Do you want to push database schema? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx prisma db push
fi

print_status "Starting application with PM2..."
pm2 delete mood-buddy 2>/dev/null || true
pm2 start npm --name "mood-buddy" -- start

print_status "Saving PM2 configuration..."
pm2 save

print_status "Setting up PM2 startup script..."
pm2 startup

print_status "Deployment completed successfully! 🎉"
print_status "Your app should be running on http://localhost:3000"
print_status ""
print_status "Useful PM2 commands:"
print_status "  pm2 status          - Check application status"
print_status "  pm2 logs mood-buddy - View application logs"
print_status "  pm2 restart mood-buddy - Restart application"
print_status "  pm2 stop mood-buddy - Stop application"

# Check if Nginx is available
if command -v nginx &> /dev/null; then
    print_status ""
    print_warning "Nginx detected. Consider setting up a reverse proxy."
    print_status "See DEPLOYMENT_GUIDE.md for Nginx configuration."
fi

print_status ""
print_status "Next steps:"
print_status "1. Configure your domain and SSL certificate"
print_status "2. Set up monitoring and backups"
print_status "3. Review security settings"
print_status ""
print_status "For detailed instructions, see DEPLOYMENT_GUIDE.md"