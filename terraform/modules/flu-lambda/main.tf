// Copyright (c) 2018 by Audere
//
// Use of this source code is governed by an MIT-style license that
// can be found in the LICENSE file distributed with this file.

locals {
  base_name = "flu-${var.environment}-lambda"
  handler_archive_path = "${path.module}/../../../FluLambda/build/FluLambda.zip"
  slack_archive_path = "../../../local/lambda/cloudwatch-slack.zip"

  // This is 8:30 AM and 1:30 PM local in PST
  // See: https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html
  cron_weekdays_before_9AM_and_1PM_PST = "cron(30 15,19 ? * MON-FRI *)"
  cron_weekdays_before_1PM_PST = "cron(30 19 ? * MON-FRI *)"
  cron_weekdays_at_4AM_PST = "cron(0 10 ? * MON-FRI *)"
  cron_everyday_at_5AM_PST = "cron(0 12 ? * * *)"
  cron_monday_thursday_before_9AM_PST = "cron(30 15 ? * MON,THU *)"
}

resource "aws_iam_role" "flu_lambda" {
  name = "${local.base_name}"
  assume_role_policy = "${data.aws_iam_policy_document.flu_lambda_role_policy.json}"
}

data "aws_iam_policy_document" "flu_lambda_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "lambda_vpc_access_managed_policy" {
  role = "${aws_iam_role.flu_lambda.name}"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

module "hutch_upload_cron" {
  source = "../lambda-cron"

  frequency = "rate(1 hour)"
  name = "${local.base_name}-hutch-upload"
  notification_topic = "${var.infra_alerts_sns_topic_arn}"
  role_arn = "${aws_iam_role.flu_lambda.arn}"
  security_group_ids = ["${var.internal_elb_access_sg}"]
  subnet_id = "${var.lambda_subnet_id}"
  url = "http://${var.fluapi_fqdn}:444/api/export/sendEncounters"
}

module "fever_consent_emailer_cron" {
  source = "../lambda-cron"

  frequency = "rate(1 hour)"
  name = "${local.base_name}-fever-consent-emailer"
  notification_topic = "${var.infra_alerts_sns_topic_arn}"
  role_arn = "${aws_iam_role.flu_lambda.arn}"
  security_group_ids = ["${var.internal_elb_access_sg}"]
  subnet_id = "${var.lambda_subnet_id}"
  url = "http://${var.fluapi_fqdn}:444/api/sendFeverConsentEmails"
}

module "sniffles_consent_emailer_cron" {
  source = "../lambda-cron"

  frequency = "rate(1 hour)"
  name = "${local.base_name}-sniffles-consent-emailer"
  notification_topic = "${var.infra_alerts_sns_topic_arn}"
  role_arn = "${aws_iam_role.flu_lambda.arn}"
  security_group_ids = ["${var.internal_elb_access_sg}"]
  subnet_id = "${var.lambda_subnet_id}"
  url = "http://${var.fluapi_fqdn}:444/api/sendSnifflesConsentEmails"
}

module "sniffles_visit_jobs_cron" {
  source = "../lambda-cron"

  frequency = "rate(1 hour)"
  name = "${local.base_name}-sniffles-visit-jobs"
  notification_topic = "${var.infra_alerts_sns_topic_arn}"
  role_arn = "${aws_iam_role.flu_lambda.arn}"
  security_group_ids = ["${var.internal_elb_access_sg}"]
  subnet_id = "${var.lambda_subnet_id}"
  url = "http://${var.fluapi_fqdn}:444/api/runSnifflesJobs"
}

module "cough_firebase_import" {
  source = "../lambda-cron"

  frequency = "rate(1 hour)"
  name = "${local.base_name}-cough-firebase-import"
  notification_topic = "${var.infra_alerts_sns_topic_arn}"
  role_arn = "${aws_iam_role.flu_lambda.arn}"
  security_group_ids = ["${var.internal_elb_access_sg}"]
  subnet_id = "${var.lambda_subnet_id}"
  timeout = 300
  url = "http://${var.fluapi_fqdn}:444/api/import/coughDocuments"
}

module "cough_photo_upload" {
  source = "../lambda-cron"

  frequency = "rate(1 hour)"
  name = "${local.base_name}-cough-photo-upload"
  notification_topic = "${var.infra_alerts_sns_topic_arn}"
  role_arn = "${aws_iam_role.flu_lambda.arn}"
  security_group_ids = ["${var.internal_elb_access_sg}"]
  subnet_id = "${var.lambda_subnet_id}"
  timeout = 300
  url = "http://${var.fluapi_fqdn}:444/api/cough/uploadPhotos"
}

module "cough_analytics_import" {
  source = "../lambda-cron"

  frequency = "${local.cron_everyday_at_5AM_PST}"
  name = "${local.base_name}-cough-analytics-import"
  notification_topic = "${var.infra_alerts_sns_topic_arn}"
  role_arn = "${aws_iam_role.flu_lambda.arn}"
  security_group_ids = ["${var.internal_elb_access_sg}"]
  subnet_id = "${var.lambda_subnet_id}"
  timeout = 600
  url = "http://${var.fluapi_fqdn}:444/api/import/coughAnalytics"
}

