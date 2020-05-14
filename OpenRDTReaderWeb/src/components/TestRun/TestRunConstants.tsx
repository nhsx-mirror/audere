// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import { APP_MODES, CURRENT_APP_MODE } from "utils/globalConstants";
import { Theme, createStyles, makeStyles } from "@material-ui/core";

import Asset from "../ui/Asset";
import Grid from "@material-ui/core/Grid";
import PhotoUploaderPanel from "../FileUploader/PhotoUploaderPanel";
import React from "react";
import SymptomsCheckerPanel from "components/SymptomsChecker/SymptomsCheckerPanel";
import SymptomsDetailPanel from "components/SymptomsChecker/SymptomsDetailPanel";
import TimedStep from "./TimedStep";
import WaitStep from "./WaitStep";
import WhatDoYouSeeStep from "../WhatDoYouSee/WhatDoYouSeePanel";
import WhatDoYouSeeStep2 from "../WhatDoYouSee/WhatDoYouSee2Panel";
import transcribeTestPath from "./transcribeTestPath";

export const FORMID = "stepForm";

export const UNSET_PROFILE_ID = "UNSET_PROFILE_ID";

export const getStepStyle = makeStyles((theme: Theme) =>
  createStyles({
    bulletList: {
      listStyleType: "square",
      paddingLeft: "1em",
      listStylePosition: "outside",
      "& li": {
        margin: "1rem 0",
      },
    },
    centeredAsset: {
      display: "block",
      margin: "1rem auto",
    },
  })
);

export interface StepDetailComponentProp {
  setStepReady: (ready: boolean) => void;
  submitUrl?: string;
  testRunUID: string;
}

interface NavLink {
  default: string; // default step name for the nav.
  [type: string]: string; // Other possible links.
}

interface StepDetailsIncomplete {
  // Asset before the title.
  LeadingAsset?: React.FunctionComponent;
  title?: string;
  ContentComponent: React.FunctionComponent<StepDetailComponentProp>;
  skipStepForExistingUser?: boolean;
  // this step has a form blocking progress to the next step.
  hasFormContent?: boolean;
  isBlockingStep?: boolean;
  nav: {
    previous?: string;
    next?: NavLink;
  };
}

export interface StepDetails extends StepDetailsIncomplete {
  name: string;
}

export const START_STEP = "setupKit";

// TODO: illness beginnings,
// TODO: antiviral medications,
// TODO: Influenza medication,
// TODO: General Health
// TODO: General exposure
// TODO: Future studies

