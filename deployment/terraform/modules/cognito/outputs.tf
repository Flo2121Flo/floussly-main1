output "user_pool_id" {
  description = "ID of the Cognito User Pool"
  value       = aws_cognito_user_pool.app.id
}

output "user_pool_arn" {
  description = "ARN of the Cognito User Pool"
  value       = aws_cognito_user_pool.app.arn
}

output "client_id" {
  description = "ID of the Cognito User Pool Client"
  value       = aws_cognito_user_pool_client.app.id
}

output "client_secret" {
  description = "Secret of the Cognito User Pool Client"
  value       = aws_cognito_user_pool_client.app.client_secret
  sensitive   = true
}

output "domain" {
  description = "Domain of the Cognito User Pool"
  value       = aws_cognito_user_pool_domain.app.domain
}

output "domain_cloudfront_distribution_arn" {
  description = "CloudFront distribution ARN for the Cognito domain"
  value       = aws_cognito_user_pool_domain.app.cloudfront_distribution_arn
}

output "google_provider_name" {
  description = "Name of the Google identity provider"
  value       = aws_cognito_identity_provider.google.provider_name
}

output "facebook_provider_name" {
  description = "Name of the Facebook identity provider"
  value       = aws_cognito_identity_provider.facebook.provider_name
} 