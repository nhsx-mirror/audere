// Copyright (c) 2018 by Audere
//
// Use of this source code is governed by an MIT-style license that
// can be found in the LICENSE file distributed with this file.

terraform {
  backend "s3" {
    bucket = "flu-prod-terraform.auderenow.io"
    key = "api/terraform.state"
    region = "us-west-2"
  }
}

provider "aws" {
  version = "~> 1.50"
  region = "us-west-2"
}

provider "template" {
  version = "~> 1.0"
}

module "flu_api" {
  source = "../../modules/flu-api"

  environment = "staging"
  service = "${var.service}"
  migrate = "${var.migrate}"
  commit = "${var.commit}"
  creds_snapshot_id = "${data.terraform_remote_state.flu_db.api_creds_snapshot_id}"
  ami_id = "${module.ami.ubuntu}"
}

data "terraform_remote_state" "flu_db" {
  backend = "s3"
  config {
    bucket = "flu-staging-terraform.auderenow.io"
    key = "db/terraform.state"
    region = "us-west-2"
  }
}

module "ami" {
  source = "../../modules/ami"
}
