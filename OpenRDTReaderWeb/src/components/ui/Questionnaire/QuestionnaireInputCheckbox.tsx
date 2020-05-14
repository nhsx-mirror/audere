// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import "../../../style/sassStyle";

import { Theme, createStyles, makeStyles } from "@material-ui/core";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { QuestionnaireInputProps } from "./QuestionnaireTypes";
import QuestionnaireStandardFormControl from "./QuestionnaireStandardFormControl";
import React from "react";

const useStyle = makeStyles((theme: Theme) =>
  createStyles({
    checkboxInput: {
      opacity: 0,
      position: "absolute",
    },
  })
);

/**
 * Renders a Checkbox in a questionaire.
 * You should not need to use this outside of the Questionnaire component.
 */
const QuestionnaireInputCheckbox = (props: QuestionnaireInputProps) => {
  const { question, onChange } = props;
  const classes = useStyle();

  if (question.type !== "checkbox") {
    throw Error(
      `Invalid question type ${question.type} for QuestionnaireInputCheckbox.`
    );
  }

  return (
    <QuestionnaireStandardFormControl
      error={question.error}
      mandatory={question.mandatory}
    >
      <label className="checkbox">
        <input
          type="checkbox"
          className={classes.checkboxInput}
          name={question.name}
          value={question.value}
          checked={question.value === "true"}
          onChange={function(ev) {
            ev.target.value = ev.target.checked ? "true" : "false";
            onChange(ev);
          }}
        />
        <FontAwesomeIcon
          size="lg"
          icon={["far", question.value === "true" ? "check-square" : "square"]}
        />
        &nbsp;
        {question.label}
      </label>
    </QuestionnaireStandardFormControl>
  );
};

export default QuestionnaireInputCheckbox;
