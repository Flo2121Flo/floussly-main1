resource "aws_apigatewayv2_api" "app" {
  name          = "${var.app_name}-${var.environment}-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_headers = ["*"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_origins = var.allowed_origins
    max_age       = 300
  }

  tags = {
    Environment = var.environment
    Terraform   = "true"
    Application = var.app_name
  }
}

resource "aws_apigatewayv2_stage" "app" {
  api_id = aws_apigatewayv2_api.app.id
  name   = var.environment
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip            = "$context.identity.sourceIp"
      requestTime   = "$context.requestTime"
      httpMethod    = "$context.httpMethod"
      routeKey      = "$context.routeKey"
      status        = "$context.status"
      protocol      = "$context.protocol"
      responseLength = "$context.responseLength"
      integrationError = "$context.integrationErrorMessage"
    })
  }

  tags = {
    Environment = var.environment
    Terraform   = "true"
    Application = var.app_name
  }
}

resource "aws_apigatewayv2_integration" "app" {
  api_id           = aws_apigatewayv2_api.app.id
  integration_type = "HTTP_PROXY"

  integration_method = "ANY"
  integration_uri    = var.alb_listener_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "app" {
  api_id    = aws_apigatewayv2_api.app.id
  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.app.id}"
}

resource "aws_apigatewayv2_domain_name" "app" {
  domain_name = "api.${var.domain_name}"

  domain_name_configuration {
    certificate_arn = var.certificate_arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }
}

resource "aws_apigatewayv2_api_mapping" "app" {
  api_id      = aws_apigatewayv2_api.app.id
  domain_name = aws_apigatewayv2_domain_name.app.id
  stage       = aws_apigatewayv2_stage.app.id
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/aws/apigateway/${var.app_name}-${var.environment}"
  retention_in_days = 30

  tags = {
    Environment = var.environment
    Terraform   = "true"
    Application = var.app_name
  }
}

resource "aws_route53_record" "api" {
  zone_id = var.route53_zone_id
  name    = "api.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_apigatewayv2_domain_name.app.domain_name_configuration[0].target_domain_name
    zone_id                = aws_apigatewayv2_domain_name.app.domain_name_configuration[0].hosted_zone_id
    evaluate_target_health = false
  }
} 