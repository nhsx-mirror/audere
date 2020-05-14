// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import "../../../style/sassStyle";

import { DummyEvent, QuestionnaireInputProps } from "./QuestionnaireTypes";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import React, { useCallback, useState } from "react";
import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";

import DateFnsUtils from "@date-io/date-fns";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import QuestionnaireStandardFormControl from "./QuestionnaireStandardFormControl";
import { parse as parseDate } from "date-fns";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    datePicker: {
      width: "max-content",
    },
  })
);

const dateFormat = "MM/dd/yyyy";

/**
 * Renders a date input in a questionaire.
 * You should not need to use this outside of the Questionnaire component.
 */
const QuestionnaireInputDate = (props: QuestionnaireInputProps) => {
  const { question, onChange } = props;
  const [selectedDate, setSelectedDate] = useState(
    question.value
      ? new Date(question.value)
      : question.placeholder === ""
      ? null
      : new Date(question.placeholder)
  );
  const classes = useStyles();

  if (question.type !== "date") {
    throw Error(
      `Invalid question type ${question.type} for QuestionnaireInputDate.`
    );
  }

  const onDateChanged = useCallback(
    (date: MaterialUiPickersDate, value?: string | null | undefined) => {
      if (!date || isNaN(date.getTime()) || !value) {
        // date invalid
        return;
      }

      const currentTime = new Date();
      const parsedValue = parseDate(value, dateFormat, new Date());
      parsedValue.setUTCHours(currentTime.getUTCHours());

      setSelectedDate(parsedValue);
      const event: DummyEvent = {
        currentTarget: {
          name: question.name,
          value: parsedValue.toISOString(),
        },
      };
      onChange(event);
    },
    [onChange, question.name]
  );

  return (
    <QuestionnaireStandardFormControl
      error={question.error}
      label={question.label}
      mandatory={question.mandatory}
    >
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          color="primary"
          className={classes.datePicker}
          disableToolbar
          variant="inline"
          format={dateFormat}
          margin="none"
          value={selectedDate}
          onChange={onDateChanged}
          KeyboardButtonProps={{
            "aria-label": "change date",
          }}
        />
      </MuiPickersUtilsProvider>
    </QuestionnaireStandardFormControl>
  );
};

export default QuestionnaireInputDate;
