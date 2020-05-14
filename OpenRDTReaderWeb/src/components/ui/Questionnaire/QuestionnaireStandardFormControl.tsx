// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import { Theme, createStyles, makeStyles } from "@material-ui/core";

import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import QuestionnaireInputError from "./QuestionnaireInputError";
import React from "react";

const useLabelStyles = makeStyles((theme: Theme) =>
  createStyles({
    label: {
      margin: "1em 0",
    },
  })
);

interface StandarControlProps {
  error: string | null;
  label?: React.ReactNode;
  children: JSX.Element;
  mandatory: boolean;
}

export default (props: StandarControlProps) => (
  <FormControl
    component="fieldset"
    error={!!props.error}
    fullWidth={true}
    required={props.mandatory}
  >
    {props.label && (
      <FormLabel
        component="legend"
        className={useLabelStyles().label}
        error={false}
      >
        {props.label}
      </FormLabel>
    )}
    {props.children}
    <QuestionnaireInputError error={props.error} />
  </FormControl>
);
