// Copyright (c) 2018 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.

import "./config";
import sequelizeLogger from "sequelize-log-syntax-colors";

const CONFIG = {
  url: process.env.NONPII_DATABASE_URL,
  logging: (str: string) => console.log(sequelizeLogger(str)),
  dialect: "postgres",
};

export const development = CONFIG;
export const production = CONFIG;
