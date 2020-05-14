// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import { Theme, createStyles, makeStyles } from "@material-ui/core";

import Asset from "../Asset";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { QuestionnaireInputProps } from "./QuestionnaireTypes";
import QuestionnaireStandardFormControl from "./QuestionnaireStandardFormControl";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import React from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    radioAsset: {
      display: "block",
      marginLeft: "45px",
    },
    controlWithAsset: {
      display: "block",
    },
  })
);

/**
 * Renders a Radio input in a questionaire.
 * You should not need to use this outside of the Questionnaire component.
 */
const QuestionnaireInputRadio = (props: QuestionnaireInputProps) => {
  const { question, onChange } = props;
  const classes = useStyles();

  if (question.type !== "radio") {
    throw Error(
      `Invalid question type ${question.type} for QuestionnaireInputRadio.`
    );
  }

  if (!question.selectOptions) {
    throw Error(
      `Question object passed to QuestionnaireInputRadio needs selectOptions`
    );
  }

  return (
    <QuestionnaireStandardFormControl
      error={question.error}
      label={question.label}
      mandatory={question.mandatory}
    >
      <RadioGroup
        aria-label="gender"
        name={question.name}
        value={question.value || ""}
        onChange={onChange}
      >
        {question.selectOptions.map(selectOption => (
          <FormControlLabel
            value={selectOption.value + ""}
            control={<Radio color="primary" />}
            key={`radio-${selectOption.value}`}
            className={selectOption.asset && classes.controlWithAsset}
            label={
              <>
                {selectOption.name}
                {selectOption.asset && (
                  <Asset
                    className={classes.radioAsset}
                    {...selectOption.asset}
                  />
                )}
              </>
            }
          />
        ))}
      </RadioGroup>
    </QuestionnaireStandardFormControl>
  );
};

export default QuestionnaireInputRadio;
