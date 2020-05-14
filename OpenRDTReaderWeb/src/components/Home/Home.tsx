// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import "../../style/sassStyle";

import { FlowCardLinkRoute } from "../ui/FlowCard";
import Grid from "@material-ui/core/Grid";
import PageContent from "../ui/PageContent";
import PageHeader from "../ui/PageHeader";
import { ROUTE_DEFINITIONS } from "../../routes/routes";
import React from "react";

export default () => {
  return (
    <PageContent>
      <PageHeader
        title="Welcome to OpenRDT, your site for Rapid Diagnostic Tests."
        subtitle="Let's get started by choosing an option below."
      />
      <div className="container">
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <FlowCardLinkRoute
              icon="shopping-cart"
              route={ROUTE_DEFINITIONS.ORDERTEST}
            >
              Order A Test Kit
            </FlowCardLinkRoute>
          </Grid>
          <Grid item xs={12} md={4}>
            <FlowCardLinkRoute
              icon="vial"
              route={ROUTE_DEFINITIONS.CHOOSEPROFILE}
            >
              Perform A Test
            </FlowCardLinkRoute>
          </Grid>
          <Grid item xs={12} md={4}>
            <FlowCardLinkRoute
              icon="question-circle"
              route={ROUTE_DEFINITIONS.MOREINFO}
            >
              Learn More
            </FlowCardLinkRoute>
          </Grid>
        </Grid>
      </div>
    </PageContent>
  );
};
