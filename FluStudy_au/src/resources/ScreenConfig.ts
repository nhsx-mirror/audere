// Copyright (c) 2019 by Audere
//
// Use of this source code is governed by an MIT-style license that
// can be found in the LICENSE file distributed with this file.

import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import {
  setConsent,
  setTenMinuteStartTime,
  setOneMinuteStartTime,
  setTotalTestStripTime,
} from "../store";
import { FunnelEvents } from "../util/tracker";
import {
  getTestStripConfirmationNextScreen,
  getTestStripSurveyNextScreen,
  logFluResult,
} from "../util/fluResults";
import {
  ConsentConfig,
  WhatSymptomsConfig,
  SymptomsStartConfig,
  FeverStartConfig,
  CoughStartConfig,
  FatigueStartConfig,
  ChillsStartConfig,
  SoreThroatStartConfig,
  HeadacheStartConfig,
  AchesStartConfig,
  RunningNoseStartConfig,
  ShortBreathStartConfig,
  VomitingStartConfig,
  SymptomsLast48Config,
  FeverLast48Config,
  CoughLast48Config,
  FatigueLast48Config,
  ChillsLast48Config,
  SoreThroatLast48Config,
  HeadacheLast48Config,
  AchesLast48Config,
  RunningNoseLast48Config,
  ShortBreathLast48Config,
  VomitingLast48Config,
  SymptomsSeverityConfig,
  FeverSeverityConfig,
  CoughSeverityConfig,
  FatigueSeverityConfig,
  ChillsSeverityConfig,
  SoreThroatSeverityConfig,
  HeadacheSeverityConfig,
  AchesSeverityConfig,
  RunningNoseSeverityConfig,
  ShortBreathSeverityConfig,
  VomitingSeverityConfig,
  InContactConfig,
  CoughSneezeConfig,
  YoungChildrenConfig,
  HouseholdChildrenConfig,
  ChildrenWithChildrenConfig,
  PeopleInHouseholdConfig,
  BedroomsConfig,
  FluShotConfig,
  FluShotDateConfig,
  FluShotNationalImmunization,
  FluShotNationalImmunizationCondition,
  PreviousSeason,
  MedicalConditionConfig,
  HealthCareWorkerConfig,
  SmokeTobaccoConfig,
  HouseholdTobaccoConfig,
  InterferingConfig,
  AntibioticsConfig,
  AgeConfig,
  AssignedSexConfig,
  RaceConfig,
  TestFeedbackConfig,
  BlueLineConfig,
  PinkWhenBlueConfig,
  PinkLineConfig,
  NumLinesSeenConfig,
} from "audere-lib/coughQuestionConfig";
import { ScreenConfig } from "../ui/components/Screen";
import Barcode from "../ui/components/flu/Barcode";
import BarcodeScanner from "../ui/components/BarcodeScanner";
import BarcodeEntry from "../ui/components/flu/BarcodeEntry";
import BulletPointsComponent from "../ui/components/BulletPoint";
import CameraPermissionContinueButton from "../ui/components/CameraPermissionContinueButton";
import ContinueButton from "../ui/components/ContinueButton";
import Divider from "../ui/components/Divider";
import Links from "../ui/components/Links";
import MainImage from "../ui/components/MainImage";
import Questions from "../ui/components/Questions";
import RDTImage from "../ui/components/flu/RDTImage";
import RDTImageHC from "../ui/components/flu/RDTImageHC";
import RDTReader from "../ui/components/flu/RDTReader";
import ScreenText from "../ui/components/ScreenText";
import TestResult from "../ui/components/flu/TestResult";
import TestResultRDT from "../ui/components/flu/TestResultRDT";
import TestStripCamera from "../ui/components/flu/TestStripCamera";
import Timer from "../ui/components/Timer";
import Title from "../ui/components/Title";
import VideoPlayer from "../ui/components/VideoPlayer";
import FooterNavigation from "../ui/components/FooterNavigation";
import PendingButton from "../ui/components/PendingButton";
import { hasPendingData, pendingNavigation } from "../util/pendingData";
import ConsentText from "../ui/components/ConsentText";
import BackButton from "../ui/components/BackButton";
import DidYouKnow from "../ui/components/DidYouKnow";

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const TEST_STRIP_MS = 10 * MINUTE_MS;
const CAN_USE_RDT = !DeviceInfo.isEmulator();

