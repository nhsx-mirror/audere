// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import {
  FORMID,
  StepDetailComponentProp,
  getNextDefaultStep,
} from "../TestRun/TestRunConstants";
import React, { memo, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";

import QuestionnaireForm from "../ui/Questionnaire/Questionnaire";
import QuestionnaireInput from "components/ui/Questionnaire/QuestionnaireInput";
import { confirmAlert } from "../../utils/confirmAlert";
import { getFirebaseApp } from "components/Firebase/Firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDocumentData } from "react-firebase-hooks/firestore";

const pinkLineOptions = [
  {
    value: "noPink",
    name: "Blue line only",
    asset: {
      height: 180,
      width: 290,
      alt: "Test strip with only a blue line.",
      src: "blueonly.png",
    },
  },
  {
    value: "yesAboveBlue",
    name: "Pink line above the blue line",
    asset: {
      height: 180,
      width: 290,
      alt: "Test strip with a pink line above the blue line.",
      src: "pinklineaboveblueline.png",
    },
  },
  {
    value: "yesBelowBlue",
    name: "Pink line below the blue line",
    asset: {
      height: 180,
      width: 290,
      alt: "Test strip with a pink line below the blue line.",
      src: "pinklinebelowblueline.png",
    },
  },
  {
    value: "yesAboveBelowBlue",
    name: "Pink line above and below the blue line",
    asset: {
      height: 180,
      width: 290,
      alt: "Test strip with a pink line above and below the blue line.",
      src: "pinklineabovebelow.png",
    },
  },
];

const questionValidator = (text: string | null) => {
  if (!text || text === "") {
    return "Must enter a value";
  }

  return pinkLineOptions.some(option => text === option.value)
    ? null
    : "Select an option";
};

const WhatDoYouSeePanel = memo((props: StepDetailComponentProp) => {
  // TODO: get questionaire based on the type of strip selected
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

  const previousResult = testRunDetail?.userInterpretation?.pinkLine || "";

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
    <QuestionnaireFormMemoized
      error={null}
      formId={FORMID}
      onFormReady={setStepReady}
      onSubmit={async (event, questions) => {
        try {
          event.preventDefault();

          await firebaseApp.updateTestRunUserInterpretation({
            userInterpretation: {
              pinkLine: questions["pinkLine"].value,
            },
            testRunUID: props.testRunUID,
            userUID: auth.uid,
          });

          // Resets the state.
          setStepReady && setStepReady(false);
          const next = getNextDefaultStep({
            currentStepName: step!,
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
        label="Which image most closely matches your test strip?"
        mandatory={true}
        name="pinkLine"
        placeholder="Choose an option"
        type="radio"
        validators={[questionValidator]}
        selectOptions={pinkLineOptions}
        value={previousResult}
      />
    </QuestionnaireFormMemoized>
  );
});

export default WhatDoYouSeePanel;
