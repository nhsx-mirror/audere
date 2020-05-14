import * as Sentry from "@sentry/browser";
import * as serviceWorker from "./serviceWorker";

import DashboardApp from "./components/App/DashboardApp";
// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import React from "react";
import ReactDOM from "react-dom";
import { getFirebaseApp } from "./components/Firebase/Firebase";

// Initialize Sentry
Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  release: process.env.REACT_APP_SENTRY_RELEASE,
  environment: process.env.REACT_APP_SENTRY_ENVIRONMENT,
});

// Initialize the Firebase app.
// TODO : replace with a context
getFirebaseApp();

ReactDOM.render(
  <React.StrictMode>
    <DashboardApp />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
