// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import getAutoCompleteService from "./getAutoCompleteService";
import { ADDRESS_FIELD_COUNT } from "components/ProfileSelection/addressTypeAheadConstants";

const getAddressForInput = (input: string): Promise<string[]> => {
  return new Promise(function(
    resolve: (value: Array<string>) => void,
    reject: (reason: any) => void
  ) {
    getAutoCompleteService().getQueryPredictions(
      {
        input: input,
      },
      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          // resolve results upon a successful status
          let returnData = results
            .map(result => result.description)
            .filter(address => {
              const details = address.split(", ");
              return (
                details.length === ADDRESS_FIELD_COUNT.US &&
                details[ADDRESS_FIELD_COUNT.US - 1] === "USA"
              );
            });
          resolve(returnData);
        } else {
          // reject status upon un-successful status
          reject(new Error("Typeahead cannot connect to google places."));
        }
      }
    );
  });
};

export default getAddressForInput;
