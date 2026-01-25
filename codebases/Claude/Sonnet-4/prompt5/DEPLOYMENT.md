# Deployment Guide

## Local Development

### Prerequisites
- Node.js 14+ installed
- npm package manager

### Quick Start
```bash
# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# Or start production server
npm start
```

The application will be available at `http://localhost:3000`

## Production Deployment

### Environment Variables
Create a `.env` file for production:

```bash
NODE_ENV=production
SESSION_SECRET=your-super-secure-random-string-here
PORT=3000
```

### Security Hardening for Production

1. **HTTPS Configuration**
   ```javascript
   // In server.js, update session config:
   cookie: {
     secure: true,  // Require HTTPS
     httpOnly: true,
     maxAge: 24 * 60 * 60 * 1000
   }
   ```

2. **Database Setup**
   - Replace in-memory database with persistent storage
   - Use PostgreSQL, MySQL, or MongoDB
   - Implement proper database connection pooling

3. **Process Management**
   ```bash
   # Using PM2 for production
   npm install -g pm2
   pm2 start server.js --name bluemind-security-demo
   pm2 startup
   pm2 save
   ```

4. **Reverse Proxy (Nginx)**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
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

### Docker Deployment

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

USER node

CMD ["npm", "start"]
```

Create a `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - SESSION_SECRET=your-secure-secret
    restart: unless-stopped
```

### Security Monitoring

1. **Logging**
   - Implement structured logging
   - Log security events (failed logins, rate limiting)
   - Use services like Winston or Bunyan

2. **Monitoring**
   - Set up application performance monitoring
   - Monitor for security incidents
   - Set up alerts for suspicious activity

3. **Updates**
   - Regular dependency updates
   - Security patch management
   - Automated vulnerability scanning

### Backup Strategy

1. **Database Backups**
   - Regular automated backups
   - Test restore procedures
   - Off-site backup storage

2. **Application Backups**
   - Code repository backups
   - Configuration backups
   - Environment documentation

## Cloud Deployment Options

### Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create your-app-name

# Set environment variables
heroku config:set SESSION_SECRET=your-secure-secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

### DigitalOcean App Platform
- Create new app from repository
- Set environment variables in dashboard
- Configure build and run commands

### AWS Elastic Beanstalk
- Create application zip file
- Deploy through AWS console
- Configure environment variables

## Performance Optimization

### Caching
```javascript
// Add Redis for session storage
const RedisStore = require('connect-redis')(session);
const redis = require('redis');
const redisClient = redis.createClient();

app.use(session({
  store: new RedisStore({ client: redisClient }),
  // ... other config
}));
```

### Static Asset Optimization
- Use CDN for static files
- Enable gzip compression
- Implement caching headers

### Database Optimization
- Index frequently queried fields
- Implement connection pooling
- Use database caching where appropriate

## Troubleshooting

### Common Issues

1. **Port in use**
   ```bash
   # Find process using port 3000
   lsof -i :3000
   # Kill process
   kill -9 <PID>
   ```

2. **Module not found**
   ```bash
   # Clear npm cache
   npm cache clean --force
   # Delete node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Permission errors**
   ```bash
   # Fix npm permissions
   sudo chown -R $(whoami) ~/.npm
   ```

### Logging
Enable debug logging:
```bash
DEBUG=app:* npm start
```

### Health Checks
Add health check endpoint:
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Review security logs weekly
- Test backups quarterly
- Security audit annually

### Monitoring Checklist
- [ ] Application uptime
- [ ] Response times
- [ ] Error rates
- [ ] Security events
- [ ] Resource usage
- [ ] Database performance

---

**Note**: This is a demo application for educational purposes. For production use, implement additional security measures, monitoring, and testing as appropriate for your specific requirements.