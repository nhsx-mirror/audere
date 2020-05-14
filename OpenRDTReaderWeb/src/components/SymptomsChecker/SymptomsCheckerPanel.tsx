// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import {
  FORMID,
  getNextDefaultStep,
  getNextStepOfType,
} from "../TestRun/TestRunConstants";
import React, { memo } from "react";
import { Theme, createStyles, makeStyles } from "@material-ui/core";
import { useHistory, useParams } from "react-router-dom";

import Grid from "@material-ui/core/Grid";
import QuestionnaireForm from "../ui/Questionnaire/Questionnaire";
import QuestionnaireInput from "components/ui/Questionnaire/QuestionnaireInput";
import { SYMPTOMS } from "./SymptomsConstants";
import { StepDetailComponentProp } from "../TestRun/TestRunConstants";
import { confirmAlert } from "../../utils/confirmAlert";
import { cx } from "style/utils";
import firebase from "firebase/app";
import { getFirebaseApp } from "../Firebase/Firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDocumentData } from "react-firebase-hooks/firestore";

const useStyle = makeStyles((theme: Theme) =>
  createStyles({
    question: {
      fontWeight: "bold",
      marginBottom: "0 !important",
    },
    questionSubtext: {
      marginBottom: "1em",
    },
    questionColumm: {
      paddingTop: "0",
      paddingBottom: "0",
    },
  })
);

export default (props: StepDetailComponentProp) => {
  const styles = useStyle();
  const history = useHistory();
  const [auth] = useAuthState(firebase.auth());
  const firebaseApp = getFirebaseApp();
  const { step } = useParams();
  const QuestionnaireFormMemoized = memo(QuestionnaireForm);
  const { setStepReady, testRunUID } = props;

  const [testRunDetail] = useDocumentData<any>(
    firebaseApp.getUserTestRunByID({
      userUID: auth!.uid,
      testRunUID: testRunUID,
    })
  );

  const reportedSymptoms = testRunDetail?.reportedSymptoms || {};

  return (
    <QuestionnaireFormMemoized
      error={null}
      formId={FORMID}
      onFormReady={setStepReady}
      onSubmit={async (event, questions) => {
        try {
          event.preventDefault();
          const firebaseApp = getFirebaseApp();
          const updatedSymptoms: any = {};
          Object.getOwnPropertyNames(questions).forEach(fieldname => {
            if (questions[fieldname].value === "true") {
              updatedSymptoms[fieldname] = reportedSymptoms[fieldname] || {};
            }
          });
          await firebaseApp.updateTestRunSymptomsList({
            userUID: auth!.uid,
            reportedSymptoms: updatedSymptoms,
            testRunUID: props.testRunUID,
          });
          // Resets the state.
          setStepReady && setStepReady(false);

          // If no symptoms are checked, go directly to the next step.
          const nextStep =
            Object.getOwnPropertyNames(updatedSymptoms).length > 0
              ? getNextDefaultStep({ currentStepName: step! })
              : getNextStepOfType({
                  currentStepName: step!,
                  nextStepType: "noSymptoms",
                });

          history.push(`/testrunsteps/${props.testRunUID}/${nextStep}`);
        } catch (e) {
          confirmAlert("oops", e.message);
        }
      }}
    >
      <div>
        <div className={cx({ [styles.question]: true })}>
          Which of the following were present during your illness?
        </div>
        <div className={styles.questionSubtext}>
          <i>Select all that apply</i>
        </div>
        <Grid container spacing={2}>
          {SYMPTOMS.map(symptom => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              className={styles.questionColumm}
              key={symptom.name + "_check"}
            >
              <QuestionnaireInput
                autofill={false}
                error={null}
                formatter={(email: string) => email}
                label={symptom.label}
                mandatory={false}
                name={symptom.name}
                placeholder=""
                type="checkbox"
                value={!!reportedSymptoms[symptom.name] + ""}
                validators={[]}
              />
            </Grid>
          ))}
        </Grid>
      </div>
    </QuestionnaireFormMemoized>
  );
};
