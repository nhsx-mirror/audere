// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import React, { useCallback, useEffect, useState } from "react";

import AuthenticationCard from "./AuthenticationCard";
import { Button } from "components/ui/Buttons";
import PageContent from "../ui/PageContent";
import { getFirebaseApp } from "../Firebase/Firebase";

export default () => {
  const [emailSent, setEmailSent] = useState(false);
  const firebase = getFirebaseApp();

  const checkVerification = useCallback(async (): Promise<boolean> => {
    await firebase.auth.currentUser?.reload();
    return !!firebase.auth.currentUser?.emailVerified;
  }, [firebase]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const isVerified = await checkVerification();
      if (isVerified) {
        window.location.reload();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [checkVerification]);

  const sendEmail = async () => {
    const user = firebase.auth.currentUser;
    if (!user) {
      throw new Error("Something went wrong, please sign in again.");
    }
    await user.sendEmailVerification();
    setEmailSent(true);
  };

  return (
    <PageContent>
      <AuthenticationCard title="Verification email sent">
        <div>
          Please check your email and use the provided link to verify your email
          address.
          <br />
        </div>
        {emailSent && <div>&#10003; Email sent!</div>}
        <br />

        <Button onClick={sendEmail}>Resend email</Button>
      </AuthenticationCard>
    </PageContent>
  );
};
