import "react-native";
import React from "react";
import App from "../App";
import { AppLoading, Font } from 'expo';

import renderer from "react-test-renderer";

jest.mock("redux-persist/integration/react", () => ({
  PersistGate: (props: any) => props.children,
}));

it("renders without crashing", () => {
  const rendered = renderer.create(<App />);
  expect(rendered).toBeTruthy();
});
