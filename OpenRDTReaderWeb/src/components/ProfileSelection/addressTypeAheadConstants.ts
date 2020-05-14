// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
export default {};

// Google returns complete addresses as a comma separated value
// with 4 fields for the US:
// <street>, <city>, <state>, <Country>
// with 3 fields for France
export const ADDRESS_FIELD_COUNT = {
  US: 4,
  FR: 3, // not used right now.
};
