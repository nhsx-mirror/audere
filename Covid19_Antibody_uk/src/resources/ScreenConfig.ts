// Copyright (c) 2019 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.

import { Platform } from "react-native";
import {
  setHasBeenOpened,
  setOneMinuteStartTime,
  setOneMinuteTimerDone,
  setTenMinuteStartTime,
  setTenMinuteTimerDone,
  setTotalTestStripTime,
} from "../store";
import BarcodeScanner from "../ui/components/BarcodeScanner";
import BulletPointsComponent from "../ui/components/BulletPoint";
import Button from "../ui/components/Button";
import CameraPermissionContinueButton from "../ui/components/CameraPermissionContinueButton";
import CollapsibleText from "../ui/components/CollapsibleText";
import ContinueButton from "../ui/components/ContinueButton";
import DidYouKnow from "../ui/components/DidYouKnow";
import Divider from "../ui/components/Divider";
import EmailEntry from "../ui/components/EmailEntry";
import AndroidRDTReader from "../ui/components/flu/AndroidRDTReader";
import BarcodeEntry from "../ui/components/flu/BarcodeEntry";
import RDTImage from "../ui/components/flu/RDTImage";
import TestStripCamera from "../ui/components/flu/TestStripCamera";
import LinkButton from "../ui/components/LinkButton";
import MainImage from "../ui/components/MainImage";
import PendingButton from "../ui/components/PendingButton";
import Questions from "../ui/components/Questions";
import RequiredHint from "../ui/components/RequiredHint";
import { ScreenConfig } from "../ui/components/Screen";
import ScreenText from "../ui/components/ScreenText";
import SelectableComponent from "../ui/components/SelectableComponent";
import TimerRing from "../ui/components/TimerRing";
import Title from "../ui/components/Title";
import {
  COLLECT_MUCUS_IMAGE_NAME,
  GUTTER,
  LINK_COLOR_FOR_DARK,
  SMALL_TEXT,
} from "../ui/styles";
import {
  getCapturedScreenTextVariables,
  getPinkWhenBlueNextScreen,
  getTestStripSurveyNextScreen,
  logFluResult,
} from "../util/fluResults";
import { getGeneralExposureTextVariables } from "../util/generalExposure";
import { openSettingsApp } from "../util/openSettingsApp";
import {
  getBarcodeNextScreen,
  getBarcodeConnectionErrorNextScreen,
  getEmailConfirmationNextScreen,
  getEmailConfirmationTextVariables,
  getShippingTextVariables,
  getThankYouTextVariables,
} from "../util/patientAchievementInfo";
import { pendingNavigation, uploadPendingSuccess } from "../util/pendingData";
import { resetAlert } from "../util/resetState";
import { getRdtResult } from "../util/results";
import { getSymptomsNextScreen } from "../util/symptomsResults";
import { getDevice } from "../transport/DeviceInfo";

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const TEST_STRIP_MS = 10 * MINUTE_MS;

