variable "app_name" {
  description = "Name of the application"
  type        = string
}

variable "environment" {
  description = "Environment (dev/staging/prod)"
  type        = string
}

variable "kms_key_arn" {
  description = "ARN of the KMS key for encryption"
  type        = string
}

variable "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  type        = string
}

variable "ecs_task_role_arn" {
  description = "ARN of the ECS task role"
  type        = string
}

variable "notification_email" {
  description = "Email address for notifications"
  type        = string
}

variable "enable_sms_notifications" {
  description = "Enable SMS notifications"
  type        = bool
  default     = false
}

variable "sms_number" {
  description = "Phone number for SMS notifications"
  type        = string
  default     = ""
} 