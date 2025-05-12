output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "private_subnets" {
  description = "List of private subnet IDs"
  value       = module.vpc.private_subnets
}

output "public_subnets" {
  description = "List of public subnet IDs"
  value       = module.vpc.public_subnets
}

output "database_endpoint" {
  description = "Endpoint of the RDS instance"
  value       = module.database.endpoint
}

output "database_port" {
  description = "Port of the RDS instance"
  value       = module.database.port
}

output "database_name" {
  description = "Name of the database"
  value       = module.database.db_name
}

output "database_username" {
  description = "Username for the database"
  value       = module.database.username
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = module.ecs.cluster_name
}

output "ecs_service_name" {
  description = "Name of the ECS service"
  value       = module.ecs.service_name
}

output "alb_dns_name" {
  description = "DNS name of the ALB"
  value       = module.ecs.alb_dns_name
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket"
  value       = module.s3.bucket_name
}

output "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = module.s3.bucket_arn
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = module.cloudfront.domain_name
}

output "cognito_user_pool_id" {
  description = "ID of the Cognito user pool"
  value       = module.cognito.user_pool_id
}

output "cognito_user_pool_client_id" {
  description = "ID of the Cognito user pool client"
  value       = module.cognito.user_pool_client_id
}

output "api_gateway_url" {
  description = "URL of the API Gateway"
  value       = module.api_gateway.api_url
}

output "api_gateway_id" {
  description = "ID of the API Gateway"
  value       = module.api_gateway.api_id
}

output "sns_topic_arn" {
  description = "ARN of the SNS topic"
  value       = module.sns.topic_arn
}

output "monitoring_dashboard_url" {
  description = "URL of the CloudWatch dashboard"
  value       = module.monitoring.dashboard_url
}

output "kms_key_arn" {
  description = "ARN of the KMS key"
  value       = module.security.kms_key_arn
}

output "kms_key_id" {
  description = "ID of the KMS key"
  value       = module.security.kms_key_id
}

output "secrets_arn" {
  description = "ARN of the Secrets Manager secret"
  value       = module.security.secrets_arn
}

output "secrets_name" {
  description = "Name of the Secrets Manager secret"
  value       = module.security.secrets_name
} 