export const Screens: ScreenConfig[] = [
  {
    key: "Welcome",
    backgroundColor: "transparent",
    body: [
      { tag: MainImage, props: { uri: "welcome", useForChrome: true } },
      { tag: Title, props: { color: "white" } },
      { tag: ScreenText, props: { label: "desc", style: { color: "white" } } },
      {
        tag: ContinueButton,
        props: {
          next: "ScanInstructions",
          textStyle: { color: LINK_COLOR_FOR_DARK },
        },
      },
      {
        tag: ContinueButton,
        props: {
          label: "rdtReader",
          next: "RDTInstructions",
          textStyle: { color: LINK_COLOR_FOR_DARK },
        },
      },
    ],
    chromeProps: {
      dispatchOnFirstLoad: [setHasBeenOpened],
      hideBackButton: true,
      showBackgroundOnly: true,
      fadeIn: true,
    },
    automationNext: "ScanInstructions",
  },
  {
    backgroundColor: "transparent",
    body: [
      { tag: MainImage, props: { uri: "howtestworks", useForChrome: true } },
      { tag: Title, props: { color: "white" } },
      { tag: ScreenText, props: { label: "desc", style: { color: "white" } } },
      {
        tag: ContinueButton,
        props: {
          next: "HowAmIHelping",
          textStyle: { color: LINK_COLOR_FOR_DARK },
        },
      },
    ],
    chromeProps: { showBackgroundOnly: true },
    automationNext: "HowAmIHelping",
    key: "HowDoesTestWork",
  },
  {
    key: "ScanInstructions",
    body: [
      { tag: MainImage, props: { uri: "scanbarcode" } },
      { tag: Title },
      { tag: ScreenText, props: { label: "desc" } },
      {
        tag: CameraPermissionContinueButton,
        props: {
          grantedNext: "Scan",
          deniedNext: "CameraSettings",
        },
      },
      {
        tag: ContinueButton,
        props: {
          label: "common:button:skip",
          next: "Unpacking"
        },
      },
    ],
    automationNext: "ManualEntry",
  },
  {
    key: "Unpacking",
    body: [
      { tag: MainImage, props: { uri: "setupkitbox" } },
      { tag: Title },
      {
        tag: BulletPointsComponent,
        props: { label: "desc" },
      },
      {
        tag: ContinueButton,
        props: { next: "StripInTube" },
      },
    ],
    chromeProps: {
      onBack: resetAlert,
    },
    workflowEvent: "surveyStartedAt",
  },
  {
    key: "Scan",
    body: [
      {
        tag: BarcodeScanner,
        props: {
          surveyGetNextFn: getBarcodeNextScreen,
          timeoutScreen: "ManualEntry",
          errorScreen: "BarcodeContactSupport",
        },
      },
    ],
  },
  {
    key: "ManualEntry",
    body: [
      { tag: Title },
      { tag: ScreenText, props: { label: "desc" } },
      {
        tag: BarcodeEntry,
        validate: true,
        props: { errorScreen: "BarcodeContactSupport" },
      },
      {
        tag: MainImage,
        props: { uri: "scanbarcode", imageStyle: { marginBottom: GUTTER } },
      },
      {
        tag: ContinueButton,
        props: { surveyGetNextFn: getBarcodeNextScreen },
      },
    ],
    keyboardAvoidingView: true,
  },
  {
    key: "BarcodeContactSupport",
    body: [
      { tag: MainImage, props: { uri: "contactsupport" } },
      { tag: Title },
      {
        tag: ScreenText,
        props: {
          label: "desc",
          textVariablesFn: getEmailConfirmationTextVariables,
        },
      },
      { tag: ContinueButton, props: { label: "reenter", next: "ManualEntry" } },
      {
        tag: ScreenText,
        props: { label: "desc2" },
      },
    ],
  },
  {
    key: "BarcodeConnectionToServerError",
    body: [
      { tag: Title },
      { tag: ScreenText, props: { label: "desc" } },
      {
        tag: ContinueButton,
        props: {
          label: "common:button:tryAgain",
          showButtonStyle: true,
          style: { alignSelf: "center", marginTop: GUTTER },
          surveyGetNextFn: getBarcodeConnectionErrorNextScreen,
        },
      },
    ],
  },
  {
    key: "EmailConfirmation",
    body: [
      { tag: Title },
      {
        tag: ScreenText,
        props: {
          label: "desc",
          textVariablesFn: getEmailConfirmationTextVariables,
        },
      },
      {
        tag: EmailEntry,
        props: {
          placeholder: "common:emailEntry:placeholder",
        },
        validate: true,
      },
      {
        tag: ContinueButton,
        props: { surveyGetNextFn: getEmailConfirmationNextScreen },
      },
    ],
    keyboardAvoidingView: true,
  },
  {
    key: "EmailError",
    body: [
      { tag: Title },
      {
        tag: ScreenText,
        props: {
          label: "desc",
          textVariablesFn: getEmailConfirmationTextVariables,
        },
      },
      {
        tag: ContinueButton,
        props: {
          label: "reenter",
          next: "EmailConfirmation",
          style: { marginBottom: GUTTER / 2 },
        },
      },
      {
        tag: ContinueButton,
        props: { label: "scanAgain", next: "ScanInstructions" },
      },
      {
        tag: ScreenText,
        props: { label: "desc2" },
      },
    ],
  },
  {
    key: "StripInTube",
    body: [
      { tag: MainImage, props: { uri: "putteststripintube" } },
      { tag: Title },
      {
        tag: BulletPointsComponent,
        props: { label: "desc" },
      },
      {
        tag: ContinueButton,
        props: {
          dispatchOnNext: () => setTenMinuteStartTime(),
          next: "Timer",
        },
      },
    ],
  },
  {
    key: "Timer",
    body: [
      {
        tag: TimerRing,
        props: {
          startTimeConfig: "tenMinuteStartTime",
          totalTimeMs: TEST_STRIP_MS,
          dispatchOnDone: setTenMinuteTimerDone,
        },
      },
      {
        tag: SelectableComponent,
        props: {
          components: [
            [
              { tag: Title, props: { center: false } },
              { tag: ScreenText, props: { label: "desc" } },
              null,
            ],
            [
              { tag: Title, props: { center: false, label: "titleTimerUp" } },
              { tag: ContinueButton, props: { next: "TestStripReady" } },
            ],
          ],
          componentSelectorProp: "tenMinuteTimerDone",
          keyBase: "TimerChangeover",
        },
      },
    ],
  },
  {
    key: "TestStripReady",
    body: [
      { tag: MainImage, props: { uri: "removeteststrip" } },
      { tag: Title },
      {
        tag: BulletPointsComponent,
        props: { label: "desc" },
      },
      {
        tag: ContinueButton,
        props: {
          dispatchOnNext: setTotalTestStripTime,
          next: "RDTInstructions",
        },
      },
    ],
  },
  {
    key: "RDTInstructions",
    body: [
      { tag: Title },
      { tag: ScreenText, props: { label: "desc" } },
      { tag: Divider },
      {
        tag: BulletPointsComponent,
        props: {
          num: 1,
          label: "instructions",
          textStyle: { fontWeight: "bold" },
        },
      },
      {
        tag: MainImage,
        props: {
          uri: "scanthestrip",
          imageStyle: { marginTop: 0, marginBottom: GUTTER },
        },
      },
      { tag: Divider },
      {
        tag: BulletPointsComponent,
        props: {
          num: 2,
          label: "instructions2",
          textVariablesFn: getDevice,
          textStyle: { fontWeight: "bold" },
        },
      },
      {
        tag: MainImage,
        props: {
          uri: "holdphone",
          imageStyle: { marginTop: 0, marginBottom: GUTTER },
        },
      },
      { tag: Divider },
      { tag: ScreenText, props: { label: "desc2" } },
      {
        tag: CameraPermissionContinueButton,
        props: {
          grantedNext: "AndroidRDTReader",
          deniedNext: "CameraSettings",
        },
      },
    ],
    automationNext: "TestStripConfirmation",
    allowedRemoteConfigValues: ["rdtTimeoutSeconds"],
  },
  {
    key: "NonRDTInstructions",
    body: [
      { tag: Title },
      { tag: ScreenText, props: { label: "desc", textVariablesFn: getDevice } },
      { tag: Divider },
      {
        tag: BulletPointsComponent,
        props: {
          num: 1,
          label: "instructions",
          textStyle: { fontWeight: "bold" },
        },
      },
      {
        tag: MainImage,
        props: {
          uri: "scanthestrip",
          imageStyle: { marginTop: 0, marginBottom: GUTTER },
        },
      },
      { tag: Divider },
      {
        tag: BulletPointsComponent,
        props: {
          num: 2,
          label: "instructions2",
          textStyle: { fontWeight: "bold" },
          textVariablesFn: getDevice,
        },
      },
      {
        tag: MainImage,
        props: {
          uri: "holdphone",
          imageStyle: { marginTop: 0, marginBottom: GUTTER },
        },
      },
      { tag: Divider },
      {
        tag: BulletPointsComponent,
        props: {
          num: 3,
          label: "instructions3",
          textStyle: { fontWeight: "bold" },
        },
      },
      {
        tag: CameraPermissionContinueButton,
        props: {
          grantedNext: "TestStripCamera",
          deniedNext: "CameraSettings",
        },
      },
    ],
    automationNext: "TestStripConfirmation",
  },
  {
    key: "AndroidRDTReader",
    body: [
      {
        tag: AndroidRDTReader,
        props: { next: "TestStripConfirmation", fallback: "TestStripCamera" },
      },
    ],
    chromeProps: {
      hideChrome: true,
    },
    backgroundColor: "black",
  },
  {
    key: "TestStripCamera",
    body: [
      {
        tag: TestStripCamera,
        props: { next: "TestStripConfirmation" },
      },
    ],
    chromeProps: {
      hideChrome: true,
      disableBounce: true,
    },
    backgroundColor: "black",
  },
  {
    key: "TestStripConfirmation",
    body: [
      { tag: RDTImage },
      { tag: Title },
      {
        tag: ScreenText,
        props: {
          label: "desc",
          textVariablesFn: getCapturedScreenTextVariables,
        },
      },
      {
        tag: ScreenText,
        props: {
          demoOnly: true,
          label: "diagnosis",
          textVariablesFn: getRdtResult,
        },
      },
      {
        tag: ContinueButton,
        props: { next: "Thanks" },
      },
    ],
  },
  {
    key: "CameraSettings",
    body: [
      { tag: Title },
      {
        tag: ScreenText,
        props: { label: "desc", textVariablesFn: getDevice },
      },
      {
        tag: BulletPointsComponent,
        props: {
          label: Platform.OS === "android" ? "howToAndroid" : "howToIOS",
        },
      },
    ],
    footer: [
      {
        tag: Button,
        props: {
          enabled: true,
          label: "goToSettings",
          primary: true,
          onPress: openSettingsApp,
        },
      },
    ],
  },
  {
    key: "Thanks",
    body: [
      { tag: MainImage, props: { uri: "finalthanks" } },
      { tag: Title },
      {
        tag: ScreenText,
        props: { label: "desc", textVariablesFn: getThankYouTextVariables },
      }
    ],
    workflowEvent: "surveyCompletedAt",
  },
  {
    key: "PendingData",
    body: [{ tag: Title }, { tag: ScreenText, props: { label: "desc" } }],
    footer: [
      {
        tag: PendingButton,
        props: {
          pendingResolvedFn: uploadPendingSuccess,
          next: "Thanks",
        },
      },
    ],
  }
];
