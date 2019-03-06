import React from "react";
import { createDrawerNavigator, createStackNavigator } from "react-navigation";
import {
  Welcome,
  Why,
  What,
  Age,
  Symptoms,
  AddressScreen,
  AgeIneligible,
  SymptomsIneligible,
  Consent,
  ConsentIneligible,
  Confirmation,
  PushNotifications,
} from "./screens/ScreeningScreens";
import {
  WelcomeBack,
  WhatsNext,
  Before,
  ScanInstructions,
  Scan,
  ScanConfirmation,
  ManualEntry,
  ManualConfirmation,
  TestInstructions,
  Unpacking,
  Swab,
  SwabPrep,
  OpenSwab,
  Mucus,
  SwabInTube,
  FirstTimer,
  RemoveSwabFromTube,
  OpenTestStrip,
  StripInTube,
  WhatSymptoms,
  WhenSymptoms,
  GeneralExposure,
  GeneralHealth,
  ThankYouSurvey,
  TestStripReady,
  FinishTube,
  LookAtStrip,
  TestStripSurvey,
  PictureInstructions,
  TestStripCamera,
  TestStripConfirmation,
  CleanFirstTest,
  FirstTestFeedback,
  BeginSecondTest,
  PrepSecondTest,
  MucusSecond,
  SwabInTubeSecond,
  CleanSecondTest,
  SecondTestFeedback,
  Packing,
  Stickers,
  SecondBag,
  TapeBox,
  ShipBox,
  SchedulePickup,
  EmailOptIn,
  Thanks,
} from "./screens/SurveyScreens";
import {
  Menu,
  About,
  Funding,
  Partners,
  GeneralQuestions,
  Problems,
  TestQuestions,
  GiftcardQuestions,
  ContactSupport,
  Version,
} from "./screens/MenuScreens";

const Home = createStackNavigator(
  {
    Welcome,
    Why,
    What,
    Age,
    AgeIneligible,
    Symptoms,
    SymptomsIneligible,
    Consent,
    ConsentIneligible,
    Address: AddressScreen,
    Confirmation,
    PushNotifications,
    WelcomeBack,
    WhatsNext,
    Before,
    ScanInstructions,
    Scan,
    ScanConfirmation,
    ManualEntry,
    ManualConfirmation,
    TestInstructions,
    Unpacking,
    Swab,
    SwabPrep,
    OpenSwab,
    Mucus,
    SwabInTube,
    FirstTimer,
    RemoveSwabFromTube,
    OpenTestStrip,
    StripInTube,
    WhatSymptoms,
    WhenSymptoms,
    GeneralExposure,
    GeneralHealth,
    ThankYouSurvey,
    TestStripReady,
    FinishTube,
    LookAtStrip,
    TestStripSurvey,
    PictureInstructions,
    TestStripCamera,
    TestStripConfirmation,
    CleanFirstTest,
    FirstTestFeedback,
    BeginSecondTest,
    PrepSecondTest,
    MucusSecond,
    SwabInTubeSecond,
    CleanSecondTest,
    SecondTestFeedback,
    Packing,
    Stickers,
    SecondBag,
    TapeBox,
    ShipBox,
    SchedulePickup,
    EmailOptIn,
    Thanks,
  },
  {
    // @ts-ignore
    defaultNavigationOptions: {
      gesturesEnabled: false,
    },
    headerMode: "none",
  }
);

export default createDrawerNavigator(
  {
    Home,
    About,
    Funding,
    Partners,
    GeneralQuestions,
    Problems,
    TestQuestions,
    GiftcardQuestions,
    ContactSupport,
    Version,
  },
  {
    contentComponent: Menu,
    drawerPosition: "right",
  }
);
