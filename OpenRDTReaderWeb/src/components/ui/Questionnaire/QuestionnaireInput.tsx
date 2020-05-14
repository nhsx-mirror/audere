// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.

import { DummyEvent, Question, QuestionValidator } from "./QuestionnaireTypes";
import { useCallback, useContext, useLayoutEffect, useState } from "react";

import { QuestionContext } from "./Questionnaire";
import { RENDER_COMPONENTS } from "./QuestionnaireRenderComponents";
import React from "react";

export default (props: Question) => {
  // API from Questionnaire
  const { registerQuestion, getQuestions, getQuestionUpdaters } = useContext(
    QuestionContext
  );
  // The component to render the field.
  const InputComponent = RENDER_COMPONENTS[props.type];

  // We keep question value in a state, so that subsequent renders don't
  // overwrite the updated values.
  const [questionInternal, setQuestionInternal] = useState(props);

  // This callback will be sent to the Questionnaire, and used when another
  // QuestionnaireInput wants to update this one.
  // Examples: address typeahead or password/password repeat.
  const updateQuestion = useCallback(
    (newQuestion: Question) => {
      if (
        // We only need to update if one of those two changed.
        newQuestion.value === questionInternal.value &&
        newQuestion.error === questionInternal.error
      ) {
        return;
      }

      // Update internal state
      setQuestionInternal(newQuestion);
      // register new values with the Questionnaire.
      registerQuestion(newQuestion, updateQuestion);
    },
    [questionInternal, registerQuestion]
  );

  // Called back when the InputComponent updates
  const onElementChange = useCallback(
    (event: React.ChangeEvent | React.MouseEvent | DummyEvent) => {
      const target = event.currentTarget as HTMLInputElement;
      const allQuestions = { ...getQuestions() };
      const allQuestionUpdaters = getQuestionUpdaters();
      let relevantQuestion = { ...allQuestions[questionInternal.name] };

      allQuestions[questionInternal.name] = relevantQuestion;

      // Format the value
      const formattedValue = relevantQuestion.formatter(
        target.value!,
        allQuestions
      );
      relevantQuestion.value = formattedValue;

      if (relevantQuestion.typeahead) {
        if (relevantQuestion.value) {
          relevantQuestion.typeahead.callFunction(
            relevantQuestion,
            question => {
              // This will return asynchronously.
              relevantQuestion = { ...getQuestions()[relevantQuestion.name] };
              relevantQuestion.typeahead!.blob = question.typeahead!.blob;
              setQuestionInternal(relevantQuestion);
              registerQuestion(relevantQuestion, updateQuestion);
            },
            (err: Error) => {
              console.log(
                `Typeahead error for ${relevantQuestion.name}: ` + err.message
              );
            }
          );
        } else {
          relevantQuestion.typeahead = { ...relevantQuestion.typeahead };
          relevantQuestion.typeahead.blob = undefined;
          relevantQuestion.typeahead.values = [];
        }
      }

      // Validate the value
      relevantQuestion.validators.find(
        (validator: QuestionValidator): boolean => {
          relevantQuestion.error = validator(
            relevantQuestion.value || "",
            allQuestions
          );
          if (relevantQuestion.error) {
            return true;
          }
          return false;
        }
      );

      setQuestionInternal(relevantQuestion);
      registerQuestion(relevantQuestion, updateQuestion);

      const questionNames = Object.getOwnPropertyNames(allQuestions);

      // Update the values of the other fields. Other fields could have
      // been updated during the formatting or validating steps.
      questionNames.forEach(questionName => {
        if (questionName !== relevantQuestion.name)
          allQuestionUpdaters[questionName](allQuestions[questionName]);
      });
    },
    [
      getQuestionUpdaters,
      getQuestions,
      questionInternal.name,
      registerQuestion,
      updateQuestion,
    ]
  );

  useLayoutEffect(() => {
    registerQuestion(questionInternal, updateQuestion);
  }, [questionInternal, registerQuestion, updateQuestion]);

  return (
    <InputComponent question={questionInternal} onChange={onElementChange} />
  );
};
