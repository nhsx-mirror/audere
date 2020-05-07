// Copyright (c) 2018 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.

output "ssh_key_map" {
  value = "${local.ssh_key_map}"
}

output "ssh_key_json" {
  value = "${local.ssh_key_json}"
}