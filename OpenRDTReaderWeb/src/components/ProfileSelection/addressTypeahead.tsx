// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import { Question } from "components/ui/Questionnaire/QuestionnaireTypes";
import { throttle } from "lodash";
import getAddressForInput from "components/PlacesAPI/getAddressForInput";

// Cache already requested values
const cache = {};

export const addressTypeAhead = (
  question: Question,
  resolvePromise: (question: Question) => void | PromiseLike<void>,
  rejectPromise: (err: Error) => void
): Promise<void> | void => {
  if (!question.value || !question.typeahead) {
    return;
  }

  // The last change on the address value was triggered by a
  // selection on the typeahead, so no need to show the typeahead
  // again
  if (!!question.typeahead.blob?.lastValueFromTypeahead) {
    question.typeahead.blob.lastValueFromTypeahead = false;
    return;
  }

  if (cache[question.value]) {
    question.typeahead.values = cache[question.value];
    return;
  }

  return getAddressForInput(question.value!)
    .then(value => {
      if (!question.value || !question.typeahead) {
        // Should not happen but who knows.
        throw new Error(
          "WARNING: This question became invalid for a typeahead."
        );
      }
      question.typeahead!.values = value;
      cache[question.value!] = question.typeahead!.values;
    })
    .then(() => {
      resolvePromise({ ...question });
    })
    .catch(rejectPromise);
};

export default throttle(addressTypeAhead, 500, { leading: false });
