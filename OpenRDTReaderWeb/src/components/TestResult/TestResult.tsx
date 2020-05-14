// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import "../../style/sassStyle";

import { Link, useParams } from "react-router-dom";
import { Theme, createStyles, makeStyles } from "@material-ui/core";

import { ContinueButton } from "../ui/Buttons";
import Divider from "components/ui/Divider";
import ExternalLink from "components/ui/ExternalLink";
import PageContent from "../ui/PageContent";
import PageHeader from "../ui/PageHeader";
import { ROUTE_DEFINITIONS } from "routes/routes";
import React from "react";
import { cx } from "style/utils";
import { getFirebaseApp } from "components/Firebase/Firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDocument } from "react-firebase-hooks/firestore";

const NO_RESULT_YET = 1;
const POSITIVE = 2;
const NEGATIVE = 3;

const useStyle = makeStyles((theme: Theme) =>
  createStyles({
    testResultPill: {
      cursor: "default",
      margin: ".75em 0",
    },
    testResultContainer: {
      textAlign: "center",
    },
    nextButton: {
      minWidth: "185px",
      marginTop: "30px",
    },
  })
);

export default () => {
  const { testRunUID } = useParams() as {
    testRunUID: string;
  };

  const firebaseApp = getFirebaseApp();
  const [auth] = useAuthState(firebaseApp.auth);

  const [testRunDetail] = useDocument(
    firebaseApp.getUserTestRunByID({
      userUID: auth!.uid,
      testRunUID: testRunUID,
    })
  );

  const styles = useStyle();

  if (testRunDetail === undefined) {
    return <div />; // TODO: add some delayed "loading" ui.
  }
  const testRunData = testRunDetail.data();
  let resultType = NO_RESULT_YET;
  if (testRunData!.testresult !== undefined) {
    resultType = testRunData!.testresult ? POSITIVE : NEGATIVE;
  }
  let content;
  if (resultType === NO_RESULT_YET) {
    content = (
      <div className={styles.testResultPill}>
        <strong>No result yet.</strong>
      </div>
    );
  } else {
    content = (
      <>
        <div className={styles.testResultContainer}>
          <div>Your test strip indicates you may be:</div>
          <div
            className={cx({
              [styles.testResultPill]: true,
              button: true,
              "is-hovered": true,
            })}
          >
            <strong>{resultType === POSITIVE ? "POSITIVE" : "NEGATIVE"}</strong>{" "}
            &nbsp;for&nbsp;<strong>SARS-COV-2</strong>
          </div>
        </div>
        <Divider />
        <div>
          <strong>
            What should I do if my test is{" "}
            {resultType === POSITIVE ? "positive" : "negative"}?
          </strong>
        </div>
        {resultType === POSITIVE ? (
          <>
            If your test is positive, this means that you are highly likely to
            be infected by the SARS-COV-2 virus responsible for COVID-19. If
            your doctor has prescribed medication, you should take them as
            directed. Most people with COVID-19 will get better over a few
            weeks, but sometimes COVID-19 can cause more serious illness,
            particularly if you have some other health problems or are above the
            age of 60. Contact your doctor if you are worried about your
            symptoms. For more information, visit the{" "}
            <ExternalLink href="https://www.cdc.gov/coronavirus/2019-ncov/if-you-are-sick/steps-when-sick.html">
              NHS website describing what to do if you are sick with COVID-19.
            </ExternalLink>
            .
          </>
        ) : (
          <>
            If your test is negative, this means that you are unlikely to be
            infected by the SARS-COV-2 virus responsible for the COVID-19
            disease. If you feel you are sick, contact your doctor if you are
            worried about your symptoms. For more information, visit the{" "}
            <ExternalLink href="https://www.cdc.gov/coronavirus/2019-ncov/symptoms-testing/symptoms.html">
              NHS's website about the COVID-19 illness symptoms
            </ExternalLink>
            .
          </>
        )}
        <Divider />
        <div>
          <div>
            <strong>Medical Disclaimer</strong>
          </div>
          This communication of the SARS-COV-2 test result does not constitute
          professional medical or healthcare advice, diagnosis or recommendation
          of treatment, and is not intended to, nor should they be used to,
          replace professional medical advice.
          <br />
          The interpretation of your result may differ from a medical test
          conducted in a clinical lab environment. In no circumstances should
          the test results of the test kit be relied upon without independent
          consideration and confirmation by a qualified medical practitioner.
          <br />
          Audere makes no representations or warranties with respect to any
          treatment, action, suitability or application of medication, or
          preparation by any person, whether in connection with this site, the
          test kit, or not. In no circumstances will Audere be liable for any
          direct, indirect, consequential, specials, exemplary or other damages
          arising therefrom.
        </div>
      </>
    );
  }

  return (
    <PageContent>
      <section className="section">
        <PageHeader title="Your Test Result..." />
        <div className="container">
          {content}
          <Link to={ROUTE_DEFINITIONS.CLEANUP.path}>
            <ContinueButton />
          </Link>
        </div>
      </section>
    </PageContent>
  );
};
