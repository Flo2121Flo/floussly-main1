module "db" {
  source  = "terraform-aws-modules/rds/aws"
  version = "4.5.0"

  identifier = "${var.app_name}-${var.environment}-db"

  engine            = "postgres"
  engine_version    = "14.4"
  instance_class    = var.db_instance_class
  allocated_storage = 20

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password
  port     = "5432"

  vpc_security_group_ids = [aws_security_group.db.id]
  subnet_ids             = var.private_subnet_ids

  family = "postgres14"

  backup_retention_period = var.backup_retention_period
  skip_final_snapshot    = false
  deletion_protection    = true

  performance_insights_enabled          = true
  performance_insights_retention_period = 7
  create_monitoring_role               = true
  monitoring_interval                  = var.monitoring_interval

  parameters = [
    {
      name  = "log_connections"
      value = "1"
    },
    {
      name  = "log_disconnections"
      value = "1"
    },
    {
      name  = "log_statement"
      value = "ddl"
    }
  ]

  tags = {
    Environment = var.environment
    Terraform   = "true"
    Application = var.app_name
  }
}

resource "aws_security_group" "db" {
  name        = "${var.app_name}-${var.environment}-db-sg"
  description = "Security group for RDS instance"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.ecs_security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.app_name}-${var.environment}-db-sg"
    Environment = var.environment
    Terraform   = "true"
    Application = var.app_name
  }
} 