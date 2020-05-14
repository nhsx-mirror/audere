// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import { FIELDS_SUFFIX, SYMPTOMS } from "./SymptomsConstants";
import { FORMID, getNextDefaultStep } from "../TestRun/TestRunConstants";
import React, { ReactElement, memo, useEffect } from "react";
import { Theme, createStyles, makeStyles } from "@material-ui/core";
import { useHistory, useParams } from "react-router-dom";

import Grid from "@material-ui/core/Grid";
import QuestionnaireForm from "../ui/Questionnaire/Questionnaire";
import QuestionnaireInput from "components/ui/Questionnaire/QuestionnaireInput";
import { StepDetailComponentProp } from "../TestRun/TestRunConstants";
import { confirmAlert } from "../../utils/confirmAlert";
import { cx } from "style/utils";
import { getFirebaseApp } from "../Firebase/Firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDocumentData } from "react-firebase-hooks/firestore";

function getFields(reportedSymptoms: {
  [key: string]: any;
}): {
  startQuestions: ReactElement;
  _48hQuestions: ReactElement;
  severityQuestions: ReactElement;
} {
  const fields: {
    startQuestions: Array<ReactElement>;
    _48hQuestions: Array<ReactElement>;
    severityQuestions: Array<ReactElement>;
  } = {
    startQuestions: [],
    _48hQuestions: [],
    severityQuestions: [],
  };

  SYMPTOMS.forEach(symptom => {
    if (reportedSymptoms[symptom.name]) {
      let fieldName = symptom.name + FIELDS_SUFFIX.START;
      fields.startQuestions.push(
        <Grid item xs={12} sm={6} md={4} key={fieldName}>
          <QuestionnaireInput
            autofill={false}
            error={null}
            formatter={(text: string) => text}
            label={symptom.label}
            mandatory={true}
            name={fieldName}
            value={reportedSymptoms[symptom.name].start}
            placeholder={""}
            type="date"
            validators={[]}
          />
        </Grid>
      );

      fieldName = symptom.name + FIELDS_SUFFIX._48H;
      fields._48hQuestions.push(
        <Grid item xs={12} sm={6} md={4} key={fieldName}>
          <QuestionnaireInput
            autofill={false}
            error={null}
            formatter={(text: string) => text}
            label={symptom.label}
            mandatory={true}
            name={fieldName}
            placeholder={"Select one"}
            selectOptions={[
              { value: "true", name: "Yes" },
              { value: "false", name: "No" },
            ]}
            value={
              reportedSymptoms[symptom.name]._48h !== undefined
                ? reportedSymptoms[symptom.name]._48h + ""
                : undefined
            }
            type={"buttongroup"}
            validators={[]}
          />
        </Grid>
      );

      fieldName = symptom.name + FIELDS_SUFFIX._SEVERITY;
      fields.severityQuestions.push(
        <Grid item xs={12} sm={6} md={4} key={fieldName}>
          <QuestionnaireInput
            autofill={false}
            error={null}
            formatter={(text: string) => text}
            label={symptom.label}
            mandatory={true}
            name={fieldName}
            placeholder={"Select one"}
            selectOptions={[
              { value: "mild", name: "Mild" },
              { value: "moderate", name: "Moderate" },
              { value: "severe", name: "Severe" },
            ]}
            value={reportedSymptoms[symptom.name].severity}
            type={"buttongroup"}
            validators={[]}
          />
        </Grid>
      );
    }
  });

  return {
    startQuestions: (
      <Grid container spacing={2}>
        {fields.startQuestions}
      </Grid>
    ),
    _48hQuestions: (
      <Grid container spacing={2}>
        {fields._48hQuestions}
      </Grid>
    ),
    severityQuestions: (
      <Grid container spacing={2}>
        {fields.severityQuestions}
      </Grid>
    ),
  };
}

const useStyle = makeStyles((theme: Theme) =>
  createStyles({
    question: {
      fontWeight: "bold",
      marginBottom: "0 !important",
    },
    questionSubtext: {
      marginBottom: "1em",
    },
  })
);

export default (props: StepDetailComponentProp) => {
  const history = useHistory();
  const firebaseApp = getFirebaseApp();
  const [auth] = useAuthState(firebaseApp.auth);
  const { step } = useParams();
  const QuestionnaireFormMemoized = memo(QuestionnaireForm);
  const { setStepReady, testRunUID } = props;
  const classes = useStyle();

  const [testRunDetail] = useDocumentData<any>(
    firebaseApp.getUserTestRunByID({
      userUID: auth!.uid,
      testRunUID: testRunUID,
    })
  );

  const reportedSymptoms = testRunDetail?.reportedSymptoms || {};

  // If there's no symptoms recorded, we can enable the "next" button.
  useEffect(() => {
    if (
      testRunDetail?.reportedSymptoms &&
      Object.getOwnPropertyNames(reportedSymptoms).length === 0
    ) {
      setStepReady && setStepReady(true);
    }
  }, [testRunDetail, setStepReady, reportedSymptoms]);

  if (!auth || !testRunDetail) {
    return <div />; // Add Loader
  }

  if (
    testRunDetail?.reportedSymptoms &&
    Object.getOwnPropertyNames(reportedSymptoms).length === 0
  ) {
    // No symptoms recorded.
    return (
      <div>
        No reported symptoms, you can go to the next step.
        <form
          id={FORMID}
          onSubmit={() => {
            const next = getNextDefaultStep({ currentStepName: step! });
            // This is a dummy form, only here to go to the next page.
            history.push(`/testrunsteps/${props.testRunUID}/${next}`);
          }}
        />
      </div>
    );
  }

  const { startQuestions, _48hQuestions, severityQuestions } = getFields(
    reportedSymptoms
  );

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

          Object.getOwnPropertyNames(reportedSymptoms).forEach(symptomName => {
            updatedSymptoms[symptomName] = {
              start: questions[symptomName + FIELDS_SUFFIX.START].value,
              _48h:
                questions[symptomName + FIELDS_SUFFIX._48H].value === "true",
              severity: questions[symptomName + FIELDS_SUFFIX._SEVERITY].value,
            };
          });

          await firebaseApp.updateTestRunSymptomsList({
            userUID: auth!.uid,
            reportedSymptoms: updatedSymptoms,
            testRunUID: testRunUID,
          });
          // Resets the state.
          setStepReady && setStepReady(false);
          const next = getNextDefaultStep({ currentStepName: step! });
          history.push(`/testrunsteps/${props.testRunUID}/${next}`);
        } catch (e) {
          confirmAlert("oops", e.message);
        }
      }}
    >
      <div className={cx({ [classes.question]: true })}>
        How long ago did the symptoms start?
      </div>
      <div className={classes.questionSubtext}>
        <i>Select the timeframe that best applies</i>
      </div>
      {startQuestions}
      <div className={cx({ [classes.question]: true })}>
        Were these symptoms present in the last 48 hours?
      </div>
      <div className={classes.questionSubtext}></div>
      {_48hQuestions}
      <div className={cx({ [classes.question]: true })}>
        How severe were your symptoms?
      </div>
      <div className={classes.questionSubtext}>
        <i>Select the level of discomfort you felt at the worst point</i>
      </div>
      {severityQuestions}
    </QuestionnaireFormMemoized>
  );
};
