// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import Divider from "../Divider";
import React from "react";
import StoryWrapper from "utils/StoryWrapper";

export default {
  title: "Divider",
  component: Divider,
};

export const SimpleDivider = () => (
  <StoryWrapper>
    Simple Divider: <Divider />
  </StoryWrapper>
);

export const VecticalDivider = () => (
  <StoryWrapper>
    Vertical Divider: <Divider isVertical={true} label="test" />
  </StoryWrapper>
);
