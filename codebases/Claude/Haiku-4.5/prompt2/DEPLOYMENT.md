# Deployment Guide

## Development Server

To run locally for development or testing:

```bash
npm install
npm start
```

Server runs on `http://localhost:3000`

## Database

- SQLite database automatically created at `db/secure-messaging.db`
- Schema initialized on first run
- Reset by deleting the database file

## Production Deployment

### Prerequisites

- Node.js 14+ installed on server
- Reverse proxy (nginx/Apache)
- HTTPS certificate (Let's Encrypt recommended)
- PostgreSQL database (recommended over SQLite)
- Environment variables configured

### Environment Variables

Create `.env` file (never commit this):

```
SESSION_SECRET=your-very-long-random-secret-key-here
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/dbname
```

Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Database Migration (SQLite to PostgreSQL)

For production, migrate from SQLite to PostgreSQL:

1. Install PostgreSQL adapter:
```bash
npm install pg
```

2. Update `db/database.js` to use PostgreSQL
3. Migrate data from SQLite backup
4. Test thoroughly before going live

### Nginx Configuration

```nginx
upstream nodejs {
  server localhost:3000;
}

server {
  listen 80;
  server_name yourdomain.com;
  
  # Redirect HTTP to HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name yourdomain.com;

  ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

  # Security headers
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-Frame-Options "DENY" always;
  add_header X-XSS-Protection "1; mode=block" always;

  location / {
    proxy_pass http://nodejs;
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

### Process Management with PM2

```bash
npm install -g pm2

pm2 start server.js --name "secure-messaging"
pm2 save
pm2 startup
```

Monitor:
```bash
pm2 monit
```

### SSL/TLS with Let's Encrypt

```bash
sudo apt-get install certbot python3-certbot-nginx

sudo certbot certonly --nginx -d yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

### Health Checks

Add monitoring endpoint to `server.js`:

```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'OK', uptime: process.uptime() });
});
```

Monitor with external service:
```bash
curl https://yourdomain.com/health
```

### Backup Strategy

1. **Database Backups**:
```bash
# Daily backup
0 2 * * * pg_dump -h localhost -U user dbname > /backups/db-$(date +\%Y\%m\%d).sql
```

2. **Code Backups**:
```bash
git push origin main
```

### Security Checklist

- [ ] HTTPS enabled with valid certificate
- [ ] `secure: true` in session cookie config
- [ ] `SESSION_SECRET` is random and long (32+ characters)
- [ ] Database credentials in environment variables
- [ ] Database user has minimal required permissions
- [ ] Rate limiting implemented on auth endpoints
- [ ] CORS configured for specific domains only
- [ ] Security headers configured (via Helmet)
- [ ] Error messages don't leak sensitive info
- [ ] Logging configured for security events
- [ ] Regular backups of database
- [ ] Dependencies regularly updated (`npm audit fix`)
- [ ] Monitoring and alerting configured
- [ ] Incident response plan documented

### Performance Optimization

1. **Enable Compression**:
```javascript
const compression = require('compression');
app.use(compression());
```

2. **Add Caching Headers**:
```javascript
app.use(express.static('public', {
  maxAge: '1d',
  etag: false
}));
```

3. **Database Connection Pooling**:
```javascript
const pool = new Pool({ max: 20 });
```

4. **Load Balancing**:
Use multiple Node.js instances behind load balancer:
```bash
# Start multiple instances
pm2 start server.js -i 4
```

### Monitoring and Logging

Recommended services:
- **Logging**: Papertrail, DataDog, or ELK Stack
- **Monitoring**: New Relic, Datadog, or Prometheus
- **Error Tracking**: Sentry or Rollbar
- **Uptime Monitoring**: StatusPage or PagerDuty

Example logging integration:
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Disaster Recovery

1. **Backup Locations**:
   - Database: Cloud storage (AWS S3, Google Cloud)
   - Code: GitHub with protected main branch
   - Configuration: Encrypted vault (HashiCorp Vault)

2. **Recovery Testing**:
   - Monthly restore tests
   - Document recovery procedures
   - Time recovery objectives (RTO)
   - Recovery point objectives (RPO)

3. **Incident Response**:
   - Security incidents: Isolate, investigate, patch, communicate
   - Performance issues: Scale, optimize, monitor
   - Data corruption: Restore from backup

## Heroku Deployment (Quick Start)

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set SESSION_SECRET="your-random-secret"
heroku config:set NODE_ENV="production"

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

## Railway Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

## Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t secure-messaging .
docker run -p 3000:3000 -e SESSION_SECRET="secret" secure-messaging
```

## AWS EC2 Deployment

1. Launch Ubuntu instance
2. Install Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. Clone repository:
```bash
git clone your-repo-url
cd project
npm install --production
```

4. Setup PM2:
```bash
sudo npm install -g pm2
pm2 start server.js
pm2 startup
pm2 save
```

5. Configure nginx and SSL (see nginx section above)

## Maintenance

### Regular Updates

```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Update critical fixes only
npm audit fix
```

### Database Maintenance

```bash
# For PostgreSQL
# Vacuum and analyze
VACUUM ANALYZE;

# Check for missing indexes
SELECT * FROM pg_stat_user_indexes;
```

### Log Rotation

```bash
# Install logrotate
sudo apt-get install logrotate

# Configure log rotation
# /etc/logrotate.d/nodejs
/var/log/nodejs/*.log {
  daily
  rotate 14
  compress
  delaycompress
  notifempty
  create 0640 nodejs nodejs
  sharedscripts
}
```

## Rollback Procedures

```bash
# Using git
git revert <commit-hash>
git push origin main

# Using PM2
pm2 list
pm2 stop id
pm2 delete id
# Revert code and restart
```

## Support

For production issues, check:
1. Application logs
2. Database connectivity
3. SSL certificate validity
4. Environment variables
5. Disk space and memory
6. Network connectivity

Contact hosting provider support if needed.
