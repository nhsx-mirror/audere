// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import React, { ReactNode, useCallback, useState } from "react";

import { Button } from "../Buttons";
import { Question } from "./QuestionnaireTypes";

export type QuestionUpdater = (newQuestion: Question) => void;

// API Exposed to the QuestionnaireInputs through the
// QuestionContext.Provider.
export interface QuestionnaireAPI {
  // Lets a QuestionnaireInput register into the Questionnaire.
  // Should be called everytime a QuestionnaireInput is updated.
  registerQuestion: (
    // used to store the input value and decide if the form is complete
    // and ready to be submitted.
    question: Question,
    // used to allow QuestionnaireInputs to update each other's value.
    // For example: two password fields that have to stay in sync.
    updateQuestion: QuestionUpdater
  ) => void;

  // Returns all the QuestionnaireInputs values.
  getQuestions: () => { [name: string]: Question };

  // Returns all the QuestionnaireInputs update functions.
  getQuestionUpdaters: () => {
    [key: string]: QuestionUpdater;
  };
}

// Context used to communicate between the Questionnaire and the
// QuestionnaireInputs.
export const QuestionContext = React.createContext<QuestionnaireAPI>({
  registerQuestion: () => {},
  getQuestions: () => {
    return {};
  },
  getQuestionUpdaters: () => {
    return {};
  },
});

// TODO: Rename to Questionnaire once all forms are upgraded.
interface Questionnaire {
  children: ReactNode; // Layout containing QuestionnaireInputs
  formId?: string; // Id of the form element.

  // Callback to inform all the inputs are properly filled
  onFormReady?: (formReady: boolean) => void;

  // Callback for submit.
  onSubmit: (
    event: React.FormEvent,
    questions: { [key: string]: Question }
  ) => void;

  // Global form error
  error?: string | undefined | null;

  // without label, the submit button won't be rendered.
  // You can still submit the form from a button element like this:
  // <button type="submit" form="form1" value="Submit">Submit</button>
  submitLabel?: string;
}

const Questionnaire = (props: Questionnaire) => {
  const { onSubmit, onFormReady, submitLabel, error, formId, children } = props;
  // Hashmap of Questions
  const [questions, setQuestions] = useState<{ [key: string]: Question }>({});
  // Hashmap of QuestionUpdaters
  const [questionUpdaters, setQuestionUpdaters] = useState<{
    [key: string]: QuestionUpdater;
  }>({});
  const [submitEnabled, setSubmitEnabled] = useState(false);

  // See API Desciption above.
  const registerQuestion = useCallback(
    (question: Question, updateQuestion: QuestionUpdater) => {
      questions[question.name] = { ...question };
      questionUpdaters[question.name] = updateQuestion;

      setQuestions(questions);
      setQuestionUpdaters(questionUpdaters);

      // Check if the form is ready.
      let isEnabled = true;
      const questionNames = Object.getOwnPropertyNames(questions);

      questionNames.find(questionName => {
        const question = questions[questionName];
        if (
          question.value === null ||
          question.value === undefined ||
          (typeof question.value === "string" && question.value.trim() === "")
        ) {
          if (question.mandatory) {
            isEnabled = false;
            return true; // no need to check the other fields.
          }
        } else {
          if (question.error) {
            isEnabled = false;
            return true; // no need to check the other fields.
          }
        }
        return false;
      });

      setSubmitEnabled(isEnabled);
      onFormReady && onFormReady(submitEnabled);
    },
    [questions, questionUpdaters, onFormReady, submitEnabled]
  );

  const getQuestions = useCallback(() => {
    return questions;
  }, [questions]);

  const getQuestionUpdaters = useCallback(() => {
    return questionUpdaters;
  }, [questionUpdaters]);

  const onSubmitCallback = useCallback(
    (event: React.FormEvent) => {
      onSubmit(event, questions);
    },
    [questions, onSubmit]
  );

  const api = { registerQuestion, getQuestions, getQuestionUpdaters };

  return (
    <form className="content" id={formId} onSubmit={onSubmitCallback}>
      <QuestionContext.Provider value={api}>
        {children}
      </QuestionContext.Provider>
      {submitLabel && (
        <div className="field is-grouped">
          <div className="control">
            <Button disabled={!submitEnabled} form={formId} type="submit">
              {submitLabel}
            </Button>
          </div>
        </div>
      )}
      {error && <p className="help is-danger">{error}</p>}
    </form>
  );
};

export default Questionnaire;
