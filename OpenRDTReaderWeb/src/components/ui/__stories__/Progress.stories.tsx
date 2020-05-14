// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import React, { useCallback, useState } from "react";

import { Button } from "../Buttons";
import Progress from "../Progress";
import StoryWrapper from "utils/StoryWrapper";

export default {
  title: "Progress",
  component: Progress,
};

export const ProgressExample = () => {
  const [value, setValue] = useState(20);
  const previousClick = useCallback(() => {
    setValue(Math.max(value - 10, 0));
  }, [value, setValue]);
  const nextClick = useCallback(() => {
    setValue(Math.min(value + 10, 40));
  }, [value, setValue]);

  return (
    <StoryWrapper>
      <Progress max={40} value={value} />
      <Button size="large" onClick={previousClick}>
        Previous
      </Button>
      &nbsp;
      <Button size="large" onClick={nextClick}>
        Next
      </Button>
    </StoryWrapper>
  );
};
