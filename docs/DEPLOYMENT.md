# FMIS Deployment Guide

## Prerequisites

- Server with Linux/Windows OS
- Node.js 18+
- PostgreSQL 12+
- nginx or Apache (reverse proxy)
- SSL certificate (for HTTPS)
- Domain name

## Self-Hosted Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install nginx
sudo apt install nginx -y

# Install PM2 (process manager)
sudo npm install -g pm2
```

### 2. Database Setup

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE fmis_db;

# Create user
CREATE USER fmis_user WITH PASSWORD 'secure_password_here';

# Grant privileges
ALTER ROLE fmis_user SET client_encoding TO 'utf8';
ALTER ROLE fmis_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE fmis_user SET default_transaction_deferrable TO on;
ALTER ROLE fmis_user SET default_transaction_read_only TO off;
GRANT ALL PRIVILEGES ON DATABASE fmis_db TO fmis_user;

# Exit PostgreSQL
\q
```

### 3. Application Setup

```bash
# Create app directory
sudo mkdir -p /var/www/fmis
cd /var/www/fmis

# Clone repository (if using git)
git clone <repository-url> .

# Or copy application files
# scp -r fmis/* user@server:/var/www/fmis/

# Install dependencies
npm install

# Set environment variables
cp .env.example .env
nano .env  # Edit DATABASE_URL, JWT_SECRET, etc.

# Setup database
npm run db:generate
npm run db:migrate
npm run db:seed

# Build application
npm run build

# Set permissions
sudo chown -R www-data:www-data /var/www/fmis
```

### 4. nginx Configuration

```bash
# Create nginx config
sudo nano /etc/nginx/sites-available/fmis

# Add configuration:
upstream fmis_app {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/javascript 
               application/json application/javascript;

    # Proxy settings
    location / {
        proxy_pass http://fmis_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Deny access to sensitive files
    location ~ /\.env {
        deny all;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/fmis /etc/nginx/sites-enabled/

# Test nginx config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### 5. SSL Setup (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### 6. PM2 Setup

```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'fmis',
    script: './node_modules/.bin/next',
    args: 'start',
    cwd: '/var/www/fmis',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
  }],
};
```

```bash
# Start application with PM2
pm2 start ecosystem.config.js

# Setup PM2 startup
pm2 startup
pm2 save

# Monitor
pm2 monit
pm2 logs fmis
```

### 7. Backup Configuration

```bash
# Create backup script
nano /opt/backup-fmis.sh
```

```bash
#!/bin/bash

BACKUP_DIR="/backups/fmis"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="fmis_db"
DB_USER="fmis_user"

mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/fmis

# Keep only last 7 days
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Make executable
chmod +x /opt/backup-fmis.sh

# Schedule with cron (daily at 2 AM)
sudo crontab -e
0 2 * * * /opt/backup-fmis.sh
```

## Docker Deployment

### 1. Build and Push Image

```bash
# Build Docker image
docker build -t your-registry/fmis:latest .

# Push to registry
docker push your-registry/fmis:latest
```

### 2. Deploy with Docker Compose

```bash
# Copy .env and configure
cp .env.example .env

# Start services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

## Cloud Deployment

### AWS Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p node.js-18 fmis

# Create environment
eb create fmis-prod

# Deploy
eb deploy

# View logs
eb logs
```

### Google Cloud Platform

```bash
# Create Cloud Run service
gcloud run deploy fmis \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Set environment variables
gcloud run services update fmis \
  --set-env-vars DATABASE_URL=<your-db-url>
```

### Microsoft Azure

```bash
# Create App Service
az appservice plan create \
  --name fmis-plan \
  --resource-group myResourceGroup \
  --sku B1 --is-linux

# Deploy application
az webapp create \
  --resource-group myResourceGroup \
  --plan fmis-plan \
  --name fmis-app \
  --runtime "node|18"
```

## Monitoring & Maintenance

### Application Monitoring

```bash
# Check application status
pm2 status

# View recent logs
pm2 logs fmis --lines 100

# CPU and memory usage
pm2 monit

# Application metrics
curl http://localhost:3000/api/health
```

### Database Maintenance

```bash
# Backup
pg_dump -U fmis_user fmis_db > backup.sql

# Restore
psql -U fmis_user fmis_db < backup.sql

# Optimize database
VACUUM ANALYZE;

# Check connections
SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;
```

### System Monitoring

```bash
# CPU and memory
top
free -h
df -h

# Network
netstat -tulpn
ss -tulpn

# Logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Updates & Rollback

### Deploying Updates

```bash
# Pull latest code
cd /var/www/fmis
git pull origin main

# Install dependencies
npm install

# Run migrations
npm run db:migrate

# Build
npm run build

# Restart application
pm2 restart fmis
```

### Rollback Procedure

```bash
# Stop application
pm2 stop fmis

# Revert to previous version
git revert <commit-hash>

# Rollback database migrations (if needed)
npm run db:migrate -- --rollback

# Restart application
pm2 start fmis
```

## Security Hardening

```bash
# Enable firewall
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Update system regularly
sudo apt update && sudo apt upgrade -y

# Install fail2ban
sudo apt install fail2ban -y

# Configure fail2ban
sudo nano /etc/fail2ban/jail.local
# Add nginx and ssh jails

# Keep dependencies updated
npm audit
npm update
```

## Performance Tuning

### Node.js Cluster

Enable in ecosystem.config.js:
```javascript
instances: 'max',
exec_mode: 'cluster',
```

### Database Optimization

```sql
-- Create indexes
CREATE INDEX idx_animal_farm ON animal(farm_id);
CREATE INDEX idx_dairy_animal ON dairy_record(animal_id);
CREATE INDEX idx_dairy_date ON dairy_record(record_date);

-- Analyze query plans
EXPLAIN ANALYZE SELECT * FROM animal WHERE farm_id = 'x';
```

### nginx Caching

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m;

location / {
    proxy_cache my_cache;
    proxy_cache_valid 200 1h;
    proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
}
```

---

**Last Updated**: 2024-01-20
