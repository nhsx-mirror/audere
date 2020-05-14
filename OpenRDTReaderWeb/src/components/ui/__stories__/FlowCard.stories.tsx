// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import FlowCard from "../FlowCard";
import Grid from "@material-ui/core/Grid";
import React from "react";
import StoryWrapper from "utils/StoryWrapper";

export default {
  title: "FlowCard",
  component: FlowCard,
};

export const FlowCardWithIcon = () => (
  <StoryWrapper>
    <Grid container>
      <Grid item xs={6}>
        <FlowCard icon="vial">
          <span>This is a FlowCard.</span>
        </FlowCard>
      </Grid>
    </Grid>
  </StoryWrapper>
);
