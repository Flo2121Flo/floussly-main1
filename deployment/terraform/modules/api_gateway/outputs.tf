output "api_id" {
  description = "ID of the API Gateway"
  value       = aws_apigatewayv2_api.app.id
}

output "api_endpoint" {
  description = "Endpoint of the API Gateway"
  value       = aws_apigatewayv2_api.app.api_endpoint
}

output "stage_endpoint" {
  description = "Endpoint of the API Gateway stage"
  value       = "${aws_apigatewayv2_api.app.api_endpoint}/${aws_apigatewayv2_stage.app.name}"
}

output "domain_name" {
  description = "Domain name of the API Gateway"
  value       = aws_apigatewayv2_domain_name.app.domain_name
}

output "domain_name_configuration" {
  description = "Domain name configuration of the API Gateway"
  value       = aws_apigatewayv2_domain_name.app.domain_name_configuration
}

output "log_group_arn" {
  description = "ARN of the CloudWatch log group"
  value       = aws_cloudwatch_log_group.api.arn
}

output "log_group_name" {
  description = "Name of the CloudWatch log group"
  value       = aws_cloudwatch_log_group.api.name
} 