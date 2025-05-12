provider "aws" {
  region = var.aws_region
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }

  backend "s3" {
    bucket         = "floussly-terraform-state"
    key            = "terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "floussly-terraform-locks"
  }
}

module "vpc" {
  source = "./modules/vpc"

  app_name    = var.app_name
  environment = var.environment
  aws_region  = var.aws_region
  vpc_cidr    = var.vpc_cidr
}

module "security" {
  source = "./modules/security"

  app_name                = var.app_name
  environment            = var.environment
  s3_bucket_arn          = module.s3.bucket_arn
  sns_topic_arn          = module.sns.topic_arn
  cloudwatch_log_group_arn = module.monitoring.log_group_arn
  jwt_secret             = var.jwt_secret
  aws_access_key_id      = var.aws_access_key_id
  aws_secret_access_key  = var.aws_secret_access_key
  db_password            = var.db_password
}

module "database" {
  source = "./modules/database"

  app_name              = var.app_name
  environment          = var.environment
  vpc_id               = module.vpc.vpc_id
  private_subnet_ids   = module.vpc.private_subnets
  ecs_security_group_id = module.ecs.security_group_id
  db_name              = var.db_name
  db_username          = var.db_username
  db_password          = var.db_password
  db_instance_class    = var.db_instance_class
  backup_retention_period = var.backup_retention_period
  monitoring_interval    = var.monitoring_interval
}

module "ecs" {
  source = "./modules/ecs"

  app_name                = var.app_name
  environment            = var.environment
  aws_region             = var.aws_region
  vpc_id                 = module.vpc.vpc_id
  private_subnet_ids     = module.vpc.private_subnets
  public_subnet_ids      = module.vpc.public_subnets
  container_cpu          = var.container_cpu
  container_memory       = var.container_memory
  min_capacity           = var.min_capacity
  max_capacity           = var.max_capacity
  enable_auto_scaling    = var.enable_auto_scaling
  certificate_arn        = var.certificate_arn
  ecr_repository_url     = var.ecr_repository_url
  db_endpoint            = module.database.endpoint
  db_port                = module.database.port
  db_name                = module.database.db_name
  db_username            = module.database.username
  db_password            = module.database.password
  redis_url              = var.redis_url
  jwt_secret_arn         = module.security.secrets_arn
  aws_access_key_id_arn  = module.security.secrets_arn
  aws_secret_access_key_arn = module.security.secrets_arn
  s3_bucket_arn          = module.s3.bucket_arn
  sns_topic_arn          = module.sns.topic_arn
}

module "s3" {
  source = "./modules/s3"

  app_name              = var.app_name
  environment          = var.environment
  allowed_origins      = var.allowed_origins
  ecs_task_role_arn    = module.ecs.ecs_task_role_arn
  sns_topic_arn        = module.sns.topic_arn
}

module "cloudfront" {
  source = "./modules/cloudfront"

  app_name                        = var.app_name
  environment                    = var.environment
  s3_bucket_id                   = module.s3.bucket_name
  s3_bucket_arn                  = module.s3.bucket_arn
  s3_bucket_regional_domain_name = module.s3.bucket_regional_domain_name
  certificate_arn                = var.certificate_arn
}

module "cognito" {
  source = "./modules/cognito"

  app_name              = var.app_name
  environment          = var.environment
  certificate_arn      = var.certificate_arn
  callback_urls        = var.callback_urls
  logout_urls          = var.logout_urls
  google_client_id     = var.google_client_id
  google_client_secret = var.google_client_secret
  facebook_client_id   = var.facebook_client_id
  facebook_client_secret = var.facebook_client_secret
}

module "api_gateway" {
  source = "./modules/api_gateway"

  app_name           = var.app_name
  environment       = var.environment
  domain_name       = var.domain_name
  allowed_origins   = var.allowed_origins
  certificate_arn   = var.certificate_arn
  alb_listener_arn  = module.ecs.alb_listener_arn
  route53_zone_id   = var.route53_zone_id
}

module "sns" {
  source = "./modules/sns"

  app_name              = var.app_name
  environment          = var.environment
  kms_key_arn          = module.security.kms_key_arn
  s3_bucket_arn        = module.s3.bucket_arn
  ecs_task_role_arn    = module.ecs.ecs_task_role_arn
  notification_email   = var.notification_email
  enable_sms_notifications = var.enable_sms_notifications
  sms_number           = var.sms_number
}

module "monitoring" {
  source = "./modules/monitoring"

  app_name              = var.app_name
  environment          = var.environment
  aws_region           = var.aws_region
  ecs_cluster_name     = module.ecs.cluster_name
  ecs_service_name     = module.ecs.service_name
  db_instance_id       = module.database.id
  api_gateway_id       = module.api_gateway.api_id
  alb_arn_suffix       = module.ecs.alb_arn_suffix
  sns_topic_arn        = module.sns.topic_arn
  ecs_log_group_name   = module.ecs.log_group_name
} 