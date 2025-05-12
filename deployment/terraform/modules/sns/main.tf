resource "aws_sns_topic" "app" {
  name = "${var.app_name}-${var.environment}-notifications"

  kms_master_key_id = var.kms_key_arn

  tags = {
    Environment = var.environment
    Terraform   = "true"
    Application = var.app_name
  }
}

resource "aws_sns_topic_policy" "app" {
  arn = aws_sns_topic.app.arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "s3.amazonaws.com"
        }
        Action   = "SNS:Publish"
        Resource = aws_sns_topic.app.arn
        Condition = {
          ArnLike = {
            "aws:SourceArn": var.s3_bucket_arn
          }
        }
      },
      {
        Effect = "Allow"
        Principal = {
          AWS = var.ecs_task_role_arn
        }
        Action = [
          "SNS:Publish",
          "SNS:Subscribe"
        ]
        Resource = aws_sns_topic.app.arn
      }
    ]
  })
}

resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.app.arn
  protocol  = "email"
  endpoint  = var.notification_email
}

resource "aws_sns_topic_subscription" "sms" {
  count     = var.enable_sms_notifications ? 1 : 0
  topic_arn = aws_sns_topic.app.arn
  protocol  = "sms"
  endpoint  = var.sms_number
}

resource "aws_cloudwatch_metric_alarm" "sns_delivery_failure" {
  alarm_name          = "${var.app_name}-${var.environment}-sns-delivery-failure"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "NumberOfNotificationsFailed"
  namespace           = "AWS/SNS"
  period             = "300"
  statistic          = "Sum"
  threshold          = "0"
  alarm_description  = "This metric monitors SNS notification delivery failures"
  alarm_actions      = [aws_sns_topic.app.arn]

  dimensions = {
    TopicName = aws_sns_topic.app.name
  }

  tags = {
    Environment = var.environment
    Terraform   = "true"
    Application = var.app_name
  }
} 