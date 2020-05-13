// Copyright (c) 2019 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.

output "infra_alerts_sns_topic_arn" {
  value = module.flu_notifier.infra_alerts_sns_topic_arn
}

