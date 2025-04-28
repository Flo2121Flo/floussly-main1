# Floussly Deployment Guide

## Prerequisites

- Docker and Docker Compose
- Node.js 18.x
- AWS CLI
- PostgreSQL 14.x
- Redis 7.x
- Nginx

## Local Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/floussly.git
cd floussly
```

2. Create a `.env` file with the required environment variables (see `.env.example`)

3. Start the development environment:
```bash
docker-compose up -d
```

4. Access the application:
- Frontend: http://localhost:80
- Backend API: http://localhost:3000

## Production Deployment

### 1. Infrastructure Setup

#### AWS Setup
1. Create an ECS cluster
2. Create an ECR repository
3. Set up RDS for PostgreSQL
4. Set up ElastiCache for Redis
5. Configure IAM roles and policies
6. Set up Parameter Store for secrets

#### Database Setup
1. Create the database:
```bash
psql -U postgres -c "CREATE DATABASE floussly;"
```

2. Run migrations:
```bash
npm run migrate
```

### 2. Build and Deploy

#### Using Docker
1. Build the Docker image:
```bash
docker build -t floussly .
```

2. Tag and push to ECR:
```bash
aws ecr get-login-password --region REGION | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com
docker tag floussly:latest ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/floussly:latest
docker push ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/floussly:latest
```

#### Using CI/CD
1. Push to main branch
2. GitHub Actions will automatically:
   - Run tests
   - Build the application
   - Deploy to ECS

### 3. Monitoring and Maintenance

#### Logging
- Application logs are sent to CloudWatch
- Access logs through AWS Console or CLI

#### Health Checks
- Application health endpoint: `/health`
- Database connection check: `/health/db`
- Redis connection check: `/health/redis`

#### Backup and Recovery
- Database backups are automated through RDS
- Redis persistence is configured
- Regular snapshots of EBS volumes

### 4. Scaling

#### Horizontal Scaling
- ECS auto-scaling is configured
- Load balancer distributes traffic
- Redis cluster for high availability

#### Vertical Scaling
- Adjust ECS task CPU and memory
- Scale RDS instance size
- Scale ElastiCache node size

## Security Considerations

1. All secrets are stored in AWS Parameter Store
2. SSL/TLS is enforced
3. CORS is properly configured
4. Rate limiting is implemented
5. Regular security updates

## Troubleshooting

### Common Issues

1. Database Connection Issues
   - Check RDS security groups
   - Verify database credentials
   - Check network connectivity

2. Redis Connection Issues
   - Check ElastiCache security groups
   - Verify Redis credentials
   - Check network connectivity

3. Application Issues
   - Check CloudWatch logs
   - Verify environment variables
   - Check ECS task status

### Support

For support, contact:
- Email: support@floussly.com
- Slack: #floussly-support 