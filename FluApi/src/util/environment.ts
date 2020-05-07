// Copyright (c) 2018 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.

export function isAWS() {
  return ["production", "staging"].includes(process.env.NODE_ENV);
}

export function isProduction() {
  return process.env.NODE_ENV === "production";
}
