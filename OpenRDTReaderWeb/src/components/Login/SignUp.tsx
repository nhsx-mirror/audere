// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import React, { useState } from "react";
import {
  getCopyCatMatchValidator,
  getMasterMatchValidator,
  validateEmail,
  validatePasswordLength,
} from "../ui/Questionnaire/QuestionnaireValidators";

import AuthenticationCard from "./AuthenticationCard";
import { Link } from "react-router-dom";
import PageContent from "../ui/PageContent";
import { Question } from "../ui/Questionnaire/QuestionnaireTypes";
import QuestionnaireForm from "../ui/Questionnaire/Questionnaire";
import QuestionnaireInput from "components/ui/Questionnaire/QuestionnaireInput";
import { ROUTE_DEFINITIONS } from "../../routes/routes";
import { getFirebaseApp } from "../Firebase/Firebase";

export default () => {
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (
    event: React.FormEvent,
    questions: { [key: string]: Question }
  ) => {
    event.preventDefault();
    const email = questions.email.value;
    const password = questions.password.value;
    const firebase = getFirebaseApp();
    try {
      const authUser = await firebase.ceateUserWithEmailAndPassword(
        email!,
        password!
      );
      if (!authUser || !authUser.user) {
        throw new Error("Sorry we were not able to create your user.");
      }
      await firebase.firestore
        .collection("users")
        .doc(authUser.user.uid)
        .set({
          email,
          uid: authUser.user.uid,
        });

      await authUser.user.sendEmailVerification();
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <PageContent>
      <AuthenticationCard title="Sign Up">
        <QuestionnaireForm
          onSubmit={onSubmit}
          submitLabel="Create Account"
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
            validators={[
              validatePasswordLength,
              getCopyCatMatchValidator("password2"),
            ]}
          />
          <QuestionnaireInput
            error={null}
            formatter={(text: string) => text}
            icon="lock"
            label="Re-Enter Password"
            mandatory={true}
            name="password2"
            placeholder=""
            type="password"
            value={undefined}
            validators={[getMasterMatchValidator("password")]}
          />
        </QuestionnaireForm>
        <div>
          <Link to={ROUTE_DEFINITIONS.LOGIN.path}>
            Login with an existing account
          </Link>
        </div>
      </AuthenticationCard>
    </PageContent>
  );
};
