// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import React, { useCallback, useState } from "react";
import { Theme, createStyles, makeStyles } from "@material-ui/core";

import { Button } from "components/ui/Buttons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loader from "components/ui/Loader";
import { PROFILE_CREATION_FORM } from "./ProfileCreationPanel";
import PageContent from "components/ui/PageContent";
import PageHeader from "components/ui/PageHeader";
import ProfileCreationPanel from "components/ProfileSelection/ProfileCreationPanel";
import { getFirebaseApp } from "components/Firebase/Firebase";
import { useAuthState } from "react-firebase-hooks/auth";

const style = makeStyles((theme: Theme) =>
  createStyles({
    loaderContainer: { maxWidth: "350px", margin: "auto" },
    button: {
      minWidth: "185px",
    },
  })
);

export default () => {
  const firebaseApp = getFirebaseApp();
  const [nextButtonEnabled, setNextButtonEnabled] = useState(false);
  const onFormReady = useCallback(
    (formReady: boolean) => {
      setNextButtonEnabled(formReady);
    },
    [setNextButtonEnabled]
  );
  const styles = style();

  const [auth] = useAuthState(firebaseApp.auth);

  if (!auth) {
    return (
      <div className={styles.loaderContainer}>
        <Loader />
      </div>
    );
  }

  const nextButton = (
    <Button
      className={styles.button}
      disabled={!nextButtonEnabled}
      form={PROFILE_CREATION_FORM}
      type="submit"
      size="large"
    >
      <span>Next</span>
      <span className="icon is-medium">
        <FontAwesomeIcon icon="arrow-right" />
      </span>
    </Button>
  );

  return (
    <PageContent>
      <PageHeader title="Let's collect your information to set up your profile." />
      <div className="container">
        <ProfileCreationPanel onFormReady={onFormReady} />
        <div className="level-right">
          <div className="level-item">{nextButton}</div>
        </div>
      </div>
    </PageContent>
  );
};
