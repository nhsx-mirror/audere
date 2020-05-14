// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import "../../../style/sassStyle";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import { QuestionnaireInputProps } from "./QuestionnaireTypes";
import QuestionnaireStandardFormControl from "./QuestionnaireStandardFormControl";
import React from "react";
import { cx } from "../../../style/utils";

/**
 * Renders a select input in a questionaire.
 * You should not need to use this outside of the Questionnaire component.
 */
const QuestionnaireInputSelect = (props: QuestionnaireInputProps) => {
  const { question, onChange } = props;
  const error = question.error;

  if (question.type !== "select") {
    throw Error(
      `Invalid question type ${question.type} for QuestionnaireInputSelect.`
    );
  }

  if (!question.selectOptions) {
    throw Error(
      `Question object passed to QuestionnaireInputSelect needs selectOptions`
    );
  }

  return (
    <QuestionnaireStandardFormControl
      error={question.error}
      label={question.label}
      mandatory={question.mandatory}
    >
      <div
        className={cx({
          control: true,
          "has-icons-left": !!question.icon,
        })}
      >
        <div className="select">
          <select
            className={cx({ input: true, "is-danger": !!error })}
            name={question.name}
            onChange={onChange}
            value={question.value || ""}
          >
            {question.placeholder && (
              <option value="" disabled>
                {question.placeholder}
              </option>
            )}
            {question.selectOptions.map(selectOption => (
              <option key={selectOption.value} value={selectOption.value}>
                {selectOption.name}
              </option>
            ))}
          </select>
        </div>
        {question.icon && (
          <span className="icon is-small is-left">
            <FontAwesomeIcon icon={question.icon as IconName} />
          </span>
        )}
      </div>
    </QuestionnaireStandardFormControl>
  );
};

export default QuestionnaireInputSelect;
