output "distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.app.id
}

output "domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.app.domain_name
}

output "hosted_zone_id" {
  description = "Hosted zone ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.app.hosted_zone_id
}

output "origin_access_identity" {
  description = "CloudFront origin access identity"
  value       = aws_cloudfront_origin_access_identity.app.cloudfront_access_identity_path
} 