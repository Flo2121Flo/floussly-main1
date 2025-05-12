output "dashboard_url" {
  description = "URL of the CloudWatch dashboard"
  value       = "https://${var.aws_region}.console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${aws_cloudwatch_dashboard.app.dashboard_name}"
}

output "cpu_utilization_alarm_arn" {
  description = "ARN of the CPU utilization alarm"
  value       = aws_cloudwatch_metric_alarm.cpu_utilization.arn
}

output "memory_utilization_alarm_arn" {
  description = "ARN of the memory utilization alarm"
  value       = aws_cloudwatch_metric_alarm.memory_utilization.arn
}

output "db_cpu_utilization_alarm_arn" {
  description = "ARN of the database CPU utilization alarm"
  value       = aws_cloudwatch_metric_alarm.db_cpu_utilization.arn
}

output "api_errors_alarm_arn" {
  description = "ARN of the API errors alarm"
  value       = aws_cloudwatch_metric_alarm.api_errors.arn
}

output "error_logs_alarm_arn" {
  description = "ARN of the error logs alarm"
  value       = aws_cloudwatch_metric_alarm.error_logs.arn
}

output "error_logs_metric_name" {
  description = "Name of the error logs metric"
  value       = aws_cloudwatch_log_metric_filter.error_logs.name
}

output "error_logs_metric_namespace" {
  description = "Namespace of the error logs metric"
  value       = "${var.app_name}/${var.environment}"
} 