// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import React from "react";
import { render } from "@testing-library/react";
import DashboardApp from "../DashboardApp";

test("renders learn react link", () => {
  const { getByText } = render(<DashboardApp />);
  const linkElement = getByText(/Welcome to the/i);
  expect(linkElement).toBeInTheDocument();
});
