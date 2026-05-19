# SIPMS Deployment Guide
**Version:** 1.0.0 | **Date:** May 3, 2026 | **Status:** Production Ready

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Docker Deployment](#docker-deployment)
4. [Production Deployment](#production-deployment)
5. [Configuration](#configuration)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

**Development Machine:**
- OS: Linux, macOS, or Windows 10+
- RAM: 8GB minimum (16GB recommended)
- Disk: 10GB free space
- Network: Internet connection required

**Server (Production):**
- OS: Ubuntu 22.04 LTS or equivalent
- RAM: 16GB minimum
- CPU: 4 cores minimum (8 recommended)
- Disk: 50GB SSD
- Network: Static IP, firewall configured

### Software Requirements

**Development:**
```bash
Java 21 LTS (OpenJDK or Oracle)
Maven 3.8.1+
Node.js 18.17.0+
npm 9.0.0+
MySQL 8.0.33+
Git 2.40+
```

**Production:**
```bash
Docker 24.0+
Docker Compose 2.20+
MySQL 8.0.33+ (or managed service)
Nginx 1.24+
```

---

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/sipms.git
cd sipms
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
mvn clean install

# Set local environment variables (create .env file)
cat > .env << EOF
DB_URL=jdbc:mysql://localhost:3306/sipms_db
DB_USERNAME=root
DB_PASSWORD=yourPassword123
JWT_SECRET=dev_secret_key_at_least_256_bits_long_for_hs256_algorithm
JWT_EXPIRATION_MS=86400000
JWT_REFRESH_EXPIRATION_MS=604800000
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
CORS_ALLOWED_ORIGINS=http://localhost:5173
EOF

# Create MySQL database
mysql -u root -p << EOF
CREATE DATABASE sipms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sipms_db;
SOURCE ../database/schema.sql;
SOURCE ../database/data.sql;
EOF

# Run Spring Boot application
mvn spring-boot:run
```

Backend will be available at: `http://localhost:8080`
API Docs: `http://localhost:8080/swagger-ui.html`

### 3. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

### 4. Access Application

```
Login: http://localhost:5173/login
Username: admin@sipms.com
Password: Admin@123
```

---

## Docker Deployment

### 1. Build Docker Images

```bash
# Create .env file in project root
cat > .env << EOF
DB_URL=jdbc:mysql://mysql:3306/sipms_db
DB_USERNAME=root
DB_PASSWORD=docker_secure_password_123
JWT_SECRET=production_secret_key_minimum_256_bits_required_for_hs256
MAIL_HOST=smtp.gmail.com
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
CORS_ALLOWED_ORIGINS=http://localhost,https://app.example.com
EOF

# Build all images
docker-compose build
```

### 2. Start Services

```bash
# Start all services (MySQL, Backend, Frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. Verify Deployment

```bash
# Check service status
docker-compose ps

# Test API health
curl http://localhost:8080/actuator/health

# Test frontend
curl http://localhost/index.html
```

### Docker Compose File

See `docker-compose.yml` in project root.

---

## Production Deployment

### 1. Server Setup (Ubuntu 22.04)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create application directory
sudo mkdir -p /opt/sipms
sudo chown $USER:$USER /opt/sipms
cd /opt/sipms
```

### 2. Clone Repository

```bash
git clone https://github.com/your-org/sipms.git .

# Checkout specific release tag
git checkout v1.0.0
```

### 3. Production Environment Configuration

```bash
# Create .env file (NEVER commit to git!)
cat > .env << 'EOF'
# Database
DB_URL=jdbc:mysql://mysql:3306/sipms_db
DB_USERNAME=sipms_user
DB_PASSWORD=$(openssl rand -base64 32)
MYSQL_ROOT_PASSWORD=$(openssl rand -base64 32)

# JWT Configuration
JWT_SECRET=$(head -c 256 /dev/urandom | base64)
JWT_EXPIRATION_MS=86400000
JWT_REFRESH_EXPIRATION_MS=604800000

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=noreply@your-domain.com
MAIL_PASSWORD=your-gmail-app-password
MAIL_FROM_NAME=SIPMS System

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://app.your-domain.com

# Application
ENVIRONMENT=production
LOG_LEVEL=INFO
EOF

# Restrict file permissions
chmod 600 .env
```

### 4. Database Backup Strategy

```bash
# Create backup script
cat > /opt/sipms/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/sipms/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="sipms_db"

mkdir -p $BACKUP_DIR

# Dump database
docker-compose exec -T mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} \
  ${DB_NAME} | gzip > ${BACKUP_DIR}/sipms_${TIMESTAMP}.sql.gz

# Keep only last 30 days
find ${BACKUP_DIR} -name "sipms_*.sql.gz" -mtime +30 -delete

echo "Database backed up to ${BACKUP_DIR}/sipms_${TIMESTAMP}.sql.gz"
EOF

chmod +x /opt/sipms/backup-db.sh

# Schedule daily backup (crontab)
(crontab -l 2>/dev/null; echo "0 2 * * * cd /opt/sipms && ./backup-db.sh") | crontab -
```

### 5. Start Production Services

```bash
# Pull latest images
docker-compose pull

# Start services with production settings
docker-compose -f docker-compose.yml up -d

# Verify services
docker-compose ps

# View logs
docker-compose logs --tail=100 backend
docker-compose logs --tail=100 frontend
```

### 6. Nginx Reverse Proxy Configuration

```bash
# Install Nginx
sudo apt install -y nginx certbot python3-certbot-nginx

# Create Nginx config
sudo tee /etc/nginx/sites-available/sipms << 'EOF'
upstream backend {
    server localhost:8080;
}

server {
    listen 80;
    server_name app.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/app.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.your-domain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_min_length 1000;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend
    location / {
        proxy_pass http://localhost;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|gif|ico|svg|woff|woff2)$ {
            proxy_cache_valid 30d;
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support (if needed)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # API documentation
    location /swagger-ui {
        proxy_pass http://backend/swagger-ui;
    }

    # Health check endpoint (no logging)
    location /health {
        access_log off;
        proxy_pass http://backend/actuator/health;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/sipms /etc/nginx/sites-enabled/sipms

# Obtain SSL certificate
sudo certbot certonly --nginx -d app.your-domain.com

# Reload Nginx
sudo nginx -t && sudo systemctl reload nginx

# Enable SSL renewal
sudo systemctl enable certbot.timer
```

### 7. Monitoring Setup (Optional)

```bash
# Install Prometheus for metrics
docker volume create prometheus_data
sudo apt install -y prometheus

# Configure Prometheus to scrape backend metrics
# Edit /etc/prometheus/prometheus.yml

# Install Grafana for visualization
docker run -d --name=grafana -p 3000:3000 grafana/grafana

# Access Grafana at http://localhost:3000
# Default credentials: admin / admin
```

---

## Configuration

### Environment Variables

**Required (Production):**
```bash
DB_URL              # MySQL connection URL
DB_USERNAME         # Database user
DB_PASSWORD         # Database password
JWT_SECRET          # Min 256-bit key for HS256
MAIL_HOST           # SMTP server
MAIL_USERNAME       # Email account
MAIL_PASSWORD       # Email password
CORS_ALLOWED_ORIGINS # Comma-separated allowed domains
```

**Optional:**
```bash
JWT_EXPIRATION_MS=86400000           # Access token: 24 hours
JWT_REFRESH_EXPIRATION_MS=604800000  # Refresh token: 7 days
LOG_LEVEL=INFO                       # Logging level
ENVIRONMENT=production               # Environment name
```

### Application Properties

File: `backend/src/main/resources/application.properties`

Key settings:
```properties
server.port=8080
server.servlet.context-path=/
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
logging.level.com.project.sipms=INFO
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# API Health Endpoint
curl http://localhost:8080/actuator/health

# Expected response:
# {"status":"UP"}
```

### Logging

**Log Levels:**
- `ERROR`: Critical failures
- `WARN`: Potential issues
- `INFO`: Important events
- `DEBUG`: Detailed debugging

**View Logs:**
```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs (stdout)
docker-compose logs -f frontend

# MySQL logs
docker-compose logs -f mysql
```

### Database Maintenance

```bash
# Optimize tables
mysql -u root -p sipms_db << EOF
OPTIMIZE TABLE users;
OPTIMIZE TABLE applications;
OPTIMIZE TABLE projects;
EOF

# Check database size
SELECT table_schema, ROUND(SUM(data_length+index_length)/1024/1024, 2) as size_mb
FROM information_schema.TABLES
WHERE table_schema = 'sipms_db'
GROUP BY table_schema;
```

### Disk Space Management

```bash
# Check disk usage
df -h

# Clean Docker images/volumes
docker image prune -a
docker volume prune

# Archive old audit logs (optional)
DELETE FROM audit_log WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

### Performance Tuning

```bash
# Increase MySQL connection pool
# In docker-compose.yml for backend service:
environment:
  - SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=20

# Increase JVM memory
environment:
  - JAVA_OPTS=-Xms1g -Xmx2g
```

---

## Troubleshooting

### Common Issues

#### Issue: "Cannot connect to MySQL"
```bash
# Check MySQL container
docker-compose ps mysql

# View MySQL logs
docker-compose logs mysql

# Verify database exists
docker-compose exec mysql mysql -u root -p -e "SHOW DATABASES;"

# Recreate container
docker-compose down mysql
docker-compose up -d mysql
docker-compose exec mysql mysql -u root -p < database/schema.sql
```

#### Issue: "Port already in use"
```bash
# Find process using port 8080
lsof -i :8080

# Kill process or change port in docker-compose.yml
```

#### Issue: "JWT token validation failed"
```bash
# Check JWT_SECRET environment variable
echo $JWT_SECRET

# Ensure consistency across all instances
# Regenerate and restart services
```

#### Issue: "Frontend can't connect to API"
```bash
# Check CORS configuration
curl -H "Origin: http://localhost:5173" http://localhost:8080/api/auth/login -v

# Verify CORS_ALLOWED_ORIGINS in environment
# Check Nginx/proxy configuration
```

#### Issue: "Out of memory"
```bash
# Check memory usage
docker stats

# Increase JVM heap size
# Edit docker-compose.yml
environment:
  - JAVA_OPTS=-Xms2g -Xmx4g
```

### Performance Issues

```bash
# Check slow queries
mysql -u root -p sipms_db << EOF
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
EOF

# Monitor database performance
SHOW PROCESSLIST;
SHOW TABLE STATUS;

# Enable query caching
SET GLOBAL query_cache_size = 268435456;
SET GLOBAL query_cache_type = 'ON';
```

### Security Audit

```bash
# Verify SSL certificate
openssl s_client -connect app.your-domain.com:443

# Check exposed ports
sudo netstat -tulpn

# View firewall rules
sudo ufw status

# Test password policy
# Try password: "weak" → should be rejected
```

---

## Rollback Procedure

```bash
# Stop current version
docker-compose down

# Checkout previous version
git checkout v0.9.0

# Rebuild and restart
docker-compose build
docker-compose up -d

# Verify
docker-compose ps
```

---

## Upgrade Procedure

```bash
# Pull latest code
git pull origin main

# Backup database
./backup-db.sh

# Build new images
docker-compose build

# Run migrations (if needed)
docker-compose exec backend java -jar sipms.jar --upgrade-schema

# Start new version
docker-compose up -d

# Verify health
curl http://localhost:8080/actuator/health

# Monitor logs
docker-compose logs -f backend
```

---

## Performance Checklist

- [ ] SSL/TLS enabled (HTTPS)
- [ ] Gzip compression enabled
- [ ] Database indexes created
- [ ] Connection pooling configured
- [ ] Backup strategy implemented
- [ ] Monitoring/alerting setup
- [ ] Log rotation configured
- [ ] Firewall rules configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured

---

**Document Version:** 1.0  
**Last Updated:** May 3, 2026  
**For Deployment Support:** ops@sipms.example.com
