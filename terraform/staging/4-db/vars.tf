// Copyright (c) 2018 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.

// See epoch/provision documentation in modules/flu-db/main.tf

variable "admins" {
  description = "List of admin userids."
  type        = list(string)
}

variable "mode" {
  description = "See 'mode' in modules/flu-db/vars.tf"
  default     = "run"
}

