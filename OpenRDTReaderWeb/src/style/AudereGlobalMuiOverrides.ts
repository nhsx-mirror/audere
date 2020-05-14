// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.

import { Overrides } from "@material-ui/core/styles/overrides";
import getSassStyle from "./sassStyle";

export default {
  MuiFormHelperText: {
    root: {
      "&.Mui-error": {
        color: getSassStyle().errorcolor,
      },
    },
  },
  MuiFormLabel: {
    root: {
      color: getSassStyle().bodycolor,
      fontWeight: getSassStyle().strongweight,
    },
  },
  MuiPaper: {
    root: {
      color: getSassStyle().bodycolor,
    },
  },
} as Overrides;
