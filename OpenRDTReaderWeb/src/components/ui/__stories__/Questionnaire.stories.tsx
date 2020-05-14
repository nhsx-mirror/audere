// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import React, { useCallback } from "react";
import {
  validateEmail,
  validatePasswordLength,
} from "../Questionnaire/QuestionnaireValidators";

import { Question } from "../Questionnaire/QuestionnaireTypes";
import Questionnaire from "../Questionnaire/Questionnaire";
import QuestionnaireInput from "../Questionnaire/QuestionnaireInput";
import StoryWrapper from "utils/StoryWrapper";

export default {
  title: "Questionnaire",
  component: Questionnaire,
};

export const SimpleQuestionnaire = () => {
  const onSubmit = useCallback(
    (event: React.FormEvent, questions: { [name: string]: Question }) => {
      event.preventDefault();
    },
    []
  );

  return (
    <StoryWrapper>
      Simple Questionnaire Example:
      <Questionnaire onSubmit={onSubmit} submitLabel="Submit">
        <QuestionnaireInput
          error={null}
          formatter={(email: string) => email}
          icon="envelope"
          label="Email"
          mandatory={true}
          name="email"
          placeholder="Enter your email"
          type="text"
          value={undefined}
          validators={[validateEmail]}
        />
        <QuestionnaireInput
          error={null}
          formatter={(text: string) => text}
          icon="lock"
          label="Password"
          mandatory={true}
          name="password"
          placeholder=""
          type="password"
          value={undefined}
          validators={[validatePasswordLength]}
        />
      </Questionnaire>
    </StoryWrapper>
  );
};
