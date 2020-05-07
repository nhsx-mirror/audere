// Copyright (c) 2019 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.

import {
  DataPipeline,
  ManagedMaterializedView,
  ManagedSqlNode,
  ManagedSqlType,
  ManagedView,
} from "../data/dataPipeline";
import {
  answerColumns,
  answerValue,
  caseIf,
  matchesIfNotNull,
  namedResponseColumns,
  namedSampleColumns,
  sampleColumns,
} from "../data/fluPipelineUtils";
import { SURVEY_QUESTIONS } from "audere-lib/coughQuestionConfig";
import { getFirebaseDataNodes } from "../data/firebasePipelineNodes";
import { Sequelize } from "sequelize";

export class CoughDataPipeline implements DataPipeline {
  public readonly name: string;
  public readonly db: Sequelize;
  public readonly nodes: ManagedSqlNode[];

  constructor(sql: Sequelize) {
    this.name = "cough_pipeline";
    this.db = sql;
    let nodes = [];
    nodes = nodes.concat(getNonPiiDataNodes());
    nodes = nodes.concat(getFirebaseDataNodes("cough", "cough_derived"));
    this.nodes = nodes;
  }
}

function getNonPiiDataNodes(): ManagedSqlNode[] {
  const testResultNav = "survey->'events' @> '[{\"refId\":\"TestResult\"}]'";

  const backfillResultsExplanation = caseIf(
    testResultNav,
    answerValue(SURVEY_QUESTIONS.find(s => s.id === "PinkWhenBlue")),
    "null"
  );

  const backfillResultsShown = caseIf(
    testResultNav,
    matchesIfNotNull(
      backfillResultsExplanation,
      "No, there are no pink lines",
      "negative",
      "positive"
    ),
    "null"
  );

  return [
    new ManagedSqlType({
      name: "cough_derived.survey_response",
      deps: [],
      spec: `(
        id text,
        text text,
        answer jsonb,
        "answerOptions" jsonb
      )`,
    }),

    new ManagedMaterializedView({
      name: "cough_derived.non_demo_surveys",
      deps: [],
      spec: `
        select cough.current_surveys.*, cough.expert_read.interpretation as expert_interpretation, cough.pii_reviews."containsPii" as contains_pii, cough.pii_reviews.notes as pii_notes from
          cough.current_surveys
          left join cough.expert_read on cough.current_surveys.id = cough.expert_read."surveyId"
          left join cough.pii_reviews on cough.current_surveys.id = cough.pii_reviews."surveyId"
        where survey->>'isDemo' = 'false'
      `,
    }),

    new ManagedMaterializedView({
      name: "cough_derived.survey_named_array_items",
      deps: ["cough_derived.non_demo_surveys"],
      spec: `
        select
          id,
          "createdAt",
          "updatedAt",
          docid,
          device,
          survey,
          ${namedResponseColumns(SURVEY_QUESTIONS).join(",\n  ")},
          ${namedSampleColumns().join(",\n  ")},
          expert_interpretation,
          contains_pii,
          pii_notes
        from cough_derived.non_demo_surveys
      `,
    }),

    new ManagedMaterializedView({
      name: "cough_derived.surveys",
      deps: [
        "cough_derived.survey_response",
        "cough_derived.survey_named_array_items",
      ],
      spec: `
        select
          id,
          "createdAt",
          "updatedAt",
          docid,

          device,
          device->'platform' as platform,
          device->'platform'->'ios' as platform_ios,
          device->'platform'->'android' as platform_android,
          device->>'idiomText' as idiomtext,
          device->>'yearClass' as yearclass,
          device->>'clientBuild' as clientbuild,
          device->>'installation' as installation,
          device->'clientVersion' as clientversion,
          device->'clientVersion'->>'hash' as clientversion_hash,
          device->'clientVersion'->>'name' as clientversion_name,
          device->'clientVersion'->>'version' as clientversion_version,
          device->'clientVersion'->>'buildDate' as clientversion_builddate,
          device->'clientVersion'->>'rdtVersionAndroid' as clientversion_rdt_android,
          device->'clientVersion'->>'rdtVersionIos' as clientversion_rdt_ios,

          survey,
          survey->'marketingProperties' as marketingproperties,
          survey->'events' as events,
          survey->'pushNotificationState' as pushnotificationstate,
          survey->'workflow' as workflow,
          survey->'gender' as gender,
          survey->'consents' as consents,
          survey->'consents'->0 as consent0,
          survey->'consents'->0->'date' as consent0_date,
          survey->'consents'->0->'terms' as consent0_terms,
          survey->'samples' as samples,
          ${sampleColumns().join(",\n")},
          survey->'invalidBarcodes' as invalidbarcodes,
          survey->'responses'->0->'item' as responses,
          ${answerColumns(SURVEY_QUESTIONS).join(",\n")},
          survey->'rdtInfo' as rdtinfo,
          survey->'rdtInfo'->>'captureTime' as rdtinfo_lastcapturetime,
          survey->'rdtInfo'->>'rdtTotalTime' as rdtinfo_totalcapturetime,
          survey->'rdtInfo'->>'flashEnabled' as rdtinfo_flashenabled,
          survey->'rdtInfo'->>'flashDisabledAutomatically' as rdtinfo_flashdisabledautomatically,
          coalesce(survey->'rdtInfo'->>'resultShown', (${backfillResultsShown})) as rdtinfo_resultshown,
          coalesce(survey->'rdtInfo'->>'resultShownExplanation', ${backfillResultsExplanation}) as rdtinfo_resultshownexplanation,
          survey->'rdtInfo'->'rdtReaderResult'->>'testStripFound' as rdtreaderresult_teststripfound,
          survey->'rdtInfo'->'rdtReaderResult'->>'skippedDueToMemWarning' as rdtreaderresult_skippedduetomemwarning,
          survey->'rdtInfo'->'rdtReaderResult'->>'isCentered' as rdtreaderresult_iscentered,
          survey->'rdtInfo'->'rdtReaderResult'->>'sizeResult' as rdtreaderresult_sizeresult,
          survey->'rdtInfo'->'rdtReaderResult'->>'isFocused' as rdtreaderresult_isfocused,
          survey->'rdtInfo'->'rdtReaderResult'->>'angle' as rdtreaderresult_angle,
          survey->'rdtInfo'->'rdtReaderResult'->>'isRightOrientation' as rdtreaderresult_isrightorientation,
          survey->'rdtInfo'->'rdtReaderResult'->>'exposureResult' as rdtreaderresult_exposureresult,
          survey->'rdtInfo'->'rdtReaderResult'->>'controlLineFound' as rdtreaderresult_controllinefound,
          survey->'rdtInfo'->'rdtReaderResult'->>'testALineFound' as rdtreaderresult_testalinefound,
          survey->'rdtInfo'->'rdtReaderResult'->>'testBLineFound' as rdtreaderresult_testblinefound,
          survey->'rdtInfo'->'rdtReaderResult'->>'testStripBoundary' as rdtreaderresult_teststripboundary,
          expert_interpretation,
          contains_pii,
          pii_notes
        from cough_derived.survey_named_array_items
      `,
    }),

    new ManagedView({
      name: "cough_derived.aspren_data",
      deps: [],
      spec: `
        select
          id,
          "createdAt",
          "updatedAt",

          barcode,
          encounter_date,
          encounter_state,
          adeno_result,
          b_pertussis_result,
          flu_a_result,
          flu_b_result,
          h1n1_result,
          h3n2_result,
          metapneumovirus_result,
          mycopneumonia_result,
          para_1_result,
          para_2_result,
          para_3_result,
          rhinovirus_result,
          rsv_result,
          victoria_result,
          yamagata_result,
          atsi,
          date_onset,
          current_vaccination,
          vaccination_date,
          previous_vaccination,
          comorbities,
          comorbities_description,
          hcw_status,
          overseas_illness,
          overseas_location
        from cough.aspren_data
      `,
    }),

    new ManagedMaterializedView({
      name: "cough_derived.follow_up_surveys",
      deps: [],
      spec: "select * from cough.follow_up_surveys",
    }),

    new ManagedView({
      name: "cough_derived.giftcards",
      deps: [],
      spec: `
        select
          id,
          "createdAt",
          "updatedAt",
          is_demo,
          allocated_at,
          denomination,
          doc_id,
          barcode
        from cough.giftcards
      `,
    }),

    new ManagedView({
      name: "cough_derived.config",
      deps: [],
      spec: `
        select
          id,
          "createdAt",
          "updatedAt",
          key,
          value
        from config
        where project = 'cough'
      `,
    }),
  ];
}
