// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.

import { QuestionnaireComponentOverrides } from "../../../config/QuestionnaireOverrides";
import QuestionnaireInputButtonGroup from "./QuestionnaireInputButtonGroup";
import QuestionnaireInputCheckbox from "./QuestionnaireInputCheckbox";
import QuestionnaireInputDate from "./QuestionnaireInputDate";
import QuestionnaireInputRadio from "./QuestionnaireInputRadio";
import QuestionnaireInputSelect from "./QuestionnaireInputSelect";
import QuestionnaireInputText from "./QuestionnaireInputText";
import { QuestionnaireRenderComponents } from "./QuestionnaireTypes";

export const RENDER_COMPONENTS: QuestionnaireRenderComponents = {
  text: QuestionnaireInputText,
  password: QuestionnaireInputText,
  select: QuestionnaireInputSelect,
  checkbox: QuestionnaireInputCheckbox,
  buttongroup: QuestionnaireInputButtonGroup,
  radio: QuestionnaireInputRadio,
  date: QuestionnaireInputDate,

  ...QuestionnaireComponentOverrides,
};
