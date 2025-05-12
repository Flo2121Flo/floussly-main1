resource "aws_cognito_user_pool" "app" {
  name = "${var.app_name}-${var.environment}-user-pool"

  auto_verified_attributes = ["email"]
  alias_attributes        = ["email", "preferred_username"]
  username_attributes     = ["email"]

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
  }

  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "email"
    required                 = true

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "name"
    required                 = true

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "phone_number"
    required                 = false

    string_attribute_constraints {
      min_length = 0
      max_length = 256
    }
  }

  admin_create_user_config {
    allow_admin_create_user_only = false
  }

  tags = {
    Environment = var.environment
    Terraform   = "true"
    Application = var.app_name
  }
}

resource "aws_cognito_user_pool_client" "app" {
  name = "${var.app_name}-${var.environment}-client"

  user_pool_id = aws_cognito_user_pool.app.id

  generate_secret = true

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_MIGRATION"
  ]

  callback_urls = var.callback_urls
  logout_urls   = var.logout_urls

  allowed_oauth_flows = ["code", "implicit"]
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_scopes = ["email", "openid", "profile"]

  supported_identity_providers = ["COGNITO"]

  prevent_user_existence_errors = "ENABLED"

  token_validity_units {
    refresh_token = "days"
    access_token  = "hours"
    id_token      = "hours"
  }

  refresh_token_validity = 30
  access_token_validity  = 1
  id_token_validity     = 1
}

resource "aws_cognito_user_pool_domain" "app" {
  domain       = "${var.app_name}-${var.environment}"
  user_pool_id = aws_cognito_user_pool.app.id
  certificate_arn = var.certificate_arn
}

resource "aws_cognito_identity_provider" "google" {
  user_pool_id  = aws_cognito_user_pool.app.id
  provider_name = "Google"
  provider_type = "Google"

  provider_details = {
    authorize_scopes = "email profile openid"
    client_id        = var.google_client_id
    client_secret    = var.google_client_secret
  }

  attribute_mapping = {
    email    = "email"
    username = "sub"
  }
}

resource "aws_cognito_identity_provider" "facebook" {
  user_pool_id  = aws_cognito_user_pool.app.id
  provider_name = "Facebook"
  provider_type = "Facebook"

  provider_details = {
    api_version = "v12.0"
    client_id   = var.facebook_client_id
    client_secret = var.facebook_client_secret
  }

  attribute_mapping = {
    email    = "email"
    username = "id"
  }
} 