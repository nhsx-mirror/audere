// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import { DashboardRoute, ROUTES, ROUTE_DEFINITIONS } from "../../routes/routes";
import { Helmet, HelmetProvider } from "react-helmet-async";
import {
  Redirect,
  Route,
  BrowserRouter as Router,
  Switch,
} from "react-router-dom";

import { GlobalTheme } from "style/AppThemes";
import NavBar from "../Navigation/NavBar";
import PageNotFound from "../PageNotFound/PageNotFound";
import React from "react";
import ScrollToTop from "react-router-scroll-top";
import { ThemeProvider } from "@material-ui/core/styles";
import firebase from "firebase/app";
import { useAuthState } from "react-firebase-hooks/auth";

const DashboardApp = () => {
  const [auth, loading] = useAuthState(firebase.auth());
  return (
    <HelmetProvider>
      <ThemeProvider theme={GlobalTheme}>
        <Router>
          <ScrollToTop>
            <Switch>
              {ROUTES.map((route: DashboardRoute) => (
                <Route
                  exact={!!route.exact}
                  key={route.path}
                  path={route.path}
                  render={({ location }: any) => {
                    if (loading) {
                      return <Helmet title={`Open RDT: Loading`} />;
                    }
                    if (route.pageAccess(auth)) {
                      return (
                        <>
                          {!route.hideNavBar && <NavBar />}
                          <Helmet>
                            <title>{`Open RDT: ${route.seo.title}`}</title>
                            <meta
                              name="description"
                              content={route.seo.description}
                            />
                          </Helmet>
                          <route.component />
                        </>
                      );
                    }

                    return (
                      <Redirect
                        to={{
                          pathname:
                            ROUTE_DEFINITIONS[
                              auth
                                ? auth.emailVerified
                                  ? "CHOOSEPROFILE"
                                  : "VERIFYEMAIL"
                                : "LANDING"
                            ].path,
                          state: { from: location },
                        }}
                      />
                    );
                  }}
                />
              ))}
              <Route key="pagenotfound">
                <>
                  <Helmet title={`Open RDT: Page not found`} />
                  <PageNotFound />
                </>
              </Route>
            </Switch>
          </ScrollToTop>
        </Router>
      </ThemeProvider>
    </HelmetProvider>
  );
};

export default DashboardApp;
