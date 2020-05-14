// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import { Question } from "./QuestionnaireTypes";
import { postcodeValidator } from "postcode-validator";

// Runs on the original password field.
export const getCopyCatMatchValidator = (copycatfield: string) => {
  return (text: string | null, questions: { [key: string]: Question }) => {
    const copyCatInput = { ...questions[copycatfield] };
    if (text !== copyCatInput.value) {
      copyCatInput.error = "Passwords must match";
    } else {
      copyCatInput.error = null;
    }
    questions[copycatfield] = copyCatInput;
    return null;
  };
};

// Runs on the duplicate password field.
export const getMasterMatchValidator = (masterfield: string) => {
  return (text: string | null, questions: { [key: string]: Question }) => {
    const masterInput = { ...questions[masterfield] };
    if (text !== masterInput.value) {
      return "Passwords must match";
    }
    questions[masterfield] = masterInput;
    return null;
  };
};

export const validateBoxChecked = (checked: string | null) => {
  if (checked === null) {
    return null;
  }
  if (checked === "false") {
    return "You must check this box to proceed.";
  }
  return null;
};

export const validateEmail = (text: string | null) => {
  if (!text) {
    return null;
  }
  const validationPattern = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
  const isValid = validationPattern.test(text);
  if (!isValid) {
    return "Invalid Email";
  }
  return null;
};

export const validateName = (text: string | null) => {
  if (!text) {
    return null;
  }
  if (text.length < 2) {
    return "Must be at least 2 characters.";
  }
  return null;
};

export const validatePasswordLength = (text: string | null) => {
  if (!text || text.length < 8) {
    return "At least 8 characters long";
  }
  // TODO: add other checks for password complexity.
  return null;
};

export const validateZipCode = (text: string | null) => {
  if (!text) {
    return null;
  }
  if (!postcodeValidator(text, "US")) {
    return "Enter a valid Zip Code";
  }
  return null;
};
