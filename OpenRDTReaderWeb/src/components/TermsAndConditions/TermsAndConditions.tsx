// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import "../../style/sassStyle";

import PageContent from "../ui/PageContent";
import PageHeader from "../ui/PageHeader";
import React from "react";

export const getTermsAndConditions = () => {
  const lorem =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque lobortis ornare eros ut condimentum. Sed vulputate molestie libero, quis tempus ipsum auctor vel. Quisque pharetra vel ante sed vehicula. Cras at sapien sed nisl semper tristique. Nunc maximus sagittis faucibus. Vivamus aliquet sodales sapien, ac sollicitudin est tempor eget. Nulla facilisi. Maecenas imperdiet orci id lobortis molestie. Maecenas aliquet metus mi, vel cursus nulla aliquam a. Praesent scelerisque lectus eget quam tempor dapibus. Integer libero ipsum, blandit in nisl ac, mollis pulvinar dolor. Integer fringilla rutrum nisl eget sollicitudin. Vestibulum sem sem, finibus sed magna vitae, lobortis tincidunt purus. Praesent vestibulum orci dui, sed dapibus metus fermentum non. Suspendisse rutrum varius mi a pellentesque. Aenean nibh nulla, ornare sit amet dolor at, interdum sodales ex.";
  return lorem.repeat(2);
};

export default () => {
  return (
    <PageContent>
      <PageHeader
        title="OpenRDT Terms and Conditions."
        subtitle="All you need to know before using our test."
      />
      <div className="container">{getTermsAndConditions()}</div>
    </PageContent>
  );
};
