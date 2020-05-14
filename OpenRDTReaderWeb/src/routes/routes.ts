// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import CheckEmail from "components/Login/VerifyEmail";
import Cleanup from "components/Cleanup/Cleanup";
import ComingSoon from "../components/ComingSoon/ComingSoon";
import Home from "../components/Home/Home";
import Login from "../components/Login/Login";
import PasswordForget from "../components/Login/PasswordForget";
import ProfileCreation from "components/ProfileSelection/ProfileCreation";
import ProfileSelection from "../components/ProfileSelection/ProfileSelection";
import SignUp from "../components/Login/SignUp";
import TermsAndConditions from "../components/TermsAndConditions/TermsAndConditions";
import TestResult from "components/TestResult/TestResult";
import TestRunHome from "../components/TestRun/TestRunHome";
import TestRunSteps from "../components/TestRun/TestRunSteps";
import firebase from "firebase/app";

export interface seoDefinition {
  title: string;
  description: string;
}
export interface DashboardRoute {
  path: string;
  exact: boolean;
  // Should we hide the nav bar on this page.
  hideNavBar?: true;
  // should it have a tab in the nav bar?
  renderNavTab: (auth: firebase.User | null | undefined) => boolean;
  navTitle?: string;
  // auth access to the page.
  pageAccess: (auth: firebase.User | null | undefined) => boolean;
  seo: seoDefinition;
  component: React.ComponentClass<any, any> | React.FunctionComponent<any>;
}

function never(): boolean {
  return false;
}

function always(): boolean {
  return true;
}

function loggedInVerified(auth: firebase.User | null | undefined): boolean {
  return !!auth && auth.emailVerified;
}

function loggedInUnverified(auth: firebase.User | null | undefined): boolean {
  return !!auth && !auth.emailVerified;
}

function loggedOut(auth: firebase.User | null | undefined) {
  return !auth;
}

export const ROUTE_DEFINITIONS: { [key: string]: DashboardRoute } = {
  HOME: {
    path: "/home",
    exact: true,
    renderNavTab: loggedInVerified,
    navTitle: "Home",
    pageAccess: loggedInVerified,
    seo: {
      title: "Home",
      description: "Your Homepage for the OpenRDT Dashboard",
    },
    component: Home,
  },
  LOGIN: {
    path: "/login",
    exact: true,
    hideNavBar: true,
    renderNavTab: loggedOut,
    navTitle: "login",
    pageAccess: loggedOut,
    seo: {
      title: "Login",
      description: "Login Page for the OpenRDT Dashboard",
    },
    component: Login,
  },
  SIGNUP: {
    path: "/signup",
    exact: true,
    hideNavBar: true,
    renderNavTab: loggedOut,
    navTitle: "signup",
    pageAccess: loggedOut,
    seo: {
      title: "Sign Up",
      description: "Sign Up Page for the OpenRDT Dashboard",
    },
    component: SignUp,
  },
  VERIFYEMAIL: {
    path: "/verifyemail",
    exact: true,
    hideNavBar: true,
    renderNavTab: never,
    pageAccess: loggedInUnverified,
    seo: {
      title: "Check Your Email",
      description: "Page to alert user to verify their email.",
    },
    component: CheckEmail,
  },
  FORGOTPASSWORD: {
    path: "/forgotpassword",
    exact: true,
    hideNavBar: true,
    renderNavTab: never,
    pageAccess: loggedOut,
    seo: {
      title: "Password Recovery",
      description: "Password Recovery Page for the OpenRDT Dashboard",
    },
    component: PasswordForget,
  },
  ORDERTEST: {
    path: "/ordertest",
    exact: true,
    renderNavTab: never,
    pageAccess: loggedInVerified,
    seo: {
      title: "Order a Test Kit",
      description: "Order Page for OpenRDT Test kits",
    },
    component: ComingSoon,
  },
  TESTRUNHOME: {
    path: "/testrunhome",
    exact: true,
    renderNavTab: never,
    pageAccess: loggedInVerified,
    seo: {
      title: "Perform a Test",
      description: "Entry Page for OpenRDT Testing Flow",
    },
    component: TestRunHome,
  },
  MOREINFO: {
    path: "/moreinfo",
    exact: true,
    renderNavTab: never,
    pageAccess: always,
    seo: {
      title: "What is OpenRDT",
      description: "Info Page for OpenRDT",
    },
    component: ComingSoon,
  },
  TESTCAMERA: {
    path: "/testcamera",
    exact: true,
    renderNavTab: never,
    pageAccess: loggedInVerified,
    seo: {
      title: "Camera Test",
      description: "Test your device's ability to take a picture of the kit",
    },
    component: ComingSoon,
  },
  IDINFO: {
    path: "/idinfo",
    exact: true,
    renderNavTab: never,
    pageAccess: loggedInVerified,
    seo: {
      title: "ID Info",
      description: "Why do you need to provide an ID to perform a RDT",
    },
    component: ComingSoon,
  },
  CHOOSEPROFILE: {
    path: "/chooseprofile",
    exact: true,
    renderNavTab: never,
    pageAccess: loggedInVerified,
    seo: {
      title: "Select Someone",
      description: "Person selection for OpenRDT testing",
    },
    component: ProfileSelection,
  },
  CREATEPROFILE: {
    path: "/createProfile",
    exact: true,
    renderNavTab: never,
    pageAccess: loggedInVerified,
    seo: {
      title: "Create Profile",
      description: "Create a person profile for OpenRDT testing",
    },
    component: ProfileCreation,
  },
  PERFORMTEST: {
    path: "/testrunsteps/:testRunUID/:step",
    exact: false,
    renderNavTab: never,
    pageAccess: loggedInVerified,
    seo: {
      title: "Perform a test",
      description: "Step by step flow to perform a test.",
    },
    component: TestRunSteps,
  },
  TESTRESULT: {
    path: "/testresult/:testRunUID",
    exact: true,
    renderNavTab: never,
    pageAccess: loggedInVerified,
    seo: {
      title: "Test Result",
      description: "Page with the OpenRDT test result.",
    },
    component: TestResult,
  },
  TERMSANDCONDITIONS: {
    path: "/termsandconditions",
    exact: true,
    renderNavTab: never,
    pageAccess: loggedInVerified,
    seo: {
      title: "Terms and Conditions",
      description: "Page with the OpenRDT terms and conditions.",
    },
    component: TermsAndConditions,
  },
  CLEANUP: {
    path: "/cleanup",
    exact: true,
    renderNavTab: never,
    pageAccess: loggedInVerified,
    seo: {
      title: "Cleanup",
      description: "Test clean up instructions.",
    },
    component: Cleanup,
  },
};

ROUTE_DEFINITIONS.LANDING = {
  ...ROUTE_DEFINITIONS.LOGIN,
  path: "/",
  renderNavTab: never,
};

export const ROUTES: Array<DashboardRoute> = Object.getOwnPropertyNames(
  ROUTE_DEFINITIONS
).map((routename: string) => ROUTE_DEFINITIONS[routename]);
