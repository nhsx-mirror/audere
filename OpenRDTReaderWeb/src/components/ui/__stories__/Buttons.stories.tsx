// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import { Button } from "../Buttons";
import { GlobalTheme } from "style/AppThemes";
import React from "react";
import { muiTheme } from "storybook-addon-material-ui";
import { storiesOf } from "@storybook/react";

storiesOf("Buttons", module)
  // Add the `muiTheme` decorator to provide material-ui support to your stories.
  // If you do not specify any arguments it starts with two default themes
  // You can also configure `muiTheme` as a global decorator.
  .addDecorator(muiTheme([GlobalTheme]))
  .add("Button", () => <Button>Button</Button>)
  .add("Disabled Button", () => <Button disabled={true}>Disabled</Button>);
