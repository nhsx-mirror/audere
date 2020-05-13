// Copyright (c) 2019 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.

provider "aws" {
  region = "us-west-2"
}

module "dev" {
  source = "../../modules/flu-dev"

  bastion_ingress_sg_id        = data.terraform_remote_state.network.outputs.bastion_ingress_sg_id
  bastion_subnet_id            = data.terraform_remote_state.network.outputs.bastion_subnet_id
  db_client_sg_id              = data.terraform_remote_state.network.outputs.db_client_sg_id
  dev_machine_client_sg_id     = data.terraform_remote_state.network.outputs.dev_machine_client_sg_id
  dev_machine_server_sg_id     = data.terraform_remote_state.network.outputs.dev_machine_server_sg_id
  dev_machine_subnet_id        = data.terraform_remote_state.network.outputs.dev_machine_subnet_id
  dev_ssh_client_sg_id         = data.terraform_remote_state.network.outputs.dev_ssh_client_sg_id
  devs                         = var.devs
  fluapi_internal_client_sg_id = data.terraform_remote_state.network.outputs.fluapi_internal_client_sg_id
  environment                  = "staging"
  internet_egress_sg_id        = data.terraform_remote_state.network.outputs.internet_egress_sg_id
  proxies                      = ["rproxy"]
}

data "terraform_remote_state" "network" {
  backend = "s3"
  config = {
    bucket = "flu-staging-terraform.auderenow.io"
    key    = "network/terraform.state"
    region = "us-west-2"
  }
}

terraform {
  backend "s3" {
    bucket = "flu-staging-terraform.auderenow.io"
    key    = "dev/terraform.state"
    region = "us-west-2"
  }
}

