// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import {
  FORMID,
  StepDetailComponentProp,
  getNextDefaultStep,
  getNextStepOfType,
} from "../TestRun/TestRunConstants";
import React, { memo, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";

import Asset from "components/ui/Asset";
import QuestionnaireForm from "../ui/Questionnaire/Questionnaire";
import QuestionnaireInput from "components/ui/Questionnaire/QuestionnaireInput";
import { confirmAlert } from "../../utils/confirmAlert";
import { getFirebaseApp } from "components/Firebase/Firebase";
import { getStepStyle } from "../TestRun/TestRunConstants";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDocumentData } from "react-firebase-hooks/firestore";

const blueLineOptions = [
  { value: "Yes", name: "Yes" },
  { value: "No", name: "No" },
];

const questionValidator = (text: string | null) => {
  if (!text || text === "") {
    return "Must enter a value";
  }
  return blueLineOptions.some(option => text === option.value)
    ? null
    : "Select an option";
};

const WhatDoYouSeePanel = memo((props: StepDetailComponentProp) => {
  // TODO: get questionaire based on the type of strip selected
  const classes = getStepStyle();
  const { step } = useParams();
  const QuestionnaireFormMemoized = memo(QuestionnaireForm);
  const history = useHistory();
  const { setStepReady, testRunUID } = props;
  const firebaseApp = getFirebaseApp();
  const [auth] = useAuthState(firebaseApp.auth);

  const [testRunDetail] = useDocumentData<any>(
    firebaseApp.getUserTestRunByID({
      userUID: auth!.uid,
      testRunUID: testRunUID,
    })
  );

  const previousResult = testRunDetail?.userInterpretation?.blueLine || "";

  // If already recorded, enable "next" button
  useEffect(() => {
    if (previousResult) {
      setStepReady && setStepReady(true);
    }
  }, [previousResult, setStepReady]);

  // TODO: Generic Error handler.
  if (!auth) {
    return <div>Oops, something went wrong</div>;
  }

  if (!testRunDetail) {
    return <div />; // Add Loader
  }

  return (
    <>
      <p>
        Look at the test strip with the arrows pointing down towards you to
        answer the following questions.
      </p>
      <Asset
        height={180}
        width={290}
        className={classes.centeredAsset}
        alt="Image of the test strip after removal from the tube."
        src="lookAtTestStrip.png"
      />
      <QuestionnaireFormMemoized
        error={null}
        formId={FORMID}
        onFormReady={setStepReady}
        onSubmit={async (event, questions) => {
          try {
            event.preventDefault();

            const blueLineVal = questions["blueLine"].value;
            await firebaseApp.updateTestRunUserInterpretation({
              userInterpretation: {
                blueLine: blueLineVal,
              },
              testRunUID: props.testRunUID,
              userUID: auth.uid,
            });

            // Resets the state.
            setStepReady && setStepReady(false);
            const next =
              blueLineVal === "Yes"
                ? getNextDefaultStep({
                    currentStepName: step!,
                  })
                : getNextStepOfType({
                    currentStepName: step!,
                    nextStepType: "noLine",
                  });
            history.push(`/testrunsteps/${props.testRunUID}/${next}`);
          } catch (e) {
            confirmAlert("oops", e.message);
          }
        }}
      >
        <QuestionnaireInput
          error={null}
          formatter={(text: string) => text}
          label="Do you see a blue line in the middle of the test strip?"
          mandatory={true}
          name="blueLine"
          placeholder="Choose an option"
          type="buttongroup"
          validators={[questionValidator]}
          selectOptions={blueLineOptions}
          value={previousResult}
        />
      </QuestionnaireFormMemoized>
    </>
  );
});

export default WhatDoYouSeePanel;
