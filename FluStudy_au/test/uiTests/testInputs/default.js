// Copyright (c) 2019 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.

import strings from "../../../src/i18n/locales/en.json";

export const inputs = {
  [strings.surveyTitle.researchByAnyResearchers]: strings.surveyButton.no,
  [strings.barcode.placeholder]: "00000000",
  [strings.surveyTitle.whatSymptoms]: [strings.surveyOption.cough],
  [strings.surveyTitle.symptomsStart]: strings.surveyButton["1day"],
  [strings.surveyTitle.symptomsLast48]: strings.surveyButton.no,
  [strings.surveyTitle.symptomsSeverity]: strings.surveyButton.mild,
  [strings.surveyTitle.antibiotics]: strings.surveyButton.yes,
  [strings.surveyTitle.antiviral]: strings.surveyButton.yes,
  [strings.surveyTitle.blueLine]: strings.surveyButton.yes,
  [strings.surveyTitle.pinkLine]: strings.surveyButton.noPink,
  [strings.surveyTitle.numLinesSeen]: strings.surveyButton.oneLine,
};
