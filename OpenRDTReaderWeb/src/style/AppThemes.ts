// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.

import AudereGlobalMuiOverrides from "./AudereGlobalMuiOverrides";
import ExternalGlobalMuiOverrides from "../config/ExternalGlobalMuiOverrides";
import { createMuiTheme } from "@material-ui/core";
import getSassStyle from "./sassStyle";

export const GlobalTheme = createMuiTheme({
  palette: {
    primary: {
      main: getSassStyle().primarycolor,
      light: getSassStyle().primarylight,
      dark: getSassStyle().primarydark,
    },
    secondary: { main: "#fafafa", light: "#fff", dark: "#c7c7c7" },
  },

  typography: {
    button: {
      textTransform: "none",
    },
    fontSize: 16,
  },

  overrides: {
    ...AudereGlobalMuiOverrides,
    ...ExternalGlobalMuiOverrides,
  },
});
