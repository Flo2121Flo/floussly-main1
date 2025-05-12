# Floussly Infrastructure Deployment

This directory contains the Terraform configuration for deploying the Floussly fintech application infrastructure on AWS.

## Prerequisites

1. AWS CLI installed and configured with appropriate credentials
2. Terraform v1.0.0 or later installed
3. S3 bucket for Terraform state storage
4. DynamoDB table for Terraform state locking
5. SSL certificate in AWS Certificate Manager
6. Route53 hosted zone for your domain

## Infrastructure Components

The infrastructure includes:

- VPC with public and private subnets
- RDS PostgreSQL database
- ECS Fargate cluster for the backend
- S3 buckets for file storage
- CloudFront distribution for the frontend
- Cognito user pool for authentication
- API Gateway for API management
- SNS topics for notifications
- CloudWatch for monitoring and logging
- KMS for encryption
- IAM roles and policies
- Secrets Manager for sensitive data

## Deployment Steps

1. Initialize Terraform:
   ```bash
   terraform init
   ```

2. Create a `terraform.tfvars` file with your configuration:
   ```hcl
   app_name = "floussly"
   environment = "dev"
   aws_region = "us-east-1"
   domain_name = "your-domain.com"
   certificate_arn = "arn:aws:acm:region:account:certificate/certificate-id"
   route53_zone_id = "your-zone-id"
   db_password = "your-db-password"
   jwt_secret = "your-jwt-secret"
   aws_access_key_id = "your-access-key"
   aws_secret_access_key = "your-secret-key"
   google_client_id = "your-google-client-id"
   google_client_secret = "your-google-client-secret"
   facebook_client_id = "your-facebook-client-id"
   facebook_client_secret = "your-facebook-client-secret"
   notification_email = "your-email@example.com"
   ```

3. Plan the deployment:
   ```bash
   terraform plan
   ```

4. Apply the configuration:
   ```bash
   terraform apply
   ```

## Outputs

After successful deployment, Terraform will output:

- VPC and subnet information
- Database connection details
- ECS cluster and service information
- ALB DNS name
- S3 bucket details
- CloudFront distribution domain
- Cognito user pool and client IDs
- API Gateway URL
- SNS topic ARN
- CloudWatch dashboard URL
- KMS key details
- Secrets Manager secret information

## Security Considerations

- All sensitive data is stored in AWS Secrets Manager
- Database credentials are managed securely
- SSL/TLS encryption is enabled for all endpoints
- IAM roles follow the principle of least privilege
- KMS encryption is used for data at rest
- VPC endpoints are used for AWS service access
- Security groups are configured with minimal required access

## Monitoring and Logging

- CloudWatch alarms for critical metrics
- Log groups for application and infrastructure logs
- Custom dashboard for monitoring key metrics
- SNS notifications for alerts

## Maintenance

To update the infrastructure:

1. Make changes to the Terraform configuration
2. Run `terraform plan` to review changes
3. Apply changes with `terraform apply`

To destroy the infrastructure:

```bash
terraform destroy
```

## Troubleshooting

Common issues and solutions:

1. State locking issues:
   - Check DynamoDB table permissions
   - Verify S3 bucket access

2. VPC endpoint issues:
   - Verify security group rules
   - Check route table configurations

3. ECS deployment issues:
   - Check task definition
   - Verify IAM roles and policies
   - Review CloudWatch logs

4. Database connection issues:
   - Verify security group rules
   - Check VPC endpoint configurations
   - Review RDS parameter groups

## Support

For support, please contact the DevOps team or create an issue in the repository. 