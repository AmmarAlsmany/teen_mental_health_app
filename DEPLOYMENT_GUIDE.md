# 🚀 Deployment Guide for Teen Mental Health App

## Overview
This guide covers deploying your Teen Mental Health App to various platforms including VPS servers, cloud platforms, and containerized environments.

## 📋 Prerequisites

### Required
- Node.js 18+
- Database (MySQL/PostgreSQL)
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt recommended)

### Environment Variables Required
```bash
# Database
DATABASE_URL="mysql://username:password@host:3306/database_name"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-super-secret-key-at-least-32-chars-long"

# AbacusAI API
ABACUSAI_API_KEY="your-api-key"

# Environment
NODE_ENV="production"
```

## 🌐 Deployment Options

### Option 1: VPS/Server Deployment (Ubuntu/Debian)

#### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx (optional, for reverse proxy)
sudo apt install nginx

# Install MySQL
sudo apt install mysql-server
sudo mysql_secure_installation
```

#### 2. Database Setup
```bash
# Create database and user
sudo mysql -u root -p

CREATE DATABASE moodbuddy_prod;
CREATE USER 'moodbuddy_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON moodbuddy_prod.* TO 'moodbuddy_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 3. Application Deployment
```bash
# Clone repository
git clone https://github.com/yourusername/teen_mental_health_app.git
cd teen_mental_health_app/app

# Install dependencies
npm install --legacy-peer-deps

# Set up environment variables
cp .env.example .env.production
nano .env.production

# Set up database
npx prisma generate
npx prisma db push

# Build application
npm run build

# Start with PM2
pm2 start npm --name "mood-buddy" -- start
pm2 startup
pm2 save
```

#### 4. Nginx Configuration (Optional)
```nginx
# /etc/nginx/sites-available/moodbuddy
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/moodbuddy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Install SSL certificate
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Option 2: Docker Deployment

#### 1. Create Dockerfile
```dockerfile
# Create: /app/Dockerfile
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps

FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["npm", "start"]
```

#### 2. Create docker-compose.yml
```yaml
# Create: /docker-compose.yml
version: '3.8'

services:
  app:
    build: ./app
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://root:password@db:3306/moodbuddy_prod
      - NEXTAUTH_URL=https://yourdomain.com
      - NEXTAUTH_SECRET=your-super-secret-key
      - ABACUSAI_API_KEY=your-api-key
      - NODE_ENV=production
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: mysql:8.0
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: moodbuddy_prod
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl:ro
    depends_on:
      - app
    restart: unless-stopped

volumes:
  mysql_data:
```

#### 3. Deploy with Docker
```bash
# Build and start
docker-compose up -d

# Run database migrations
docker-compose exec app npx prisma db push

# View logs
docker-compose logs -f app
```

### Option 3: Platform Deployments

#### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
cd app
vercel

# Set environment variables in Vercel dashboard
# Configure database (use PlanetScale or other serverless DB)
```

#### Railway Deployment
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up

# Set environment variables
railway variables set DATABASE_URL="your-database-url"
railway variables set NEXTAUTH_SECRET="your-secret"
```

#### Netlify Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=.next
```

## 🔧 Environment Configuration

### Production Environment Variables (.env.production)
```bash
# Database - Choose one
DATABASE_URL="mysql://user:pass@host:3306/dbname"
# or PostgreSQL
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generate-32-char-random-string"

# External APIs
ABACUSAI_API_KEY="your-api-key"

# Environment
NODE_ENV="production"
```

### Database Migration Commands
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Or run migrations
npx prisma migrate deploy

# Seed database (if you have seed script)
npx prisma db seed
```

## 🔒 Security Checklist

- [ ] Use strong passwords for database
- [ ] Set secure NEXTAUTH_SECRET (32+ characters)
- [ ] Enable firewall (ufw on Ubuntu)
- [ ] Install SSL certificate
- [ ] Keep system updated
- [ ] Use PM2 for process management
- [ ] Set up log rotation
- [ ] Configure backup strategy
- [ ] Restrict database access
- [ ] Use environment variables for secrets

## 📊 Monitoring & Maintenance

### PM2 Commands
```bash
# View status
pm2 status

# View logs
pm2 logs mood-buddy

# Restart app
pm2 restart mood-buddy

# Monitor resources
pm2 monit
```

### Log Management
```bash
# Set up log rotation
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Backup Strategy
```bash
# Database backup script
#!/bin/bash
mysqldump -u root -p moodbuddy_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# File backup
tar -czf app_backup_$(date +%Y%m%d_%H%M%S).tar.gz /path/to/app
```

## 🚨 Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

2. **Database connection issues**
   ```bash
   # Check MySQL status
   sudo systemctl status mysql

   # Test connection
   mysql -u username -p -h hostname database_name
   ```

3. **Build failures**
   ```bash
   # Clear cache and rebuild
   rm -rf .next node_modules
   npm install --legacy-peer-deps
   npm run build
   ```

4. **Permission issues**
   ```bash
   # Fix file permissions
   sudo chown -R www-data:www-data /path/to/app
   sudo chmod -R 755 /path/to/app
   ```

## 📞 Support

For deployment issues:
1. Check application logs: `pm2 logs mood-buddy`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Check database connectivity
4. Verify environment variables are set correctly

## 🔄 Updates

To update the application:
```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install --legacy-peer-deps

# Run migrations if needed
npx prisma db push

# Rebuild and restart
npm run build
pm2 restart mood-buddy
```

---

**Note**: Replace placeholder values (yourdomain.com, passwords, API keys) with your actual values before deployment.