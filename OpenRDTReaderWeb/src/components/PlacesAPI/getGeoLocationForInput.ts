// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import getGeoCoder from "./getGeoCoder";

const cache = {} as { [name: string]: Array<google.maps.GeocoderResult> };

const getGeoLocationForInput = (
  input: string
): Promise<google.maps.GeocoderResult[]> => {
  return new Promise(function(
    resolve: (value: any) => void,
    reject: (reason: any) => void
  ) {
    if (cache[input]) {
      resolve(cache[input]);
    }

    getGeoCoder().geocode(
      {
        address: input,
        componentRestrictions: {
          country: "US",
        },
      },
      (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
          cache[input] = results;
          // resolve results upon a successful status
          resolve(results);
        } else {
          // reject status upon un-successful status
          reject(new Error("Cannot connect to google Geocoder."));
        }
      }
    );
  });
};

export default getGeoLocationForInput;
