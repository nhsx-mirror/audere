// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import { Question } from "components/ui/Questionnaire/QuestionnaireTypes";
import { ADDRESS_FIELD_COUNT } from "./addressTypeAheadConstants";

/**
 * Values coming from the typeahead will either be:
 * - manually entered:
 * 10700 Minette Drive
 * - coming from a selection on the typeahead:
 * 10700 Minetter Drive, Cupertino, CA, USA
 * For the last case, we split the string and only keep the first part
 * while also assigning the city and state to the proper fields.
 */
export default (
  text: string,
  questions: { [key: string]: Question }
): string => {
  if (text.indexOf(",") === -1) {
    return text;
  }
  const addressDetails = text.split(",");
  // Google services return something of the form:
  // <street>, <city>, <state>, <country>
  // This might be different depending on the country.
  if (addressDetails.length < ADDRESS_FIELD_COUNT.US) {
    return text;
  }

  const [street, city, state] = addressDetails;

  questions.state.value = state.trim();
  questions.city.value = city.trim();

  const typeahead = questions.address1.typeahead;
  if (typeahead) {
    // clear the values
    typeahead.values = [];
    // this is to prevent the typeahead to trigger again
    // since it is triggered "on value change".
    typeahead.blob = { lastValueFromTypeahead: true };
  }

  return street;
};
