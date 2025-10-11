# 🚀 Martin++ Production Deployment Guide

This guide covers deploying Martin++ to production with Docker, scaling, and monitoring.

## 📋 Prerequisites

- **Docker & Docker Compose**: Latest versions
- **Domain Name**: SSL certificate support
- **Production Environment Variables**: All API keys configured
- **SSL Certificates**: For HTTPS support

## 🔧 Quick Deployment

### 1. Environment Setup

```bash
# Clone/copy the repository to your production server
cd /path/to/your/production/directory

# Copy and configure environment variables
cp .env.production .env.production.local
# Edit .env.production.local with your actual values
```

### 2. Required Environment Variables

Update `/.env.production.local`:

```bash
# Database (Generate secure password)
POSTGRES_PASSWORD=your-secure-db-password-32-chars

# OpenAI API (Get from https://platform.openai.com/)
OPENAI_API_KEY=sk-your-actual-openai-api-key

# Google Cloud Console (https://console.cloud.google.com/)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Google Gemini AI (https://makersuite.google.com/app/apikey)
GEMINI_API_KEY=your-gemini-api-key

# Pinecone Vector Database (https://app.pinecone.io/)
PINECONE_API_KEY=pcsk-your-actual-pinecone-key

# JWT Secret (Generate 32+ character random string)
JWT_SECRET=your-32-character-jwt-secret-key-here
```

### 3. Deploy

```bash
# Deploy everything (build, start, health check)
./deploy.sh deploy

# Or deploy step-by-step
./deploy.sh build    # Build Docker image
./deploy.sh start    # Start services
```

### 4. SSL Configuration

```bash
# Create SSL certificates directory
mkdir -p ssl

# Copy your SSL certificates
cp your-domain.pem ssl/ssl-cert.pem
cp your-private-key.pem ssl/ssl-key.pem

# Update nginx.conf server_name from localhost to your-domain.com
```

## 🔄 Scaling Strategies

### Horizontal Scaling

For high-traffic deployments, scale the application layer:

```yaml
# docker-compose.scale.yml
version: '3.8'
services:
  martin-app:
    # ... existing config
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 1G
          cpus: '1.0'
        reservations:
          memory: 512M
          cpus: '0.5'
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Database Scaling

Use managed PostgreSQL services:
- **AWS RDS PostgreSQL**
- **Google Cloud SQL**
- **Azure Database for PostgreSQL**
- **Neon** (already configured)

### Redis Scaling

For high-traffic caching:

```yaml
redis:
  image: redis:7-alpine
  deploy:
    replicas: 2
    resources:
      limits:
        memory: 512M
        cpus: '0.5'
```

## 📊 Monitoring & Observability

### Health Checks

```bash
# Check application health
curl https://your-domain.com/health

# Monitor containers
docker-compose ps

# View logs
./deploy.sh logs -f
```

### Metrics to Monitor

1. **Application Metrics**:
   - Response times (`< 500ms` target)
   - Error rates (`< 1%` target)
   - AI API call latency
   - Email processing throughput

2. **Infrastructure Metrics**:
   - CPU/Memory usage per container
   - Database connection pool status
   - Redis cache hit rates
   - SSL certificate expiration

3. **Business Metrics**:
   - Active users
   - Email triage accuracy
   - Task completion rates
   - AI response quality scores

### External Monitoring

#### Sentry (Error Tracking)
```bash
# Add to .env.production.local
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

#### DataDog (Infrastructure Monitoring)
```bash
# Add DataDog agent to compose
datadog:
  image: datadog/agent:latest
  environment:
    - DD_API_KEY=your-datadog-api-key
    - DD_SITE=datadoghq.com
```

## 🔒 Security Considerations

### Production Security Checklist

- [ ] **SSL/TLS**: HTTPS everywhere with valid certificates
- [ ] **Environment Variables**: Never commit sensitive keys
- [ ] **Firewall**: Restrict ports (only 80/443 exposed)
- [ ] **Database**: Strong passwords, no default credentials
- [ ] **Updates**: Keep base images updated
- [ ] **Backups**: Automated database backups
- [ ] **Secrets Management**: Use Docker secrets or external vaults

### Security Headers (nginx.conf handles these)

- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Strict Transport Security (HSTS)

## 🔄 Backup & Recovery

### Automated Backups

```bash
# Database backup (via deploy script)
./deploy.sh backup

# Schedule daily backups with cron
0 2 * * * /path/to/martin-plus-plus/deploy.sh backup
```

### Recovery

```bash
# Stop services
./deploy.sh stop

# Restore database
docker exec -i martin-postgres psql -U martin_user martin < backup_file.sql

# Restart services
./deploy.sh start
```

## 🚦 Performance Optimization

### Frontend Optimization

```typescript
// Apply in production builds
const productionConfig = {
  bundleAnalyzer: false,
  minimize: true,
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        chunks: 'all',
      },
    },
  },
};
```

### Database Optimization

```sql
-- Database indexes (already included in schema)
CREATE INDEX CONCURRENTLY idx_emails_status ON emails(status);
CREATE INDEX CONCURRENTLY idx_tasks_priority ON tasks(priority);
CREATE INDEX CONCURRENTLY idx_chat_timestamps ON chat_messages(created_at);
```

### Caching Strategy

```typescript
// Redis caching for frequently accessed data
const CACHE_TTL = {
  user_profile: 3600,      // 1 hour
  email_metadata: 1800,    // 30 minutes
  calendar_events: 900,    // 15 minutes
  ai_responses: 3600,      // 1 hour
};
```

## 🌍 Production Checklist

### Pre-launch
- [ ] All environment variables configured
- [ ] SSL certificates installed
- [ ] Domain DNS configured
- [ ] Health checks passing
- [ ] Backup strategy tested
- [ ] Monitoring configured

### Post-launch
- [ ] Performance baseline established
- [ ] Error monitoring active
- [ ] Backup schedule verified
- [ ] Scaling strategy tested
- [ ] Incident response plan ready

## 🚨 Troubleshooting

### Common Issues

1. **Health Check Failures**
   ```bash
   # Check container logs
   docker-compose logs martin-app

   # Verify database connection
   docker-compose exec postgres pg_isready -U martin_user -d martin
   ```

2. **High Memory Usage**
   ```bash
   # Check container stats
   docker stats

   # Restart specific service
   docker-compose restart martin-app
   ```

3. **SSL Issues**
   ```bash
   # Test SSL certificate
   openssl s_client -connect your-domain.com:443 -servername your-domain.com

   # Check nginx config
   docker-compose exec nginx nginx -t
   ```

## 📈 Scaling Roadmap

### Phase 1: Single Server (Current)
- ✅ Docker containerization
- ✅ Nginx load balancing ready
- ✅ Health checks implemented

### Phase 2: Multi-Server (Next)
- 🔄 Kubernetes deployment
- 🔄 Horizontal Pod Autoscaling
- 🔄 Multi-region deployment

### Phase 3: Enterprise Scale
- 🔄 Service mesh (Istio)
- 🔄 Advanced monitoring (Prometheus + Grafana)
- 🔄 AI model optimization

---

## 🎯 Support

- **Documentation**: `/docs/` directory
- **Logs**: `docker-compose logs -f`
- **Health**: `https://your-domain.com/health`
- **Metrics**: Application logs contain detailed metrics

**Martin++ is production-ready!** 🚀
