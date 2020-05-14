// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
/**
 * Script to run after npm install or yarn install
 *
 * Copy selected files to user's directory
 */

"use strict";

const gentlyCopy = require("gently-copy");
const fs = require("fs");
// User's local directory
const userPath = process.env.INIT_CWD + "/";

const THIRD_PARTY_DIR = userPath + "public/thirdparty/";

const filesToCopy = [
  {
    src: "node_modules/@fortawesome/fontawesome-free/js/all.min.js",
    destination: THIRD_PARTY_DIR + "fontawesome/js",
  },
  {
    src: "node_modules/@fortawesome/fontawesome-free/css/all.min.css",
    destination: THIRD_PARTY_DIR + "fontawesome/css/all.min.css",
  },
];

// Moving files to user's local directory
filesToCopy.forEach((file) => {
  let destinationDirectory = file.destination.split("/");
  destinationDirectory.pop();
  destinationDirectory = destinationDirectory.join("/");

  fs.promises
    .mkdir(destinationDirectory, { recursive: true })
    .then(() => {
      gentlyCopy(userPath + file.src, file.destination);
    })
    .catch(console.error);
});
