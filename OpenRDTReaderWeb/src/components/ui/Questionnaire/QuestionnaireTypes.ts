// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import { AssetsImageProps } from "../Asset";

interface SelectOption {
  value: string;
  name: string;
  default?: boolean;
  asset?: AssetsImageProps;
}

// Describes an input field.
export interface Question {
  // Should the browser auto fill the field.
  autofill?: boolean;
  // potential error being displayed.
  error: string | null;
  // format input value on change
  formatter: (text: string, questions: { [key: string]: Question }) => string;
  // icon to show on the left
  icon?: string;
  // title above the input
  label: string | React.ReactNode;
  // Is the field mandatory for the form
  mandatory: boolean;
  // name of the input field
  name: string;
  // placeholder value of the input field
  placeholder: string;
  // options for a select component.
  selectOptions?: Array<SelectOption>;
  // type of the input field
  type:
    | "text"
    | "select"
    | "password"
    | "checkbox"
    | "buttongroup"
    | "radio"
    | "date";
  // validator on change
  validators: Array<QuestionValidator>;
  // value of the input. Might need to change to support checkbox and list.
  value?: string;
  typeahead?: {
    callFunction: (
      question: Question,
      resolvePromise: (question: Question) => void | PromiseLike<void>,
      rejectPromise: (err: Error) => void
    ) => Promise<void> | void;
    values: Array<string>;
    blob?: any; // holds any type of information you may need.
  };
}

export interface QuestionnaireRenderComponents {
  [inputType: string]: (props: QuestionnaireInputProps) => JSX.Element;
}

// returns a potential error or null if validated
export interface QuestionValidator {
  (text: string | null, questions: { [key: string]: Question }): string | null;
}

export interface QuestionnaireInputProps {
  question: Question;
  onChange: (event: React.ChangeEvent | React.MouseEvent | DummyEvent) => void;
}

export interface DummyEvent {
  currentTarget: {
    name: string;
    value: string | null;
  };
}
