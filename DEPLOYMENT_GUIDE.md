# MongoDB Backend Deployment Guide

## Quick Start Options

### 1. MongoDB Atlas + Railway (Recommended)

**Step 1: Set up MongoDB Atlas**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Get your connection string
4. Whitelist all IPs (0.0.0.0/0) for development

**Step 2: Deploy to Railway**
1. Push your code to GitHub
2. Go to [Railway](https://railway.app)
3. Connect your GitHub repo
4. Set environment variables:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/profitra
   JWT_SECRET=your-super-secret-key
   NODE_ENV=production
   PORT=5000
   ```
5. Deploy automatically

### 2. DigitalOcean Droplet (Self-hosted)

**Step 1: Create Droplet**
```bash
# Create $5/month droplet with Ubuntu 22.04
# SSH into your droplet

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2 for process management
sudo npm install -g pm2
```

**Step 2: Deploy Application**
```bash
# Clone your repository
git clone https://github.com/yourusername/profitra-backend.git
cd profitra-backend/server

# Install dependencies
npm install

# Create .env file
nano .env
# Add your environment variables

# Seed database
npm run seed

# Start with PM2
pm2 start server.js --name "profitra-backend"
pm2 startup
pm2 save

# Setup Nginx reverse proxy
sudo apt install nginx
sudo nano /etc/nginx/sites-available/profitra
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
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

### 3. Docker Deployment

**Step 1: Using Docker Compose**
```bash
# Clone repository
git clone https://github.com/yourusername/profitra-backend.git
cd profitra-backend/server

# Start services
docker-compose up -d

# Seed database
docker-compose exec backend npm run seed
```

**Step 2: Production Docker Setup**
```bash
# Build and push to registry
docker build -t profitra-backend .
docker tag profitra-backend your-registry/profitra-backend
docker push your-registry/profitra-backend

# Deploy on server
docker run -d \
  --name profitra-backend \
  -p 5000:5000 \
  -e MONGODB_URI="your-mongodb-uri" \
  -e JWT_SECRET="your-jwt-secret" \
  your-registry/profitra-backend
```

## Environment Variables

```bash
# Required
MONGODB_URI=mongodb://localhost:27017/profitra
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production
PORT=5000

# Optional
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-domain.com
ADMIN_EMAIL=admin@profitra.com
ADMIN_PASSWORD=secure-admin-password
BTC_WALLET_ADDRESS=your-btc-address
USDT_WALLET_ADDRESS=your-usdt-address

# Email (if using notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Database Backup

```bash
# Backup
mongodump --uri="your-mongodb-uri" --out=./backup

# Restore
mongorestore --uri="your-mongodb-uri" ./backup
```

## Monitoring

```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs profitra-backend

# Restart application
pm2 restart profitra-backend
```

## Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT secret
- [ ] Enable MongoDB authentication
- [ ] Set up firewall rules
- [ ] Use HTTPS with SSL certificate
- [ ] Regular database backups
- [ ] Monitor server resources
- [ ] Update dependencies regularly

## Cost Estimates

| Option | Monthly Cost | Pros | Cons |
|--------|-------------|------|------|
| MongoDB Atlas + Railway | $0-25 | Easy setup, managed | Limited free tier |
| DigitalOcean Droplet | $5-20 | Full control, cheap | Requires management |
| AWS/GCP | $10-50 | Scalable, reliable | More complex setup |

## Performance Tips

1. **Database Indexing**: Already configured in models
2. **Connection Pooling**: Mongoose handles this automatically
3. **Caching**: Consider Redis for session storage
4. **Load Balancing**: Use Nginx or cloud load balancers
5. **CDN**: Use CloudFlare for static assets

## Troubleshooting

**Common Issues:**
1. **Connection refused**: Check MongoDB is running
2. **Authentication failed**: Verify credentials
3. **Port conflicts**: Change PORT in .env
4. **Memory issues**: Increase server RAM or optimize queries

**Logs Location:**
- PM2 logs: `~/.pm2/logs/`
- MongoDB logs: `/var/log/mongodb/`
- Application logs: Check console output