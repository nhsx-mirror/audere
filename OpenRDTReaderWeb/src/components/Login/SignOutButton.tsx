// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import "../../style/sassStyle";

import { Button } from "components/ui/Buttons";
import { ROUTE_DEFINITIONS } from "../../routes/routes";
import React from "react";
import { getFirebaseApp } from "../Firebase/Firebase";
import { useHistory } from "react-router-dom";

interface SignOutButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  onClick?: (event: React.KeyboardEvent | React.MouseEvent) => void;
}
export default (props: SignOutButtonProps) => {
  const history = useHistory();
  return (
    <Button
      onClick={async event => {
        props.onClick && props.onClick(event);

        event.preventDefault();

        const firebase = getFirebaseApp();
        await firebase.signOut();

        history.push(ROUTE_DEFINITIONS.LANDING.path);
      }}
      className={props.className}
    >
      Logout
    </Button>
  );
};
