// Copyright (c) 2018 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.

output "id" {
  value = aws_ecs_cluster.cluster.id
}

output "name" {
  value = aws_ecs_cluster.cluster.name
}

