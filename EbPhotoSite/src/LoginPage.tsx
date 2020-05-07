// Copyright (c) 2019 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.

import React from "react";
import { LoginForm } from "./LoginForm";
import "react-table/react-table.css";

export class LoginPage extends React.Component {
  public render(): React.ReactNode {
    return <LoginForm redirectTo="/patients" />;
  }
}
