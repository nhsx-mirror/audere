// Copyright (c) 2019 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.

output "sftp_bucket_arn" {
  value = "${aws_s3_bucket.sftp_destination.arn}"
}

output "sftp_bucket_id" {
  value = "${aws_s3_bucket.sftp_destination.id}"
}
