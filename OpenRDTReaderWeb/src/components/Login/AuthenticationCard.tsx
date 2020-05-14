// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import "../../style/sassStyle";

import React, { ReactNode, useEffect } from "react";
import { Theme, createStyles, makeStyles } from "@material-ui/core";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import SvgNhSlogo from "components/Navigation/NHSlogo";
import { cx } from "style/utils";

let timeoutToken: any;

// NOTE: ACCESSING AN ELEMENT IN REACT IS SOMEWHAT OF AN ANTI PATTERN.
// DON'T DO THIS.
const setBackground = () => {
  clearTimeout(timeoutToken);
  const HTMLElement = document.getElementsByTagName("html")[0]!;
  HTMLElement.className = cx(HTMLElement.className, { BlueBG: true });
};

const unsetBackground = () => {
  // This is done via a timeout to avoid a flashing of the background when
  // switching between login/register/forgotpassword...
  timeoutToken = setTimeout(() => {
    const HTMLElement = document.getElementsByTagName("html")[0]!;
    HTMLElement.className = cx(HTMLElement.className, { BlueBG: false });
  }, 50);
};

const useStyle = makeStyles((theme: Theme) =>
  createStyles({
    SignInForm: {
      maxWidth: "550px",
      margin: "0 auto",
    },
    authenticationHeader: {
      textAlign: "center",
    },
    authenticationHeaderText: {
      padding: "3em 0",
      color: "#fff",
    },
  })
);

const useHeaderStyle = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: "30px 30px 15px",
    },
  })
);

const useContentStyle = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: "15px 30px 30px",
      "&:last-child": {
        paddingBottom: "30px",
      },
    },
  })
);

interface AuthenticationCardProps {
  children: ReactNode;
  title?: ReactNode;
}

export default (props: AuthenticationCardProps) => {
  const { children, title } = props;
  const classes = useStyle();

  setBackground();

  useEffect(() => {
    setBackground();
    return () => {
      unsetBackground();
    };
  }, []);

  return (
    <div className="container">
      <div className={classes.authenticationHeader}>
        <SvgNhSlogo width={200} />
        <div className={classes.authenticationHeaderText}>
          NHS OpenRDT enables you to order and conduct a COVID-19 test from the
          comfort of your home.
        </div>
      </div>
      <div className={classes.SignInForm}>
        <Card raised>
          <CardHeader title={title} className={useHeaderStyle().root} />
          <CardContent className={useContentStyle().root}>
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
