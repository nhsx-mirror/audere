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
 * Renders a simple text input in a questionaire.
 * You should not need to use this outside of the Questionnaire component.
 */
const QuestionnaireInputText = (props: QuestionnaireInputProps) => {
  const { question, onChange } = props;
  const error = question.error;
  if (question.type !== "text" && question.type !== "password") {
    throw Error(
      `Invalid question type ${question.type} for QuestionnaireInputText.`
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
          "has-icons-right": !!error,
        })}
      >
        <input
          autoComplete={question.autofill ? "on" : "no-fill"}
          className={cx({ input: true, "is-danger": !!error })}
          name={question.name}
          onChange={onChange}
          placeholder={question.placeholder}
          type={question.type}
          value={question.value || ""}
          list={`datalist-${question.name}`}
        />
        {question.icon && (
          <span className="icon is-small is-left">
            <FontAwesomeIcon icon={question.icon as IconName} />
          </span>
        )}
        {error && (
          <span className="icon is-small is-right">
            <FontAwesomeIcon icon="exclamation-triangle" />
          </span>
        )}
        {question.typeahead && question.typeahead.values.length > 0 && (
          <datalist
            style={{ display: "none" }}
            id={`datalist-${question.name}`}
          >
            {question.typeahead.values.map((content: string, index) => (
              <option value={content} key={index} />
            ))}
          </datalist>
        )}
      </div>
    </QuestionnaireStandardFormControl>
  );
};

export default QuestionnaireInputText;
