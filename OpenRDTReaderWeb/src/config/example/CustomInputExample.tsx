// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.

import { QuestionnaireInputProps } from "../../components/ui/Questionnaire/QuestionnaireTypes";
import React from "react";

/**
 * Renders a simple text input in a questionaire.
 * You should not need to use this outside of the Questionnaire component.
 */
const QuestionnaireInputText = (props: QuestionnaireInputProps) => {
  const { question, onChange } = props;
  const error = question.error;

  return (
    <div>
      <div>
        {question.label} {question.mandatory && "*"}
      </div>
      <input
        autoComplete={question.autofill ? "on" : "no-fill"}
        name={question.name}
        onChange={onChange}
        placeholder={question.placeholder}
        type={question.type}
        value={question.value || ""}
      />
      {error && <div style={{ color: "red", fontWeight: "bold" }}>{error}</div>}
    </div>
  );
};

export default QuestionnaireInputText;
