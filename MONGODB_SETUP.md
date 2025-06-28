# MongoDB Setup Guide for Profitra

## Option 1: Local MongoDB Installation (Development)

### Windows
1. **Download MongoDB Community Server**
   - Go to [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Select Windows, Version 7.0, Package: msi
   - Download and run the installer

2. **Install MongoDB**
   - Run the .msi file as Administrator
   - Choose "Complete" installation
   - Install MongoDB as a Service (recommended)
   - Install MongoDB Compass (GUI tool)

3. **Verify Installation**
   ```cmd
   # Open Command Prompt as Administrator
   mongod --version
   mongo --version
   ```

4. **Start MongoDB Service**
   ```cmd
   # MongoDB should start automatically as a service
   # To manually start/stop:
   net start MongoDB
   net stop MongoDB
   ```

### macOS
1. **Install using Homebrew** (Recommended)
   ```bash
   # Install Homebrew if you don't have it
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   
   # Install MongoDB
   brew tap mongodb/brew
   brew install mongodb-community@7.0
   ```

2. **Start MongoDB**
   ```bash
   # Start MongoDB service
   brew services start mongodb/brew/mongodb-community
   
   # Or run manually
   mongod --config /usr/local/etc/mongod.conf
   ```

3. **Verify Installation**
   ```bash
   mongosh --version
   ```

### Linux (Ubuntu/Debian)
1. **Import MongoDB GPG Key**
   ```bash
   curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
   ```

2. **Add MongoDB Repository**
   ```bash
   echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
   ```

3. **Install MongoDB**
   ```bash
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```

4. **Start MongoDB**
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   sudo systemctl status mongod
   ```

## Option 2: MongoDB Atlas (Cloud - Recommended for Production)

### Step 1: Create Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new project called "Profitra"

### Step 2: Create Cluster
1. Click "Create a Deployment"
2. Choose "M0 Sandbox" (Free tier)
3. Select your preferred cloud provider and region
4. Name your cluster "profitra-cluster"
5. Click "Create Deployment"

### Step 3: Configure Access
1. **Create Database User**
   - Username: `profitra-admin`
   - Password: Generate a secure password
   - Database User Privileges: Read and write to any database

2. **Configure Network Access**
   - Add IP Address: `0.0.0.0/0` (Allow access from anywhere)
   - Or add your specific IP address for better security

### Step 4: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Select "Node.js" and version "4.1 or later"
4. Copy the connection string
5. Replace `<password>` with your database user password

Example connection string:
```
mongodb+srv://profitra-admin:<password>@profitra-cluster.abc123.mongodb.net/profitra?retryWrites=true&w=majority
```

## Option 3: Docker MongoDB (Development)

### Using Docker Compose (Included in project)
```bash
# Navigate to server directory
cd server

# Start MongoDB with Docker Compose
docker-compose up -d mongodb

# Check if MongoDB is running
docker-compose ps
```

### Manual Docker Setup
```bash
# Pull MongoDB image
docker pull mongo:7.0

# Run MongoDB container
docker run -d \
  --name profitra-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  -e MONGO_INITDB_DATABASE=profitra \
  -v mongodb_data:/data/db \
  mongo:7.0

# Connect to MongoDB
docker exec -it profitra-mongodb mongosh
```

## Configuration

### Environment Variables
Create a `.env` file in the `server` directory:

```env
# For Local MongoDB
MONGODB_URI=mongodb://localhost:27017/profitra

# For MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/profitra

# For Docker MongoDB
MONGODB_URI=mongodb://admin:password123@localhost:27017/profitra?authSource=admin

# Other required variables
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
NODE_ENV=development
```

## Database Setup

### 1. Install Backend Dependencies
```bash
cd server
npm install
```

### 2. Seed the Database
```bash
# This will create default investment plans and admin user
npm run seed
```

### 3. Start the Backend Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Verification

### Test Database Connection
```bash
# Check if backend connects to MongoDB
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Test with MongoDB Compass (GUI)
1. Open MongoDB Compass
2. Connect using your connection string
3. You should see the `profitra` database with collections:
   - `users`
   - `investmentplans`
   - `investments`
   - `depositrequests`
   - `transactions`

### Test with MongoDB Shell
```bash
# Connect to local MongoDB
mongosh

# Or connect to Atlas
mongosh "mongodb+srv://cluster.mongodb.net/profitra" --username your-username

# List databases
show dbs

# Use profitra database
use profitra

# List collections
show collections

# Check investment plans
db.investmentplans.find()
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   ```bash
   # Check if MongoDB is running
   sudo systemctl status mongod  # Linux
   brew services list | grep mongodb  # macOS
   ```

2. **Authentication Failed**
   - Verify username/password in connection string
   - Check if user has proper permissions

3. **Network Timeout (Atlas)**
   - Verify IP whitelist includes your IP
   - Check firewall settings

4. **Port Already in Use**
   ```bash
   # Check what's using port 27017
   lsof -i :27017  # macOS/Linux
   netstat -ano | findstr :27017  # Windows
   ```

### Logs Location
- **Linux**: `/var/log/mongodb/mongod.log`
- **macOS**: `/usr/local/var/log/mongodb/mongo.log`
- **Windows**: `C:\Program Files\MongoDB\Server\7.0\log\mongod.log`

## Security Best Practices

1. **Change Default Passwords**
   - Never use default passwords in production
   - Use strong, unique passwords

2. **Enable Authentication**
   ```javascript
   // Add to mongod.conf
   security:
     authorization: enabled
   ```

3. **Network Security**
   - Restrict IP access in Atlas
   - Use VPN for production access
   - Enable SSL/TLS

4. **Regular Backups**
   ```bash
   # Backup database
   mongodump --uri="your-connection-string" --out=./backup
   
   # Restore database
   mongorestore --uri="your-connection-string" ./backup
   ```

## Next Steps

1. **Start MongoDB** using one of the methods above
2. **Configure environment variables** in `server/.env`
3. **Run database seeding**: `npm run seed`
4. **Start the backend server**: `npm run dev`
5. **Test the connection** using the health endpoint

Your MongoDB setup is now complete! The backend server should connect successfully and you can start using the Profitra platform.