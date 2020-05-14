// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import React from "react";
import Loader from "../Loader";
import StoryWrapper from "utils/StoryWrapper";

export default {
  title: "Loader",
  component: Loader,
};

export const LoaderExample = () => (
  <StoryWrapper>
    Simple Loader:
    <div style={{ maxWidth: "400px" }}>
      <Loader />
    </div>
  </StoryWrapper>
);
