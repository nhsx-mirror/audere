// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
export interface TestRunStep {
  firstVisitedTime: number;
  lastVisitedTime: number;
}

export interface UserInterpretation {
  blueLine?: string;
  pinkLine?: string;
}

export interface TestRun {
  testRunUID: string;
  lastStep: number;
  timestamp: number;
  profileUID: string;
  steps: Array<TestRunStep>;
  testresult?: boolean;
  photoResultURL?: string;
  userInterpretation?: UserInterpretation;
}
