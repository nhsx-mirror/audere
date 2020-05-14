// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import React from "react";
import Timer from "../Timer";
import StoryWrapper from "utils/StoryWrapper";

export default {
  title: "Timer",
  component: Timer,
};

export const TimerExample = () => (
  <StoryWrapper>
    <div style={{ maxWidth: "300px" }}>
      <Timer duration={10000} />
    </div>
  </StoryWrapper>
);
