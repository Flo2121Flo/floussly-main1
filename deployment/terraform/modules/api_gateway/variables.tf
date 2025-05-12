variable "app_name" {
  description = "Name of the application"
  type        = string
}

variable "environment" {
  description = "Environment (dev/staging/prod)"
  type        = string
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
}

variable "allowed_origins" {
  description = "List of allowed origins for CORS"
  type        = list(string)
}

variable "certificate_arn" {
  description = "ARN of the SSL certificate"
  type        = string
}

variable "alb_listener_arn" {
  description = "ARN of the ALB listener"
  type        = string
}

variable "route53_zone_id" {
  description = "ID of the Route53 hosted zone"
  type        = string
} 