export const Screens: ScreenConfig[] = [
  {
    body: [{ tag: Title }, { tag: ScreenText, props: { label: "desc" } }],
    chromeProps: { hideBackButton: true, splashImage: "welcome" },
    key: "Welcome",
    footer: [
      {
        tag: FooterNavigation,
        props: {
          next: "WhatsRequired",
          hideBackButton: true,
          stepDots: { step: 1, total: 3 },
        },
      },
    ],
  },
  {
    body: [{ tag: Title }, { tag: ScreenText, props: { label: "desc" } }],
    chromeProps: { hideBackButton: true, splashImage: "whatsrequired" },
    key: "WhatsRequired",
    footer: [
      {
        tag: FooterNavigation,
        props: { next: "ReadyToBegin", stepDots: { step: 2, total: 3 } },
      },
    ],
  },
  {
    body: [{ tag: Title }, { tag: ScreenText, props: { label: "desc" } }],
    chromeProps: { hideBackButton: true, splashImage: "readytobegin" },
    key: "ReadyToBegin",
    footer: [
      {
        tag: FooterNavigation,
        props: {
          next: "ResearchStudy",
          stepDots: { step: 3, total: 3 },
        },
      },
    ],
  },
  {
    body: [{ tag: Title }, { tag: ScreenText, props: { label: "desc" } }],
    chromeProps: { hideBackButton: true },
    key: "ResearchStudy",
    footer: [
      {
        tag: ContinueButton,
        props: {
          next: "ParticipantInformation",
        },
      },
    ],
  },
  {
    body: [
      { tag: Title },
      {
        tag: ScreenText,
        props: {
          center: false,
          label: "desc",
          style: { marginHorizontal: 0 },
        },
      },
      {
        tag: ScreenText,
        props: {
          center: false,
          label: "desc2",
          style: { marginHorizontal: 0 },
        },
      },
      {
        tag: ScreenText,
        props: {
          center: false,
          label: "desc3",
          style: { marginHorizontal: 0 },
        },
      },
    ],
    key: "ParticipantInformation",
    footer: [{ tag: ContinueButton, props: { next: "Consent" } }],
  },
  {
    body: [
      { tag: Title },
      { tag: ConsentText },
      {
        tag: Questions,
        props: { questions: ConsentConfig },
        validate: true,
      },
      {
        tag: ScreenText,
        props: {
          center: false,
          label: "consentFormText2",
          style: {
            marginHorizontal: 0,
          },
        },
      },
    ],
    key: "Consent",
    automationNext: "ScanInstructions",
    footer: [
      {
        tag: ContinueButton,
        props: {
          dispatchOnNext: () => setConsent(),
          label: "accept",
          next: "ScanInstructions",
        },
      },
      {
        tag: ContinueButton,
        props: {
          label: "noThanks",
          next: "ConsentDeclined",
          primary: false,
        },
      },
    ],
  },
  {
    body: [
      { tag: Title },
      { tag: MainImage, props: { uri: "thanksforyourinterest" } },
      { tag: ScreenText, props: { center: true, label: "desc" } },
    ],
    footer: [{ tag: BackButton, props: { label: "backToConsent" } }],
    funnelEvent: FunnelEvents.CONSENT_DECLINED,
    key: "ConsentDeclined",
  },
  {
    body: [
      { tag: MainImage, props: { uri: "scanbarcode" } },
      { tag: Title },
      { tag: ScreenText, props: { label: "desc" } },
    ],
    automationNext: "ManualEntry",
    footer: [
      {
        tag: CameraPermissionContinueButton,
        props: { grantedNext: "Scan", deniedNext: "ManualEntry" },
      },
    ],
    funnelEvent: FunnelEvents.CONSENT_COMPLETED,
    key: "ScanInstructions",
  },
  {
    body: [
      {
        tag: BarcodeScanner,
        props: {
          next: "ScanConfirmation",
          timeoutScreen: "ManualEntry",
          errorScreen: "BarcodeContactSupport",
        },
      },
    ],
    key: "Scan",
  },
  {
    body: [
      { tag: Title },
      { tag: ScreenText, props: { label: "desc" } },
      {
        tag: BarcodeEntry,
        validate: true,
        props: { errorScreen: "BarcodeContactSupport" },
      },
    ],
    footer: [{ tag: ContinueButton, props: { next: "ManualConfirmation" } }],
    key: "ManualEntry",
  },
  {
    body: [
      { tag: MainImage, props: { uri: "barcodesuccess" } },
      { tag: Title },
      { tag: Barcode },
      { tag: ScreenText, props: { label: "desc" } },
    ],
    footer: [{ tag: ContinueButton, props: { next: "Unpacking" } }],
    funnelEvent: FunnelEvents.SCAN_CONFIRMATION,
    key: "ScanConfirmation",
    workflowEvent: "surveyStartedAt",
  },
  {
    body: [
      { tag: MainImage, props: { uri: "barcodesuccess" } },
      { tag: Title },
      { tag: Barcode },
      { tag: ScreenText, props: { label: "desc" } },
    ],
    footer: [{ tag: ContinueButton, props: { next: "Unpacking" } }],
    funnelEvent: FunnelEvents.MANUAL_CODE_CONFIRMATION,
    key: "ManualConfirmation",
    workflowEvent: "surveyStartedAt",
  },
  {
    body: [
      { tag: MainImage, props: { uri: "contactsupport" } },
      { tag: Title },
      { tag: ScreenText, props: { label: "desc" } },
      { tag: Links, props: { links: ["inputManually"] } },
    ],
    key: "BarcodeContactSupport",
  },
  {
    body: [
      { tag: MainImage, props: { uri: "setupkitbox" } },
      { tag: Title },
      {
        tag: BulletPointsComponent,
        props: { label: "desc", customBulletUri: "listarrow" },
      },
    ],
    footer: [{ tag: ContinueButton, props: { next: "Swab" } }],
    key: "Unpacking",
  },
  {
    body: [
      { tag: MainImage, props: { uri: "preparetube" } },
      { tag: Title },
      {
        tag: BulletPointsComponent,
        props: { label: "desc", customBulletUri: "listarrow" },
      },
    ],
    footer: [{ tag: ContinueButton, props: { next: "OpenSwab" } }],
    key: "Swab",
  },
  {
    body: [
      { tag: MainImage, props: { uri: "opennasalswab" } },
      { tag: Title },
      {
        tag: BulletPointsComponent,
        props: { label: "desc", customBulletUri: "listarrow" },
      },
    ],
    footer: [{ tag: ContinueButton, props: { next: "Mucus" } }],
    key: "OpenSwab",
  },
  {
    body: [
      { tag: MainImage, props: { uri: "collectmucus" } },
      { tag: Title },
      {
        tag: BulletPointsComponent,
        props: { label: "desc", customBulletUri: "listarrow" },
      },
      { tag: VideoPlayer, props: { id: "collectSample" } },
    ],
    footer: [{ tag: ContinueButton, props: { next: "SwabInTube" } }],
    key: "Mucus",
  },
  {
    body: [
      { tag: MainImage, props: { uri: "putswabintube" } },
      { tag: Title },
      {
        tag: BulletPointsComponent,
        props: { label: "desc", customBulletUri: "listarrow" },
      },
    ],
    footer: [
      {
        tag: ContinueButton,
        props: {
          dispatchOnNext: () => setOneMinuteStartTime(),
          label: "startTimer",
          next: "FirstTimer",
        },
      },
    ],
    funnelEvent: FunnelEvents.SURVIVED_SWAB,
    key: "SwabInTube",
  },
  {
    body: [
      { tag: MainImage, props: { uri: "oneminutetimer" } },
      { tag: Title },
      {
        tag: DidYouKnow,
        props: {
          startTimeConfig: "oneMinuteStartTime",
          msPerItem: 10 * SECOND_MS,
        },
      },
    ],
    footer: [
      {
        tag: Timer,
        props: {
          next: "RemoveSwabFromTube",
          startTimeConfig: "oneMinuteStartTime",
          totalTimeMs: MINUTE_MS,
        },
      },
    ],
    key: "FirstTimer",
  },
  {
    body: [
      { tag: MainImage, props: { uri: "removeswabfromtube" } },
      { tag: Title },
      {
        tag: BulletPointsComponent,
        props: { label: "desc", customBulletUri: "listarrow" },
      },
      { tag: VideoPlayer, props: { id: "removeSwabFromTube" } },
    ],
    footer: [{ tag: ContinueButton, props: { next: "OpenTestStrip" } }],
    funnelEvent: FunnelEvents.PASSED_FIRST_TIMER,
    key: "RemoveSwabFromTube",
  },
  {
    body: [
      { tag: MainImage, props: { uri: "openteststrip" } },
      { tag: Title },
      {
        tag: BulletPointsComponent,
        props: { label: "desc", customBulletUri: "listarrow" },
      },
    ],
    footer: [{ tag: ContinueButton, props: { next: "StripInTube" } }],
    key: "OpenTestStrip",
  },
  {
    body: [
      { tag: MainImage, props: { uri: "putteststripintube" } },
      { tag: Title },
      {
        tag: BulletPointsComponent,
        props: { label: "desc", customBulletUri: "listarrow" },
      },
    ],
    footer: [
      {
        tag: ContinueButton,
        props: {
          dispatchOnNext: () => setTenMinuteStartTime(),
          next: "WhatSymptoms",
        },
      },
    ],
    key: "StripInTube",
  },
  {
    body: [
      { tag: Title },
      { tag: ScreenText, props: { center: true, label: "desc" } },
      { tag: Divider },
      {
        tag: Questions,
        props: { questions: [WhatSymptomsConfig] },
        validate: true,
      },
    ],
    footer: [{ tag: ContinueButton, props: { next: "WhenSymptoms" } }],
    key: "WhatSymptoms",
  },
  {
    body: [
      { tag: Title },
      { tag: ScreenText, props: { center: true, label: "desc" } },
      { tag: Divider },
      {
        tag: Questions,
        props: {
          questions: [
            SymptomsStartConfig,
            FeverStartConfig,
            CoughStartConfig,
            FatigueStartConfig,
            ChillsStartConfig,
            SoreThroatStartConfig,
            HeadacheStartConfig,
            AchesStartConfig,
            RunningNoseStartConfig,
            ShortBreathStartConfig,
            VomitingStartConfig,
            SymptomsLast48Config,
            FeverLast48Config,
            CoughLast48Config,
            FatigueLast48Config,
            ChillsLast48Config,
            SoreThroatLast48Config,
            HeadacheLast48Config,
            AchesLast48Config,
            RunningNoseLast48Config,
            ShortBreathLast48Config,
            VomitingLast48Config,
            SymptomsSeverityConfig,
            FeverSeverityConfig,
            CoughSeverityConfig,
            FatigueSeverityConfig,
            ChillsSeverityConfig,
            SoreThroatSeverityConfig,
            HeadacheSeverityConfig,
            AchesSeverityConfig,
            RunningNoseSeverityConfig,
            ShortBreathSeverityConfig,
            VomitingSeverityConfig,
          ],
        },
        validate: true,
      },
    ],
    footer: [{ tag: ContinueButton, props: { next: "GeneralExposure" } }],
    key: "WhenSymptoms",
  },
  {
    body: [
      { tag: Title },
      { tag: ScreenText, props: { center: true, label: "desc" } },
      { tag: Divider },
      { tag: ScreenText, props: { label: "expoDesc" } },
      { tag: MainImage, props: { uri: "generalexposure" } },
      { tag: ScreenText, props: { italic: true, label: "expoRef" } },
      {
        tag: Questions,
        props: {
          questions: [
            InContactConfig,
            CoughSneezeConfig,
            YoungChildrenConfig,
            HouseholdChildrenConfig,
            ChildrenWithChildrenConfig,
            PeopleInHouseholdConfig,
            BedroomsConfig,
          ],
        },
        validate: true,
      },
    ],
    footer: [{ tag: ContinueButton, props: { next: "InfluenzaVaccination" } }],
    key: "GeneralExposure",
  },
  {
    body: [
      { tag: Title },
      { tag: ScreenText, props: { center: true, label: "desc" } },
      { tag: Divider },
      {
        tag: Questions,
        props: {
          questions: [
            FluShotConfig,
            FluShotDateConfig,
            FluShotNationalImmunization,
            FluShotNationalImmunizationCondition,
            PreviousSeason,
          ],
        },
        validate: true,
      },
    ],
    footer: [{ tag: ContinueButton, props: { next: "GeneralHealth" } }],
    key: "InfluenzaVaccination",
  },
  {
    body: [
      { tag: Title },
      { tag: ScreenText, props: { center: true, label: "desc" } },
      { tag: Divider },
      { tag: ScreenText, props: { center: true, label: "next" } },
      {
        tag: Questions,
        props: {
          questions: [
            MedicalConditionConfig,
            HealthCareWorkerConfig,
            SmokeTobaccoConfig,
            HouseholdTobaccoConfig,
            InterferingConfig,
            AntibioticsConfig,
            AgeConfig,
            AssignedSexConfig,
            RaceConfig,
          ],
        },
        validate: true,
      },
    ],
    footer: [{ tag: ContinueButton, props: { next: "ThankYouSurvey" } }],
    key: "GeneralHealth",
  },
  {
    body: [
      { tag: MainImage, props: { uri: "questionsthankyou" } },
      { tag: Title },
      { tag: ScreenText, props: { label: "desc" } },
      { tag: ScreenText, props: { label: "waiting" } },
    ],
    footer: [
      {
        tag: Timer,
        props: {
          next: "TestStripReady",
          startTimeConfig: "tenMinuteStartTime",
          totalTimeMs: TEST_STRIP_MS,
        },
      },
    ],
    funnelEvent: FunnelEvents.COMPLETED_SURVEY,
    key: "ThankYouSurvey",
  },
  {
    body: [
      { tag: MainImage, props: { uri: "removeteststrip" } },
      { tag: Title },
      {
        tag: BulletPointsComponent,
        props: { label: "desc", customBulletUri: "listarrow" },
      },
    ],
    footer: [
      {
        tag: ContinueButton,
        props: {
          dispatchOnNext: setTotalTestStripTime,
          next: "TestStripSurvey",
        },
      },
    ],
    key: "TestStripReady",
  },
  {
    body: [
      { tag: MainImage, props: { uri: "updatesettings" } },
      { tag: Title },
      {
        tag: ScreenText,
        props: { label: Platform.OS === "android" ? "descAndroid" : "desc" },
      },
    ],
    key: "CameraSettings",
  },
  {
    body: [
      { tag: RDTImage },
      { tag: Title },
      { tag: ScreenText, props: { label: "desc" } },
    ],
    footer: [
      {
        tag: ContinueButton,
        props: { surveyGetNextFn: getTestStripConfirmationNextScreen },
      },
    ],
    key: "TestStripConfirmation",
  },
  {
    body: [
      { tag: MainImage, props: { uri: "lookatteststrip" } },
      { tag: Title },
      { tag: ScreenText, props: { label: "desc" } },
      {
        tag: Questions,
        props: {
          questions: [BlueLineConfig, PinkWhenBlueConfig, PinkLineConfig],
          logOnSave: logFluResult,
        },
        validate: true,
      },
    ],
    automationNext: "TestResult",
    footer: [
      {
        tag: ContinueButton,
        props: { surveyGetNextFn: getTestStripSurveyNextScreen },
      },
    ],
    key: "TestStripSurvey",
  },
  {
    body: [
      { tag: RDTImageHC },
      { tag: Title },
      { tag: ScreenText, props: { label: "desc" } },
      {
        tag: Questions,
        props: {
          questions: [NumLinesSeenConfig],
        },
        validate: true,
      },
    ],
    footer: [
      {
        tag: ContinueButton,
        props: { next: "TestResultRDT" },
      },
    ],
    key: "PostRDTTestStripSurvey",
  },
  {
    body: [
      { tag: Title },
      { tag: ScreenText, props: { label: "common:testResult:desc" } },
      { tag: TestResult },
    ],
    footer: [
      { tag: ContinueButton, props: { next: "CleanTest" } },
      { tag: Divider },
      {
        tag: ScreenText,
        props: { label: "common:testResult:disclaimer" },
      },
    ],
    key: "TestResult",
  },
  {
    body: [
      { tag: Title },
      { tag: ScreenText, props: { label: "common:testResult:desc" } },
      { tag: TestResultRDT },
    ],
    footer: [
      { tag: ContinueButton, props: { next: "CleanTest" } },
      { tag: Divider },
      {
        tag: ScreenText,
        props: { label: "common:testResult:disclaimer" },
      },
    ],
    key: "TestResultRDT",
  },
  {
    body: [
      { tag: MainImage, props: { uri: "defectiveteststrip" } },
      { tag: Title },
      { tag: ScreenText, props: { label: "desc" } },
      { tag: Divider },
      { tag: ScreenText, props: { label: "whatToDo" } },
      { tag: ScreenText, props: { label: "common:testResult:whatToDoCommon" } },
    ],
    footer: [
      { tag: ContinueButton, props: { next: "CleanTest" } },
      { tag: Divider },
      {
        tag: ScreenText,
        props: { label: "common:testResult:disclaimer" },
      },
    ],
    key: "InvalidResult",
  },
  {
    body: [
      { tag: Title },
      { tag: ScreenText, props: { label: "desc" } },
      { tag: Links, props: { links: ["ausGov", "CDC", "myDr"] } },
    ],
    footer: [{ tag: ContinueButton, props: { next: "CleanTest" } }],
    key: "Advice",
  },
  {
    body: [
      { tag: MainImage, props: { uri: "cleanuptest" } },
      { tag: Title },
      { tag: ScreenText, props: { label: "desc" } },
    ],
    footer: [{ tag: ContinueButton, props: { next: "TestFeedback" } }],
    key: "CleanTest",
  },
  {
    body: [
      { tag: MainImage, props: { uri: "nicejob" } },
      { tag: Title },
      {
        tag: Questions,
        props: { questions: [TestFeedbackConfig] },
        validate: true,
      },
    ],
    footer: [
      { tag: ContinueButton, props: { surveyGetNextFn: pendingNavigation } },
    ],
    key: "TestFeedback",
    automationNext: "Thanks",
  },
  {
    body: [
      { tag: MainImage, props: { uri: "nointernetconnection" } },
      { tag: Title },
      { tag: ScreenText, props: { label: "desc" } },
    ],
    footer: [
      {
        tag: PendingButton,
        props: { hasPendingFn: hasPendingData },
      },
    ],
    key: "PendingData",
  },

  {
    body: [
      { tag: MainImage, props: { uri: "finalthanks" } },
      { tag: Title },
      { tag: ScreenText, props: { label: "desc" } },
    ],
    key: "Thanks",
    workflowEvent: "surveyCompletedAt",
  },
  {
    body: [
      { tag: MainImage, props: { uri: "takepictureteststrip" } },
      { tag: Title },
      { tag: ScreenText, props: { label: "desc" } },
      {
        tag: BulletPointsComponent,
        props: { label: "instructions", customBulletUri: "listarrow" },
      },
    ],
    automationNext: "TestStripConfirmation",
    footer: [
      {
        tag: CameraPermissionContinueButton,
        props: {
          grantedNext: CAN_USE_RDT ? "RDTReader" : "TestStripCamera",
          deniedNext: "CameraSettings",
        },
      },
    ],
    key: "RDTInstructions",
  },
  {
    body: [
      {
        tag: RDTReader,
        props: { next: "TestStripConfirmation", fallback: "TestStripCamera" },
      },
    ],
    key: "RDTReader",
  },
  {
    body: [
      {
        tag: TestStripCamera,
        props: { next: "TestStripConfirmation" },
      },
    ],
    key: "TestStripCamera",
  },
];
