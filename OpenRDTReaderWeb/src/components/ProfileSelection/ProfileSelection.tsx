// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import "../../style/sassStyle";

import React, { useEffect, useState } from "react";
import { Theme, createStyles, makeStyles } from "@material-ui/core";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Grid from "@material-ui/core/Grid";
import PageContent from "../ui/PageContent";
import { ProfileCard } from "./ProfileCard";
import { ROUTE_DEFINITIONS } from "routes/routes";
import { TestRun } from "components/Firebase/FirebaseTypes";
import { confirmAlert } from "../../utils/confirmAlert";
import { cx } from "style/utils";
import firebase from "firebase/app";
import { getFirebaseApp } from "../Firebase/Firebase";
import getSassStyle from "../../style/sassStyle";
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    title: {
      textAlign: "center",
      margin: `0 0 ${getSassStyle().sectionverticalpadding}`,
    },
    header: {
      display: "flex",
      flexDirection: "row",
      fontSize: "15px",
      lineHeight: "15px",
      justifyContent: "space-between",
      borderBottom: `1px solid ${getSassStyle().dividercolor}`,
      paddingBottom: "12px",
      marginBottom: "12px",
      marginTop: "12px",
      paddingTop: "12px",
    },
    icon: {
      color: theme.palette.primary.main,
      cursor: "pointer",
    },
  })
);

interface ProfileTest {
  profile: { [x: string]: any };
  lastTestRun: TestRun | null;
}

export default () => {
  const [auth] = useAuthState(firebase.auth());
  const [profileTestList, setProfileTestList] = useState<ProfileTest[] | null>(
    null
  );
  const history = useHistory();
  const firebaseApp = getFirebaseApp();
  const classes = useStyles();

  // TODO: find a smart way to cancel the async if the user
  // navigates away before the query ends.
  useEffect(() => {
    if (!auth) {
      return;
    }
    return firebaseApp.getUserProfileCollection(auth.uid).onSnapshot(
      async collection => {
        const profiles = await Promise.all(
          collection.docs.map(async object => {
            const data = object.data();
            const profile = { ...data };
            profile.id = object.id;
            const lastTestRun = profile.lastCompletedTest
              ? (
                  await firebaseApp
                    .getUserTestRunByID({
                      userUID: auth.uid,
                      testRunUID: profile.lastCompletedTest,
                    })
                    .get()
                ).data()
              : null;
            return { profile, lastTestRun: lastTestRun as TestRun };
          })
        );
        setProfileTestList(profiles);
      },
      transactionError => confirmAlert("oops", transactionError.message)
    );
  }, [auth, firebaseApp]);

  if (profileTestList === null) {
    return <div />;
  }

  let rows: JSX.Element | null = null;
  if (profileTestList.length > 0) {
    let currentRowItems: Array<JSX.Element> = [];
    profileTestList.forEach((profileTest: ProfileTest, index: number) => {
      const profile = profileTest.profile;
      const latestTestRun = profileTest.lastTestRun;
      const result =
        typeof latestTestRun?.testresult === "undefined"
          ? undefined
          : latestTestRun.testresult
          ? "Positive"
          : "Negative";

      currentRowItems.push(
        <Grid item xs={12} sm={6} md={4} key={`${profile.id}-griditem`}>
          <ProfileCard
            profileUID={profile.id}
            name={`${profile.firstname} ${profile.lastname}`}
            lastTestResult={result}
            lastTestDate={
              latestTestRun?.timestamp
                ? new Date(latestTestRun?.timestamp)
                : undefined
            }
          />
        </Grid>
      );
      if (index === profileTestList.length - 1) {
        rows = (
          <Grid container spacing={3}>
            {currentRowItems}
          </Grid>
        );
        currentRowItems = [];
      }
    });
  }

  return (
    <PageContent>
      <div className="container">
        <p className={cx(classes.title, "title")}>Welcome to OpenRDT</p>
        <p>
          This service supports at-home testing for COVID-19. Select a profile
          below or add a new profile to continue.
        </p>
        <div className={classes.header}>
          <div>ACTIVE PROFILES</div>
          <FontAwesomeIcon
            icon="plus"
            className={classes.icon}
            onClick={async mouseevent => {
              mouseevent.preventDefault();
              const route = { ...ROUTE_DEFINITIONS.CREATEPROFILE };
              history.push(route.path);
            }}
          />
        </div>
      </div>
      <div className="container">{rows}</div>
    </PageContent>
  );
};
