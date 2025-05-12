output "endpoint" {
  description = "Endpoint of the RDS instance"
  value       = module.db.db_instance_endpoint
  sensitive   = true
}

output "port" {
  description = "Port of the RDS instance"
  value       = module.db.db_instance_port
}

output "security_group_id" {
  description = "Security group ID of the RDS instance"
  value       = aws_security_group.db.id
}

output "db_name" {
  description = "Name of the database"
  value       = module.db.db_instance_name
}

output "username" {
  description = "Master username of the database"
  value       = module.db.db_instance_username
  sensitive   = true
}

output "arn" {
  description = "ARN of the RDS instance"
  value       = module.db.db_instance_arn
}

output "id" {
  description = "ID of the RDS instance"
  value       = module.db.db_instance_id
} 