// This list represents each steps of the test kit tutorial.
const testrunSteps: { [stepName: string]: StepDetailsIncomplete } = {
  setupKit: {
    LeadingAsset: () => (
      <Asset
        height={180}
        width={290}
        alt="Image of a kit box and test vial in a bag."
        src="setupkitbox.png"
      />
    ),
    title: "Getting started",
    ContentComponent: () => (
      <>
        <p>
          This app will guide you through completing a rapid diagnostic test for
          COVID-19 using a nasal swab. The entire process will take about 15
          minutes.
        </p>
        <ul className={getStepStyle().bulletList}>
          <li>Find a well lit location with a flat service.</li>
          <li>Open the kit box and remove the materials. </li>
        </ul>
      </>
    ),
    nav: {
      next: {
        default: "prepareTest1",
      },
    },
  },
  prepareTest1: {
    LeadingAsset: () => (
      <Asset
        height={180}
        width={290}
        alt="Image of the test tube standing in the box and the saline solution being poured in the tube."
        src="prepareTube.png"
      />
    ),
    title: "Prepare Test 1 tube",
    ContentComponent: () => (
      <ul className={getStepStyle().bulletList}>
        <li>Carefully twist open the saline vial.</li>
        <li>
          Squeeze the liquid carefully into the tube so that all the liquid gets
          into the tube.
        </li>
      </ul>
    ),
    nav: {
      next: {
        default: "openswab",
      },
      previous: "setupKit",
    },
  },
  openswab: {
    LeadingAsset: () => (
      <Asset
        height={180}
        width={290}
        alt="Image of the nasal swab being removed from its wrapper."
        src="openNasalSwab.png"
      />
    ),
    title: "Open nasal swab",
    ContentComponent: () => (
      <ul className={getStepStyle().bulletList}>
        <li>
          Remove the nasal swab from the wrapper by pulling the two ends of the
          wrapper apart (like you would to open a band-aid).
        </li>
        <li>Be careful to only touch the handle, not the tip.</li>
      </ul>
    ),
    nav: {
      next: {
        default: "swabnose",
      },
      previous: "prepareTest1",
    },
  },
  swabnose: {
    title: "Swab nose",
    ContentComponent: () => (
      <ul className={getStepStyle().bulletList}>
        <li>
          Gently insert the <strong>entire</strong> soft tip of the swab into
          one nostril until you feel a bit of resistance.
        </li>
        <Asset
          className={getStepStyle().centeredAsset}
          height={180}
          width={290}
          alt="Animation showing the swab being rubbed inside of a nostril."
          src="noseswab.gif"
        />
        <li>
          Using medium pressure, rub the swab around the inside wall of your
          nostril four times.
        </li>
        <li>
          Next, gently insert the <strong>same swab</strong> into the other
          nostril and rub it around the same way.
        </li>
      </ul>
    ),
    nav: {
      next: {
        default: "putSwabInTube",
      },
      previous: "openswab",
    },
  },
  putSwabInTube: {
    LeadingAsset: () => (
      <Asset
        height={180}
        width={290}
        alt="Image of the swab being put in the test tube and stirred around."
        src="putSwabInTube.png"
      />
    ),
    title: "Put swab in tube",
    ContentComponent: () => (
      <ul className={getStepStyle().bulletList}>
        <li>
          Place the swab into the tube. Make sure the swab tip is touching the
          bottom of the tube.
        </li>
        <li>
          Stir it around <strong>four times</strong> in the tube.
        </li>
        <li>
          The swab needs to stay in the tube for on minute. Click next to start
          the timer.
        </li>
      </ul>
    ),
    nav: {
      next: {
        default: "takeOutSwab", // TODO USC-776 removed for demo: "waitVialReaction",
      },
      previous: "swabnose",
    },
  },
  // TODO USC-776 removed for demo
  waitVialReaction: {
    isBlockingStep: true,
    ContentComponent: React.memo((props: StepDetailComponentProp) => {
      // TODO: make a facts list that changes every x seconds.
      return (
        <>
          <TimedStep
            description="Wait for a full minute so that the testing solution can react with the sample from the swab."
            duration={60000}
            {...props}
          />
          <h1 className="title">Did you know?</h1>
          <p>
            You can become infected by coming into close contact (about 6 feet
            or two arm lengths) with a person who has COVID-19. COVID-19 is
            primarily spread from person to person.
          </p>
        </>
      );
    }),
    nav: {
      next: {
        default: "takeOutSwab",
      },
      previous: "putSwabInTube",
    },
  },
  takeOutSwab: {
    LeadingAsset: () => (
      <Asset
        height={180}
        width={290}
        alt="Image of the swab being pulled out of the tube, and rubbed against the tube wall."
        src="removeSwabFromTube.png"
      />
    ),
    title: "Remove swab from tube",
    ContentComponent: () => (
      <ul className={getStepStyle().bulletList}>
        <li>
          Carefully rub the tip of the swab against the wall of the tube as you
          pull it out.
        </li>
        <li>Squeeze as much liquid out of the swab as possible. </li>
        <li>Throw the swab in the trash. You won't need it again.</li>
      </ul>
    ),
    nav: {
      next: {
        default: "openTestStrip",
      },
      previous: "putSwabInTube", // TODO USC-776 removed for demo: "waitVialReaction",
    },
  },
  openTestStrip: {
    LeadingAsset: () => (
      <Asset
        height={180}
        width={290}
        alt="Image of the test strip being taken out of its pouch."
        src="openTestStrip.png"
      />
    ),
    title: "Open test strip",
    ContentComponent: () => (
      <ul className={getStepStyle().bulletList}>
        <li>Locate the test strip in the white pouch with purple printing.</li>
        <li>
          Open the package by tearing across the top where there is already a
          small cut.
        </li>
      </ul>
    ),
    nav: {
      next: {
        default: "putTestStripInTube",
      },
      previous: "takeOutSwab",
    },
  },
  putTestStripInTube: {
    LeadingAsset: () => (
      <Asset
        height={180}
        width={290}
        alt="Image of the test strip being put in the test tube."
        src="putTestStripInTube.png"
      />
    ),
    title: "Put test strip in tube",
    ContentComponent: () => (
      // TODO: start timer on submit here.
      <ul className={getStepStyle().bulletList}>
        <li>
          The arrows on the test strip should be <strong>pointing down</strong>{" "}
          as you lower it into the tube. Make sure the strip is touching the
          liquid in the bottom.
        </li>
        <li>
          Leave the test strip in the tube. It needs to be there for at least 10
          minutes. We will let you know when to take it out.
        </li>
        <li>
          In the mean time, please answer some questions so we can better
          understand how this illness has affected you.
        </li>
      </ul>
    ),
    nav: {
      next: {
        default: "listSymptoms",
      },
      previous: "openTestStrip",
    },
  },
  listSymptoms: {
    title: "Symptom survey",
    hasFormContent: true,
    ContentComponent: React.memo(SymptomsCheckerPanel),
    nav: {
      next: {
        default: "symptomsDetail",
        noSymptoms: "waitStripReaction",
      },
      previous: "putTestStripInTube",
    },
  },
  symptomsDetail: {
    title: "Symptom severity",
    hasFormContent: true,
    ContentComponent: React.memo(SymptomsDetailPanel),
    nav: {
      next: {
        default: "waitStripReaction",
      },
      previous: "listSymptoms",
    },
  },
  waitStripReaction: {
    title: "Please wait 10 minutes",
    hasFormContent: true,
    // TODO:
    // - add option to get an SMS reminder.
    ContentComponent: React.memo(WaitStep),
    nav: {
      next: {
        default: "removeTestStrip",
      },
      previous: "symptomsDetail",
    },
  },
  removeTestStrip: {
    LeadingAsset: () => (
      <Asset
        height={180}
        width={290}
        alt="Image of the test strip being removed from the tube, and of a stopper being put back on the tube."
        src="removeTestStrip.png"
      />
    ),
    title: "Remove the test strip",
    ContentComponent: () => (
      <ul className={getStepStyle().bulletList}>
        <li>Remove the test strip from the tube.</li>
        <li>
          Place the test strip in the middle of the kit box with the arrows
          pointing down towards you.
        </li>
        <li>Put the grey stopper securely back on the tube.</li>
      </ul>
    ),
    nav: {
      next: {
        default: "whatDoYouSee",
      },
      previous: "waitStripReaction",
    },
  },
  whatDoYouSee: {
    title: "What do you see?",
    hasFormContent: true,
    ContentComponent: React.memo(WhatDoYouSeeStep),
    nav: {
      next: {
        default: "whatDoYouSee2",
        noLine: "scanStrip",
      },
      previous: "removeTestStrip",
    },
  },
  whatDoYouSee2: {
    title: "What do you see?",
    hasFormContent: true,
    ContentComponent: React.memo(WhatDoYouSeeStep2),
    nav: {
      next: {
        default: "scanStrip",
      },
      previous: "whatDoYouSee",
    },
  },
  scanStrip: {
    title: "Scan your test strip",
    ContentComponent: React.memo(props => (
      <div>
        <div>
          Ensure your test strip is in the middle of the box, and hold your
          phone flat and directly above your test strip before taking its photo.
        </div>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Asset
              className={getStepStyle().centeredAsset}
              height={180}
              width={290}
              alt="Image of the test strip being put in its position in the box."
              src="scanthestrip.png"
            />
          </Grid>
          <Grid item xs={6}>
            <Asset
              className={getStepStyle().centeredAsset}
              height={180}
              width={290}
              alt="Image of a phone taking the test strip photo."
              src="holdphone.png"
            />
          </Grid>
        </Grid>
        {CURRENT_APP_MODE === APP_MODES.PROD && (
          <div>Choose one of the options below to take the photo.</div>
        )}
        <PhotoUploaderPanel {...props} />
      </div>
    )),
    hasFormContent: true,
    nav: {
      previous: "whatDoYouSee2",
    },
  },
};

const TESTRUN_STEPS: { [stepName: string]: StepDetails } = {};

// Populate the name field
Object.getOwnPropertyNames(testrunSteps).forEach((stepName: string) => {
  TESTRUN_STEPS[stepName] = {
    ...testrunSteps[stepName],
    name: stepName,
  };
});

transcribeTestPath(TESTRUN_STEPS);

export { TESTRUN_STEPS };

export function getNextStepOfType(param: {
  currentStepName: string;
  nextStepType: string;
}): string | undefined {
  const nextNav = TESTRUN_STEPS[param.currentStepName].nav.next;
  if (nextNav) {
    return nextNav[param.nextStepType];
  }
  return undefined;
}

export function getNextDefaultStep(param: {
  currentStepName: string;
}): string | undefined {
  return getNextStepOfType({
    ...param,
    nextStepType: "default",
  });
}

export function getPreviousStep(param: {
  currentStepName: string;
}): string | undefined {
  return TESTRUN_STEPS[param.currentStepName].nav.previous;
}
