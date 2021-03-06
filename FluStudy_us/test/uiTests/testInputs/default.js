// Copyright (c) 2019 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.

import strings from "../../../src/i18n/locales/en.json";

export const inputs = {
  [strings.barcode.placeholder]: "ID55555555",
  [strings.common.emailEntry.placeholder]: "fake@auderenow.org",
  [strings.surveyTitle.whatSymptoms]: [strings.surveyOption.cough],
  [strings.surveyTitle.symptomsSeverity]: strings.surveyButton.mild,
  [strings.surveyTitle.whenFirstNoticedIllness]: "none",
  [strings.surveyTitle.howLongToSickest]: strings.surveyButton.halfDay,
  [strings.surveyTitle.antiviral]: strings.surveyButton.no,
  [strings.surveyTitle.fluShot]: strings.surveyButton.no,
  [strings.surveyTitle.travelOutsideState.replace("{{state}}", "CA")]: strings
    .surveyButton.yes,
  [strings.surveyTitle.travelOutsideUS]: strings.surveyButton.yes,
  [strings.surveyTitle.futureStudies]: strings.surveyButton.no,
  [strings.surveyTitle.blueLine]: strings.surveyButton.yes,
  [strings.surveyTitle.pinkLine]: strings.surveyButton.noPink,
  state: "CA",
};
