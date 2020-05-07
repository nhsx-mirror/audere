// Copyright (c) 2018 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.

import { default as form, FormState, FormAction } from "./form";
import { default as admin, AdminState, AdminAction } from "./admin";

export interface StoreState {
  form: FormState;
  admin: AdminState;
}
