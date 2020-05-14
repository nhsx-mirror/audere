// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import { DashboardRoute, ROUTES, ROUTE_DEFINITIONS } from "../../routes/routes";
import { Link, useHistory, useLocation } from "react-router-dom";
import React, { ReactElement, useCallback, useEffect, useState } from "react";
import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";
import { cx, useAnimateBgAndColor } from "style/utils";

import AppBar from "@material-ui/core/AppBar";
import Drawer from "@material-ui/core/Drawer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import SignOutButton from "../Login/SignOutButton";
import SvgNhSlogo from "./NHSlogo";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import Toolbar from "@material-ui/core/Toolbar";
import firebase from "firebase/app";
import getSassStyle from "style/sassStyle";
import { useAuthState } from "react-firebase-hooks/auth";

const useTabStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      marginRight: theme.spacing(0),
      minWidth: "100px",
      "&:hover": {
        color: "#fff",
        backgroundColor: theme.palette.primary.dark,
      },
    },
  })
);

interface LinkTabProps {
  label?: string;
  href?: string;
  className?: string;
}

function LinkTab(props: LinkTabProps) {
  const history = useHistory();
  return (
    <Tab
      component="a"
      className={cx(
        useTabStyles().root,
        useAnimateBgAndColor().animateBgAndColor,
        props.className || ""
      )}
      onClick={(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        event.preventDefault();
        props.href && history.push(props.href);
      }}
      {...props}
    />
  );
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    list: {
      backgroundColor: getSassStyle().bodybackgroundcolor,
      flex: 1,
      width: "250px",
    },

    listItem: {
      borderRadius: 0,
      display: "block",
      textAlign: "center",
      width: "100%",
    },

    menuButton: {
      marginRight: theme.spacing(2),
    },

    noop: {
      display: "none",
    },

    tabContainer: {
      flexGrow: 1,
    },

    title: {
      color: "#fff",
      left: "50%",
      position: "absolute",
      transform: "translate(-50%, 0)",
      lineHeight: 0,

      "&:hover": {
        color: "#fff",
      },
    },

    titleLogo: {
      height: "30px",
    },
  })
);

const Navigation = () => {
  const [auth, isLoading, error] = useAuthState(firebase.auth());
  // is the drawer open
  const [isOpen, setOpen] = useState(false);
  // current tab highlighted
  const [tabIndex, setTabIndex] = React.useState<number>(0);
  const classes = useStyles();
  const location = useLocation();

  const openDrawer = useCallback(
    (event: React.KeyboardEvent | React.MouseEvent) => {
      setOpen(true);
    },
    []
  );

  const closeDrawer = useCallback(
    (event: React.KeyboardEvent | React.MouseEvent) => {
      setOpen(false);
    },
    []
  );

  // Called when a tab is clicked.
  const handleChange = useCallback(
    (event: React.ChangeEvent<{}>, newValue: number) => {
      setTabIndex(newValue);
    },
    []
  );
  let availableRoutes: Array<DashboardRoute> = [];

  // When loading the page we want to highlight the proper tab.
  useEffect(() => {
    const found = availableRoutes.find(
      (route: DashboardRoute, index: number) => {
        if (route.path.startsWith(location.pathname)) {
          setTabIndex(index + 1);
          return true;
        }
        return false;
      }
    );
    if (!found) {
      setTabIndex(0);
    }
  }, [location, availableRoutes]);

  let isLoggedIn = auth;

  if (isLoading) {
    // use the auth state from cache
    const authCache = localStorage.getItem("NavAuthCache");
    isLoggedIn = authCache ? JSON.parse(authCache) : null;
  } else if (!error) {
    localStorage.setItem("NavAuthCache", JSON.stringify(!!auth));
  }

  availableRoutes = ROUTES.filter(route => {
    const shouldShow = route.renderNavTab(isLoggedIn);
    if (shouldShow && !route.navTitle) {
      console.error(
        `Route ${route.path} is attempting to have an item in the nav, but doesn't declare a navTitle`
      );
      return false;
    }
    return shouldShow;
  });

  // Items in the side nav, only visible in small screens.
  const listItems: Array<ReactElement> = [];

  // Items in the navbar, only visible in large screens.
  const tabs: Array<ReactElement> = [
    // This is a hidden item, it is used when there's no match on the url.
    // The <Tabs /> component needs this or it throws a warning in the console.
    <LinkTab href={""} key={"noop"} label={"noop"} className={classes.noop} />,
  ];

  availableRoutes.forEach((route: DashboardRoute, index: number) => {
    listItems.push(
      <ListItem
        button
        className={classes.listItem}
        component={Link}
        key={"sidenav-" + route.path}
        to={route.path}
      >
        {route.navTitle}
      </ListItem>
    );
    tabs.push(
      <LinkTab href={route.path} key={route.path} label={route.navTitle} />
    );
  });

  const highlightIndex = tabIndex > tabs.length - 1 ? 0 : tabIndex;

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <div className={classes.tabContainer}>
            <Hidden smDown>
              <Tabs
                value={highlightIndex}
                onChange={handleChange}
                aria-label="Site Navigation"
              >
                {tabs}
              </Tabs>
            </Hidden>
          </div>
          <Link className={classes.title} to={ROUTE_DEFINITIONS.LANDING.path}>
            <SvgNhSlogo className={classes.titleLogo} />
          </Link>
          {auth && (
            <Hidden smDown>
              <SignOutButton onClick={closeDrawer} />
            </Hidden>
          )}
          <Hidden mdUp>
            <FontAwesomeIcon icon="question-circle" size="lg" />
            <IconButton
              edge="end"
              onClick={openDrawer}
              className={classes.menuButton}
              color="inherit"
              aria-label="menu"
            >
              <FontAwesomeIcon icon="cog" />
            </IconButton>
          </Hidden>
        </Toolbar>
      </AppBar>
      <Drawer anchor="right" open={isOpen} onClose={closeDrawer}>
        <div role="presentation" className={classes.list} onClick={closeDrawer}>
          <List>
            {listItems}
            {auth && (
              <SignOutButton
                className={classes.listItem}
                onClick={closeDrawer}
              />
            )}
          </List>
          <br />
        </div>
      </Drawer>
    </>
  );
};

export default Navigation;
