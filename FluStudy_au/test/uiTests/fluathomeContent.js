// Copyright (c) 2019 by Audere
//
// Use of this source code is governed by an MIT-style license that
// can be found in the LICENSE file distributed with this file.

import strings from "../../src/i18n/locales/en.json";

export const content = [
  {
    type: "basic",
    title: strings.Welcome.title,
    button: strings.common.button.next.toUpperCase(),
    dbScreenName: "Welcome",
  },
  {
    type: "basic",
    title: strings.WhatsRequired.title,
    button: strings.common.button.next.toUpperCase(),
    dbScreenName: "WhatsRequired",
  },
  {
    type: "basic",
    title: strings.ReadyToBegin.title,
    button: strings.common.button.next.toUpperCase(),
    dbScreenName: "ReadyToBegin",
  },
  {
    type: "basic",
    title: strings.ResearchStudy.title,
    button: strings.common.button.continue.toUpperCase(),
    dbScreenName: "ResearchStudy",
  },
  {
    type: "basic",
    title: strings.ParticipantInformation.title,
    button: strings.common.button.continue.toUpperCase(),
    dbScreenName: "ParticipantInformation",
  },
  {
    type: "input",
    title: strings.Consent.title,
    button: strings.Consent.accept.toUpperCase(),
    dbScreenName: "Consent",
    input: [
      {
        name: strings.surveyTitle.researchBySameResearchers,
        type: "buttonGrid",
        dbLocation: "responses",
        options: [strings.surveyButton.no, strings.surveyButton.yes],
      },
    ],
  },
  {
    type: "input",
    title: strings.ManualEntry.title,
    button: strings.common.button.continue.toUpperCase(),
    dbScreenName: "ManualEntry",
    input: [
      {
        name: strings.barcode.placeholder,
        type: "text",
        dbLocation: "samples",
      },
      {
        name: strings.barcode.secondPlaceholder,
        type: "text",
      },
    ],
  },
  {
    type: "basic",
    title: strings.ManualConfirmation.title,
    button: strings.common.button.continue.toUpperCase(),
    dbScreenName: "ManualConfirmation",
  },
  {
    type: "basic",
    title: strings.Unpacking.title,
    button: strings.common.button.continue.toUpperCase(),
    dbScreenName: "Unpacking",
  },
  {
    type: "basic",
    title: strings.Swab.title,
    button: strings.common.button.continue.toUpperCase(),
    dbScreenName: "Swab",
  },
  {
    type: "basic",
    title: strings.OpenSwab.title,
    button: strings.common.button.continue.toUpperCase(),
    dbScreenName: "OpenSwab",
  },
  {
    type: "basic",
    title: strings.Mucus.title,
    button: strings.common.button.continue.toUpperCase(),
    dbScreenName: "Mucus",
  },
  {
    type: "basic",
    title: strings.SwabInTube.title,
    button: strings.SwabInTube.startTimer.toUpperCase(),
    dbScreenName: "SwabInTube",
  },
  {
    type: "timer",
    title: strings.FirstTimer.title,
    button: strings.common.button.continue.toUpperCase(),
    dbScreenName: "FirstTimer",
  },
  {
    type: "basic",
    title: strings.RemoveSwabFromTube.title,
    button: strings.common.button.continue.toUpperCase(),
    dbScreenName: "RemoveSwabFromTube",
  },
  {
    type: "basic",
    title: strings.OpenTestStrip.title,
    button: strings.common.button.continue.toUpperCase(),
    dbScreenName: "OpenTestStrip",
  },
  {
    type: "basic",
    title: strings.StripInTube.title,
    button: strings.common.button.continue.toUpperCase(),
    dbScreenName: "StripInTube",
  },
  {
    type: "input",
    title: strings.WhatSymptoms.title,
    button: strings.common.button.continue.toUpperCase(),
    dbScreenName: "WhatSymptoms",
    input: [
      {
        name: strings.surveyTitle.whatSymptoms,
        type: "checkbox",
        dbLocation: "responses",
        options: [
          strings.surveyOption.feelingFeverish,
          strings.surveyOption.cough,
          strings.surveyOption.fatigue,
          strings.surveyOption.chillsOrSweats,
          strings.surveyOption.soreThroat,
          strings.surveyOption.headache,
          strings.surveyOption.muscleOrBodyAches,
          strings.surveyOption.runningNose,
          strings.surveyOption.shortnessOfBreath,
          strings.surveyOption.vomiting,
        ],
      },
    ],
  },
  {
    type: "input",
    title: strings.WhatSymptoms.title,
    button: strings.common.button.continue.toUpperCase(),
    dbScreenName: "WhenSymptoms",
    input: [
      {
        name: strings.surveyTitle.symptomsStart,
        type: "buttonGrid",
        dbLocation: "responses",
        options: [
          strings.surveyButton["1day"],
          strings.surveyButton["2days"],
          strings.surveyButton["3days"],
          strings.surveyButton["4days"],
        ],
      },
      {
        name: strings.surveyTitle.symptomsLast48,
        type: "buttonGrid",
        dbLocation: "responses",
        options: [strings.surveyButton.no, strings.surveyButton.yes],
      },
      {
        name: strings.surveyTitle.symptomsSeverity,
        type: "buttonGrid",
        dbLocation: "responses",
        options: [
          strings.surveyButton.mild,
          strings.surveyButton.moderate,
          strings.surveyButton.severe,
        ],
      },
    ],
  },
  {
    type: "input",
    title: strings.GeneralExposure.title,
    button: strings.common.button.continue.toUpperCase(),
    dbScreenName: "GeneralExposure",
    input: [
      {
        name: strings.surveyTitle.inContact,
        type: "buttonGrid",
        dbLocation: "responses",
        options: [
          strings.surveyButton.no,
          strings.surveyButton.yes,
          strings.surveyButton.dontKnow,
        ],
      },
      {
        name: strings.surveyTitle.coughSneeze,
        type: "buttonGrid",
        dbLocation: "responses",
        options: [
          strings.surveyButton.no,
          strings.surveyButton.yes,
          strings.surveyButton.dontKnow,
        ],
      },
      {
        name: strings.surveyTitle.youngChildren,
        type: "radio",
        dbLocation: "responses",
        options: [
          strings.surveyButton.noContactUnderFive,
          strings.surveyButton.oneChild,
          strings.surveyButton.twoToFiveChildren,
          strings.surveyButton.moreThanFiveChildren,
          strings.surveyButton.dontKnow,
        ],
      },
      {
        name: strings.surveyTitle.householdChildren,
        type: "buttonGrid",
        dbLocation: "responses",
        options: [strings.surveyButton.no, strings.surveyButton.yes],
      },
      {
        name: strings.surveyTitle.childrenWithChildren,
        type: "buttonGrid",
        dbLocation: "responses",
        options: [
          strings.surveyButton.no,
          strings.surveyButton.yes,
          strings.surveyButton.dontKnow,
        ],
      },
      {
        name: strings.surveyTitle.peopleInHousehold,
        type: "buttonGrid",
        dbLocation: "responses",
        options: [
          strings.surveyButton["1to2"],
          strings.surveyButton["3to4"],
          strings.surveyButton["5to7"],
          strings.surveyButton["8plus"],
        ],
      },
      {
        name: strings.surveyTitle.bedrooms,
        type: "buttonGrid",
        dbLocation: "responses",
        options: [
          strings.surveyButton["0-1"],
          strings.surveyButton["2"],
          strings.surveyButton["3"],
          strings.surveyButton["4"],
          strings.surveyButton["5+"],
        ],
      },
    ],
  },
  {
    type: "input",
    title: strings.InfluenzaVaccination.title,
    button: strings.common.button.continue.toUpperCase(),
    dbScreenName: "InfluenzaVaccination",
    input: [
      {
        name: strings.surveyTitle.fluShot,
        type: "buttonGrid",
        dbLocation: "responses",
        options: [
          strings.surveyButton.no,
          strings.surveyButton.yes,
          strings.surveyButton.dontKnow,
          strings.surveyButton.neverFlu,
        ],
      },
      {
        name: strings.surveyTitle.fluShotDate,
        type: "select",
        link: strings.monthPicker.selectDate,
        options: [],
      },
      {
        name: strings.surveyTitle.fluShotNationalImmunization,
        type: "buttonGrid",
        dbLocation: "responses",
        options: [
          strings.surveyButton.no,
          strings.surveyButton.yes,
          strings.surveyButton.dontKnow,
        ],
      },
      {
        name: strings.surveyTitle.fluShotNationalImmunizationCondition,
        type: "text",
      },
      {
        name: strings.surveyTitle.previousSeason,
        type: "radio",
        dbLocation: "responses",
        options: [
          strings.surveyButton.yes,
          strings.surveyButton.no,
          strings.surveyButton.dontKnow,
        ],
      },
    ],
  },
  {
    type: "input",
    title: strings.GeneralHealth.title,
    button: strings.common.button.continue.toUpperCase(),
    dbScreenName: "GeneralHealth",
    input: [
      {
        name: strings.surveyTitle.medicalCondition,
        type: "checkbox",
        dbLocation: "responses",
        options: [
          strings.surveyOption.asthma,
          strings.surveyOption.copd,
          strings.surveyOption.diabetes,
          strings.surveyOption.heartDisease,
          strings.surveyOption.noneOfThese,
          strings.surveyOption.dontKnow,
        ],
      },
      {
        name: strings.surveyTitle.healthcareWorker,
        type: "buttonGrid",
        dbLocation: "responses",
        options: [
          strings.surveyButton.no,
          strings.surveyButton.yes,
          strings.surveyButton.dontKnow,
        ],
      },
      {
        name: strings.surveyTitle.smokeTobacco,
        type: "buttonGrid",
        dbLocation: "responses",
        options: [strings.surveyButton.no, strings.surveyButton.yes],
      },
      {
        name: strings.surveyTitle.householdTobacco,
        type: "buttonGrid",
        dbLocation: "responses",
        options: [strings.surveyButton.no, strings.surveyButton.yes],
      },
      {
        name: strings.surveyTitle.interfering,
        type: "buttonGrid",
        dbLocation: "responses",
        options: [strings.surveyButton.no, strings.surveyButton.yes],
      },
      {
        name: strings.surveyTitle.antibiotics,
        type: "buttonGrid",
        dbLocation: "responses",
        options: [
          strings.surveyButton.no,
          strings.surveyButton.yes,
          strings.surveyButton.dontKnow,
        ],
      },
      {
        name: strings.surveyTitle.age,
        type: "select",
        link: strings.surveyButton.selectAge,
        dbLocation: "responses",
        options: [
          strings.surveyButton["18to19"],
          strings.surveyButton["20to24"],
          strings.surveyButton["25to29"],
          strings.surveyButton["30to34"],
          strings.surveyButton["35to39"],
          strings.surveyButton["40to44"],
          strings.surveyButton["45to49"],
          strings.surveyButton["50to54"],
          strings.surveyButton["55to59"],
          strings.surveyButton["60to64"],
          strings.surveyButton["65to69"],
          strings.surveyButton["70to74"],
          strings.surveyButton["75to79"],
          strings.surveyButton["80to84"],
          strings.surveyButton["85to89"],
          strings.surveyButton["90+"],
        ],
      },
      {
        name: strings.surveyTitle.assignedSex,
        type: "buttonGrid",
        dbLocation: "responses",
        options: [
          strings.surveyButton.male,
          strings.surveyButton.female,
          strings.surveyButton.indeterminate,
          strings.surveyButton.preferNotToSay,
        ],
      },
      {
        name: strings.surveyTitle.race,
        type: "checkbox",
        dbLocation: "responses",
        options: [
          strings.surveyOption.aboriginal,
          strings.surveyOption.torresStraitIslander,
          strings.surveyOption.pacificIslander,
          strings.surveyOption.asian,
          strings.surveyOption.african,
          strings.surveyOption.european,
          strings.surveyOption.whiteAustralian,
          strings.surveyOption.southOrCentralAmerican,
          strings.surveyOption.middleEastNorthAfrican,
          strings.surveyOption.indianSubcontinent,
          strings.surveyOption.other,
        ],
      },
    ],
  },
  {
    type: "timer",
    title: strings.ThankYouSurvey.title,
    button: strings.common.button.continue.toUpperCase(),
    dbScreenName: "ThankYouSurvey",
  },
  {
    type: "basic",
    title: strings.TestStripReady.title,
    button: strings.common.button.continue.toUpperCase(),
    dbScreenName: "TestStripReady",
  },
  {
    type: "input",
    title: strings.TestStripSurvey.title,
    button: strings.common.button.continue.toUpperCase(),
    dbScreenName: "TestStripSurvey",
    input: [
      {
        name: strings.surveyTitle.blueLine,
        type: "buttonGrid",
        dbLocation: "responses",
        options: [strings.surveyButton.no, strings.surveyButton.yes],
      },
    ],
  },
  {
    type: "input",
    title: strings.TestStripSurvey.title,
    button: strings.common.button.continue.toUpperCase(),
    dbScreenName: "TestStripSurvey2",
    input: [
      {
        name: strings.surveyTitle.pinkLine,
        type: "radio",
        dbLocation: "responses",
        options: [
          strings.surveyButton.noPink,
          strings.surveyButton.yesAboveBlue,
          strings.surveyButton.yesBelowBlue,
          strings.surveyButton.yesAboveBelowBlue,
        ],
      },
    ],
  },
  {
    type: "basic",
    title: strings.RDTInstructions.title,
    button: strings.common.button.continue.toUpperCase(),
    dbScreenName: "RDTInstructions",
  },
  {
    type: "rdt",
    title: strings.TestStripCamera.title,
    dbScreenName: "TestStripCamera",
  },
  {
    type: "basic",
    title: strings.TestStripConfirmation.title,
    button: strings.common.button.continue.toUpperCase(),
    dbScreenName: "TestStripConfirmation",
  },
  {
    type: "basic",
    title: strings.TestResult.title,
    button: strings.common.button.continue.toUpperCase(),
    dbScreenName: "TestResult",
  },
  {
    type: "basic",
    title: strings.CleanTest.title,
    button: strings.common.button.continue.toUpperCase(),
    dbScreenName: "CleanTest",
  },
  {
    type: "input",
    title: strings.TestFeedback.title,
    button: strings.common.button.continue.toUpperCase(),
    dbScreenName: "TestFeedback",
    input: [
      {
        name: strings.surveyTitle.TestFeedback,
        type: "radio",
        dbLocation: "responses",
        options: [
          strings.surveyButton.easyCorrect,
          strings.surveyButton.confusingCorrect,
          strings.surveyButton.confusingNotCorrect,
          strings.surveyButton.incorrect,
        ],
      },
    ],
  },
  {
    type: "basic",
    title: strings.FollowUpSurvey.title,
    button: strings.common.button.continue.toUpperCase(),
    iosPopupOnContinue: "Allow",
    dbScreenName: "FollowUpSurvey",
  },
  {
    type: "basic",
    title: strings.Thanks.title,
    dbScreenName: "Thanks",
  },
];
