resource "aws_cloudwatch_dashboard" "app" {
  dashboard_name = "${var.app_name}-${var.environment}-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/ECS", "CPUUtilization", "ServiceName", var.ecs_service_name, "ClusterName", var.ecs_cluster_name],
            ["AWS/ECS", "MemoryUtilization", "ServiceName", var.ecs_service_name, "ClusterName", var.ecs_cluster_name]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "ECS Service Metrics"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", var.db_instance_id],
            ["AWS/RDS", "FreeableMemory", "DBInstanceIdentifier", var.db_instance_id]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "RDS Metrics"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/ApiGateway", "4XXError", "ApiId", var.api_gateway_id, "Stage", var.environment],
            ["AWS/ApiGateway", "5XXError", "ApiId", var.api_gateway_id, "Stage", var.environment]
          ]
          period = 300
          stat   = "Sum"
          region = var.aws_region
          title  = "API Gateway Errors"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 6
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", var.alb_arn_suffix],
            ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", var.alb_arn_suffix]
          ]
          period = 300
          stat   = "Sum"
          region = var.aws_region
          title  = "ALB Metrics"
        }
      }
    ]
  })
}

resource "aws_cloudwatch_metric_alarm" "cpu_utilization" {
  alarm_name          = "${var.app_name}-${var.environment}-cpu-utilization"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period             = "300"
  statistic          = "Average"
  threshold          = "80"
  alarm_description  = "This metric monitors ECS CPU utilization"
  alarm_actions      = [var.sns_topic_arn]

  dimensions = {
    ClusterName = var.ecs_cluster_name
    ServiceName = var.ecs_service_name
  }

  tags = {
    Environment = var.environment
    Terraform   = "true"
    Application = var.app_name
  }
}

resource "aws_cloudwatch_metric_alarm" "memory_utilization" {
  alarm_name          = "${var.app_name}-${var.environment}-memory-utilization"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period             = "300"
  statistic          = "Average"
  threshold          = "80"
  alarm_description  = "This metric monitors ECS memory utilization"
  alarm_actions      = [var.sns_topic_arn]

  dimensions = {
    ClusterName = var.ecs_cluster_name
    ServiceName = var.ecs_service_name
  }

  tags = {
    Environment = var.environment
    Terraform   = "true"
    Application = var.app_name
  }
}

resource "aws_cloudwatch_metric_alarm" "db_cpu_utilization" {
  alarm_name          = "${var.app_name}-${var.environment}-db-cpu-utilization"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period             = "300"
  statistic          = "Average"
  threshold          = "80"
  alarm_description  = "This metric monitors RDS CPU utilization"
  alarm_actions      = [var.sns_topic_arn]

  dimensions = {
    DBInstanceIdentifier = var.db_instance_id
  }

  tags = {
    Environment = var.environment
    Terraform   = "true"
    Application = var.app_name
  }
}

resource "aws_cloudwatch_metric_alarm" "api_errors" {
  alarm_name          = "${var.app_name}-${var.environment}-api-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "5XXError"
  namespace           = "AWS/ApiGateway"
  period             = "300"
  statistic          = "Sum"
  threshold          = "0"
  alarm_description  = "This metric monitors API Gateway 5XX errors"
  alarm_actions      = [var.sns_topic_arn]

  dimensions = {
    ApiId = var.api_gateway_id
    Stage = var.environment
  }

  tags = {
    Environment = var.environment
    Terraform   = "true"
    Application = var.app_name
  }
}

resource "aws_cloudwatch_log_metric_filter" "error_logs" {
  name           = "${var.app_name}-${var.environment}-error-logs"
  pattern        = "{ $.level = \"ERROR\" }"
  log_group_name = var.ecs_log_group_name

  metric_transformation {
    name      = "ErrorCount"
    namespace = "${var.app_name}/${var.environment}"
    value     = "1"
  }
}

resource "aws_cloudwatch_metric_alarm" "error_logs" {
  alarm_name          = "${var.app_name}-${var.environment}-error-logs"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "ErrorCount"
  namespace           = "${var.app_name}/${var.environment}"
  period             = "300"
  statistic          = "Sum"
  threshold          = "0"
  alarm_description  = "This metric monitors application error logs"
  alarm_actions      = [var.sns_topic_arn]

  tags = {
    Environment = var.environment
    Terraform   = "true"
    Application = var.app_name
  }
} 