// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
let autoCompleteService: google.maps.places.AutocompleteService;
const getAutoCompleteService = (): google.maps.places.AutocompleteService => {
  if (!autoCompleteService) {
    const { google } = window;

    const placesLib = google.maps.places;

    autoCompleteService = new placesLib.AutocompleteService();
  }
  return autoCompleteService;
};

export default getAutoCompleteService;
