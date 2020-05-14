// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import "../../style/sassStyle";

import { START_STEP, UNSET_PROFILE_ID } from "../TestRun/TestRunConstants";
import { Theme, createStyles, makeStyles } from "@material-ui/core";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Divider from "../ui/Divider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ROUTE_DEFINITIONS } from "../../routes/routes";
import React from "react";
import { cx } from "style/utils";
import firebase from "firebase/app";
import { getFirebaseApp } from "../Firebase/Firebase";
import getSassStyle from "../../style/sassStyle";
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    profileCard: {
      minHeight: "175px",
      display: "flex",
      flexDirection: "column",
    },
    row: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    primaryText: {
      fontWeight: getSassStyle().strongweight,
    },
    secondaryText: {
      fontSize: "15px",
      color: getSassStyle().secondarytextcolor,
    },
    resultText: {
      fontWeight: 500,
    },
    resultRow: {
      fontSize: "17px",
      marginBottom: "20px",
    },
    rowReverse: {
      display: "flex",
      justifyContent: "flex-end",
    },
    action: {
      cursor: "pointer",
      color: theme.palette.primary.main,
      fontWeight: getSassStyle().strongweight,
    },
    icon: {
      color: theme.palette.primary.main,
    },
  })
);

interface ProfileCard {
  name: string;
  profileUID: string;
  lastTestResult?: string;
  lastTestDate?: Date;
}

export const ProfileCard = (props: ProfileCard) => {
  const [auth] = useAuthState(firebase.auth());
  const history = useHistory();
  const classes = useStyles();

  return (
    <Card raised className={classes.profileCard}>
      <CardContent>
        <div className={classes.row}>
          <div className={classes.primaryText}>{props.name}</div>
          <FontAwesomeIcon icon="pen" className={classes.icon} />
        </div>
        <Divider />
        <div className={classes.row}>
          <p className={classes.secondaryText}>LAST TEST RESULT</p>
          <p className={classes.secondaryText}>DATE</p>
        </div>
        <div className={cx(classes.row, classes.resultRow)}>
          <p className={classes.resultText}>
            {props.lastTestResult || "Not tested"}
          </p>
          {props.lastTestResult && (
            <p>{props.lastTestDate?.toLocaleDateString()}</p>
          )}
        </div>
        <div className={classes.rowReverse}>
          <div
            className={classes.action}
            onClick={async mouseevent => {
              mouseevent.preventDefault();
              if (props.profileUID === UNSET_PROFILE_ID) {
                const route = { ...ROUTE_DEFINITIONS.CREATEPROFILE };
                history.push(route.path);
              } else {
                const testRunID = await getFirebaseApp().addTestRunToUserForProfile(
                  {
                    profileUID: props.profileUID,
                    userUID: auth!.uid,
                  }
                );
                const route = { ...ROUTE_DEFINITIONS.PERFORMTEST };
                route.path = route.path
                  .replace(":testRunUID", testRunID)
                  .replace(":step", START_STEP);
                history.push(route.path);
              }
            }}
          >
            {props.lastTestResult ? "ORDER NEW TEST" : "START TEST"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