resource "aws_lambda_function" "cough_aspren_import" {
  function_name = "${local.base_name}-cough-aspren-import"
  filename = "${local.handler_archive_path}"
  handler = "handler.cronGet"
  runtime = "nodejs8.10"
  source_code_hash = "${base64sha256(file("${local.handler_archive_path}"))}"
  role = "${aws_iam_role.flu_lambda.arn}"
  timeout = 300

  environment {
    variables = {
      TARGET_URL = "http://${var.fluapi_fqdn}:444/api/import/asprenReport"
      TIMEOUT = 300000
    }
  }

  vpc_config {
    subnet_ids = ["${var.lambda_subnet_id}"]
    security_group_ids = ["${var.internal_elb_access_sg}"]
  }
}

resource "aws_lambda_permission" "cough_aspren_import_s3_invocation" {
  action = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.cough_aspren_import.arn}"
  principal = "s3.amazonaws.com"
  source_arn = "${var.cough_aspren_bucket_arn}"
}

resource "aws_cloudwatch_metric_alarm" "cough_aspren_execution_errors" {
  alarm_name = "${local.base_name}-cough-aspren-import-execution-errors"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods = "1"
  metric_name = "Errors"
  namespace = "AWS/Lambda"
  period = "60"
  statistic = "Maximum"
  threshold = "1"
  treat_missing_data = "ignore"
  alarm_description = "This monitors ${local.base_name}-cough-aspren-import execution failures"

  alarm_actions = [
    "${var.infra_alerts_sns_topic_arn}"
  ]

  ok_actions = [
    "${var.infra_alerts_sns_topic_arn}"
  ]

  dimensions {
    FunctionName = "${aws_lambda_function.cough_aspren_import.function_name}"
    Resource = "${aws_lambda_function.cough_aspren_import.function_name}"
  }
}

resource "aws_s3_bucket_notification" "cough_aspren_reports_notification" {
  bucket = "${var.cough_aspren_bucket_id}"

  lambda_function {
    lambda_function_arn = "${aws_lambda_function.cough_aspren_import.arn}"
    events = ["s3:ObjectCreated:*"]
  }
}

resource "aws_lambda_function" "cough_follow_ups_import" {
  function_name = "${local.base_name}-cough-follow-ups-import"
  filename = "${local.handler_archive_path}"
  handler = "handler.cronGet"
  runtime = "nodejs8.10"
  source_code_hash = "${base64sha256(file("${local.handler_archive_path}"))}"
  role = "${aws_iam_role.flu_lambda.arn}"
  timeout = 300

  environment {
    variables = {
      TARGET_URL = "http://${var.fluapi_fqdn}:444/api/import/coughFollowUps"
      TIMEOUT = 300000
    }
  }

  vpc_config {
    subnet_ids = ["${var.lambda_subnet_id}"]
    security_group_ids = ["${var.internal_elb_access_sg}"]
  }
}

resource "aws_lambda_permission" "cough_follow_ups_import_s3_invocation" {
  action = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.cough_follow_ups_import.arn}"
  principal = "s3.amazonaws.com"
  source_arn = "${var.cough_follow_ups_bucket_arn}"
}

resource "aws_cloudwatch_metric_alarm" "cough_follow_ups_execution_errors" {
  alarm_name = "${local.base_name}-cough-follow-ups-import-execution-errors"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods = "1"
  metric_name = "Errors"
  namespace = "AWS/Lambda"
  period = "60"
  statistic = "Maximum"
  threshold = "1"
  treat_missing_data = "ignore"
  alarm_description = "This monitors ${local.base_name}-cough-follow-ups-import execution failures"

  alarm_actions = [
    "${var.infra_alerts_sns_topic_arn}"
  ]

  ok_actions = [
    "${var.infra_alerts_sns_topic_arn}"
  ]

  dimensions {
    FunctionName = "${aws_lambda_function.cough_follow_ups_import.function_name}"
    Resource = "${aws_lambda_function.cough_follow_ups_import.function_name}"
  }
}

resource "aws_s3_bucket_notification" "cough_follow_ups_reports_notification" {
  bucket = "${var.cough_follow_ups_bucket_id}"

  lambda_function {
    lambda_function_arn = "${aws_lambda_function.cough_follow_ups_import.arn}"
    events = ["s3:ObjectCreated:*"]
  }
}

module "chills_firebase_import" {
  source = "../lambda-cron"

  frequency = "rate(1 hour)"
  name = "${local.base_name}-chills-firebase-import"
  notification_topic = "${var.infra_alerts_sns_topic_arn}"
  role_arn = "${aws_iam_role.flu_lambda.arn}"
  security_group_ids = ["${var.internal_elb_access_sg}"]
  subnet_id = "${var.lambda_subnet_id}"
  timeout = 300
  url = "http://${var.fluapi_fqdn}:444/api/import/chillsDocuments"
}
