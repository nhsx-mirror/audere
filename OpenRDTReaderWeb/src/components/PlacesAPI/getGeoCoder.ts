// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
let geoCoder: google.maps.Geocoder;
const getGeoCoder = (): google.maps.Geocoder => {
  if (!geoCoder) {
    const { google } = window;

    const mapsLib = google.maps;

    geoCoder = new mapsLib.Geocoder();
  }
  return geoCoder;
};

export default getGeoCoder;
