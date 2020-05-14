// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import {
  FormHelperText,
  Theme,
  createStyles,
  makeStyles,
} from "@material-ui/core";

import React from "react";

const useStyle = makeStyles((theme: Theme) =>
  createStyles({
    errorLabel: {
      padding: 0,
      margin: 0,
    },
  })
);

interface QuestionnaireInputErrorProps {
  error: string | null;
}

export default (props: QuestionnaireInputErrorProps) => (
  <FormHelperText className={useStyle().errorLabel}>
    {props.error} &nbsp;
  </FormHelperText>
);
