// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import React, { useState } from "react";

import AuthenticationCard from "./AuthenticationCard";
import { Link } from "react-router-dom";
import PageContent from "../ui/PageContent";
import { Question } from "../ui/Questionnaire/QuestionnaireTypes";
import QuestionnaireForm from "../ui/Questionnaire/Questionnaire";
import QuestionnaireInput from "components/ui/Questionnaire/QuestionnaireInput";
import { ROUTE_DEFINITIONS } from "../../routes/routes";
import { getFirebaseApp } from "../Firebase/Firebase";
import { validateEmail } from "../ui/Questionnaire/QuestionnaireValidators";

export default () => {
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const onSubmit = async (
    event: React.FormEvent,
    questions: { [key: string]: Question }
  ) => {
    event.preventDefault();
    const email = questions.email.value;
    const firebase = getFirebaseApp();
    try {
      await firebase.passwordReset(email!);
      setEmailSent(true);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <PageContent>
      <AuthenticationCard title="Recover Password">
        {!emailSent && (
          <React.Fragment>
            <QuestionnaireForm
              onSubmit={onSubmit}
              submitLabel="Submit"
              error={error}
            >
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
            </QuestionnaireForm>
          </React.Fragment>
        )}
        {emailSent && (
          <div>
            An email has been sent to your inbox with instructions to recover
            your password.
          </div>
        )}
        <div>
          <Link to={ROUTE_DEFINITIONS.LOGIN.path}>Go back to login</Link>
        </div>
      </AuthenticationCard>
    </PageContent>
  );
};
