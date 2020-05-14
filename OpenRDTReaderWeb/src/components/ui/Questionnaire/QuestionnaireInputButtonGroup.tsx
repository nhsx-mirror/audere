// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import "../../../style/sassStyle";

import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";

import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import { QuestionnaireInputProps } from "./QuestionnaireTypes";
import QuestionnaireStandardFormControl from "./QuestionnaireStandardFormControl";
import React from "react";

const useButtonStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      whiteSpace: "nowrap",
    },
  })
);

/**
 * Renders a ButtonGroup input in a questionaire.
 * You should not need to use this outside of the Questionnaire component.
 */
const QuestionnaireInputButtonGroup = (props: QuestionnaireInputProps) => {
  const { question, onChange } = props;
  const classes = useButtonStyles();

  if (question.type !== "buttongroup") {
    throw Error(
      `Invalid question type ${question.type} for QuestionnaireInputButtonGroup.`
    );
  }

  if (!question.selectOptions) {
    throw Error(
      `Question object passed to QuestionnaireInputButtonGroup needs selectOptions`
    );
  }

  return (
    <QuestionnaireStandardFormControl
      error={question.error}
      label={question.label}
      mandatory={question.mandatory}
    >
      <ButtonGroup aria-label="outlined primary button group" color="primary">
        {question.selectOptions.map(selectOption => (
          <Button
            color={
              question.value + "" === selectOption.value + ""
                ? "primary"
                : "secondary"
            }
            className={classes.root}
            variant="contained"
            name={question.name}
            key={selectOption.value}
            value={selectOption.value}
            onClick={onChange}
          >
            {selectOption.name}
          </Button>
        ))}
      </ButtonGroup>
    </QuestionnaireStandardFormControl>
  );
};

export default QuestionnaireInputButtonGroup;
