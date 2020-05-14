// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import React from "react";

import { StepDetailComponentProp } from "../TestRun/TestRunConstants";
import firebase from "firebase/app";
import { useAuthState } from "react-firebase-hooks/auth";
import { useParams } from "react-router-dom";
import TestResultPhotoUploader from "./TestResultPhotoUploader";

export default (props: StepDetailComponentProp) => {
  const { testRunUID } = useParams() as { testRunUID: string };
  const [auth] = useAuthState(firebase.auth());

  if (!auth || !props.setStepReady) {
    return <div />;
  }

  return (
    <TestResultPhotoUploader
      testRunUID={testRunUID}
      userUID={auth.uid}
      onFileUploadComplete={props.setStepReady}
    />
  );
};
