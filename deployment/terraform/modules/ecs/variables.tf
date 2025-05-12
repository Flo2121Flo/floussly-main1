variable "app_name" {
  description = "Name of the application"
  type        = string
}

variable "environment" {
  description = "Environment (dev/staging/prod)"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs"
  type        = list(string)
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs"
  type        = list(string)
}

variable "container_cpu" {
  description = "CPU units for the container"
  type        = number
}

variable "container_memory" {
  description = "Memory for the container"
  type        = number
}

variable "min_capacity" {
  description = "Minimum number of tasks"
  type        = number
}

variable "max_capacity" {
  description = "Maximum number of tasks"
  type        = number
}

variable "enable_auto_scaling" {
  description = "Enable auto scaling"
  type        = bool
}

variable "certificate_arn" {
  description = "ARN of the SSL certificate"
  type        = string
}

variable "ecr_repository_url" {
  description = "URL of the ECR repository"
  type        = string
}

variable "db_endpoint" {
  description = "Endpoint of the RDS instance"
  type        = string
}

variable "db_port" {
  description = "Port of the RDS instance"
  type        = string
}

variable "db_name" {
  description = "Name of the database"
  type        = string
}

variable "db_username" {
  description = "Database master username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

variable "redis_url" {
  description = "URL of the Redis instance"
  type        = string
}

variable "jwt_secret_arn" {
  description = "ARN of the JWT secret in Secrets Manager"
  type        = string
}

variable "aws_access_key_id_arn" {
  description = "ARN of the AWS access key ID in Secrets Manager"
  type        = string
}

variable "aws_secret_access_key_arn" {
  description = "ARN of the AWS secret access key in Secrets Manager"
  type        = string
}

variable "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  type        = string
}

variable "sns_topic_arn" {
  description = "ARN of the SNS topic"
  type        = string
} 