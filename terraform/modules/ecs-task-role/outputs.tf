// Copyright (c) 2018 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.

output "arn" {
  value = "${aws_iam_role.ecs_task_execution_role.arn}"
}
