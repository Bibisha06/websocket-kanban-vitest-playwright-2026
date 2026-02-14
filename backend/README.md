# Backend Server - MongoDB Setup

## MongoDB Setup Options

### Option 1: Local MongoDB (Recommended for Development)

1. **Install MongoDB Community Edition:**
   - Windows: Download from https://www.mongodb.com/try/download/community
   - Or use Chocolatey: `choco install mongodb`

2. **Start MongoDB:**
   ```bash
   mongod
   ```

3. **Connection String:**
   ```
   mongodb://localhost:27017/kanban
   ```

### Option 2: MongoDB Atlas (Cloud - Free Tier Available)

1. **Create Account:**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free tier

2. **Create Cluster:**
   - Click "Build a Database"
   - Choose FREE tier
   - Select your region

3. **Get Connection String:**
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

4. **Whitelist IP:**
   - In Atlas, go to Network Access
   - Add IP Address: `0.0.0.0/0` (allows all - for development only)

5. **Connection String Format:**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/kanban
   ```

## Environment Setup

1. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

2. **Update `.env` with your MongoDB URI:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/kanban
   # OR for Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kanban
   ```

## Running the Server

```bash
npm install
npm run dev
```

Server will start on http://localhost:5000

## API Events (WebSocket)

### Client to Server:
- `task:create` - Create a new task
- `task:update` - Update task details
- `task:move` - Move task between columns
- `task:delete` - Delete a task
- `sync:request` - Request all tasks

### Server to Client:
- `sync:tasks` - Initial task sync
- `task:created` - New task created
- `task:updated` - Task updated
- `task:moved` - Task moved
- `task:deleted` - Task deleted
- `error` - Error message
