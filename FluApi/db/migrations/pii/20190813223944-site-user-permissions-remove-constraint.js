// Copyright (c) 2019 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.

'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint('site_user_permissions', 'site_user_permissions_userId_key');
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addConstraint('site_user_permissions', ['userId'], {
      name: 'site_user_permissions_userId_key',
      type: 'unique',
    });
  }
};
