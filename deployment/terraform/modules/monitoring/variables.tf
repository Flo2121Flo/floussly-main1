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

variable "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  type        = string
}

variable "ecs_service_name" {
  description = "Name of the ECS service"
  type        = string
}

variable "db_instance_id" {
  description = "ID of the RDS instance"
  type        = string
}

variable "api_gateway_id" {
  description = "ID of the API Gateway"
  type        = string
}

variable "alb_arn_suffix" {
  description = "ARN suffix of the ALB"
  type        = string
}

variable "sns_topic_arn" {
  description = "ARN of the SNS topic"
  type        = string
}

variable "ecs_log_group_name" {
  description = "Name of the ECS log group"
  type        = string
} 