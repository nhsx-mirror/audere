import React, { Component } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { connect } from "react-redux";
import { StoreState } from "../../../../store/index";
import {
  Action,
  SurveyAnswer,
  SurveyResponse,
  Address,
  setSurveyResponses,
} from "../../../../store";
import AddressInput from "./AddressInput";
import Button from "./Button";
import Description from "./Description";
import NumberInput from "./NumberInput";
import OptionList from "./OptionList";
import TextInput from "./TextInput";
import Title from "./Title";

type EnabledOption =
  | true
  | false
  | "withOption"
  | "withText"
  | "withAddress"
  | "withNumber"
  | "withDate";

interface ButtonConfig {
  label: string;
  primary: boolean;
  enabled: EnabledOption;
}

interface ConditionalNextConfig {
  options?: Map<string, string>;
  buttonLabels?: Map<string, string>;
}

interface OptionListConfig {
  options: string[];
  multiSelect: boolean;
  numColumns?: number;
}

interface TextInputConfig {
  placeholder: string;
}

interface NumberInputConfig {
  placeholder: string;
}

interface AddressInputConfig {
  showLocationField: boolean;
}

// TODO date input config

interface Props {
  id: string;
  active: boolean;
  addressInput: AddressInputConfig;
  buttons: ButtonConfig[];
  conditionalNext: ConditionalNextConfig;
  description: string;
  nextQuestion: string;
  numberInput: NumberInputConfig;
  title: string;
  textInput: TextInputConfig;
  optionList: OptionListConfig;
  surveyResponses?: Map<string, SurveyResponse>;
  dispatch(action: Action): void;
  onActivate(): void;
  onNext(nextQuestion: string): void;
}

@connect((state: StoreState) => ({
  surveyResponses: state.form!.surveyResponses,
}))
export default class SurveyQuestion extends Component<Props> {
  _getNextQuestion = (selectedButtonLabel: string): string => {
    let nextQuestion = this.props.nextQuestion;
    console.log("next question: " + nextQuestion);
    if (this.props.conditionalNext) {
      this.props.conditionalNext!.options &&
        this._getSelectedOptionMap().forEach((value, key) => {
          if (value && this.props.conditionalNext!.options!.has(key)) {
            nextQuestion = this.props.conditionalNext!.options!.get(key)!;
          }
        });
      !!this.props.conditionalNext!.buttonLabels &&
        this.props.conditionalNext!.buttonLabels!.forEach((question, label) => {
          if (label === selectedButtonLabel) {
            nextQuestion = question;
          }
        });
    }
    // TODO admin conditional next
    return nextQuestion;
  };

  _getSelectedOptionMap = (): Map<string, boolean> => {
    return !!this.props.surveyResponses &&
      this.props.surveyResponses!.has(this.props.id) &&
      !!this.props.surveyResponses!.get(this.props.id)!.answer &&
      !!this.props.surveyResponses!.get(this.props.id)!.answer!.options
      ? new Map<string, boolean>(
          this.props.surveyResponses.get(this.props.id)!.answer!.options!
        )
      : OptionList.emptyMap(this.props.optionList.options);
  };

  // TODO refactor this mess
  _getEnteredTextInput = (): string | null => {
    return (
      (this.props.surveyResponses &&
        this.props.surveyResponses!.has(this.props.id) &&
        this.props.surveyResponses.get(this.props.id)!.answer &&
        this.props.surveyResponses.get(this.props.id)!.answer!.textInput) ||
      null
    );
  };

  _getEnteredNumberInput = (): number | null => {
    return (
      (this.props.surveyResponses &&
        this.props.surveyResponses!.has(this.props.id) &&
        this.props.surveyResponses.get(this.props.id)!.answer &&
        this.props.surveyResponses.get(this.props.id)!.answer!.numberInput) ||
      null
    );
  };

  _getEnteredAddress = (): Address | null => {
    return (
      (this.props.surveyResponses &&
        this.props.surveyResponses!.has(this.props.id) &&
        this.props.surveyResponses.get(this.props.id)!.answer &&
        this.props.surveyResponses.get(this.props.id)!.answer!.addressInput) ||
      null
    );
  };

  _getSelectedButtonLabel = (): string | null => {
    return (
      (this.props.surveyResponses &&
        this.props.surveyResponses!.has(this.props.id) &&
        this.props.surveyResponses.get(this.props.id)!.answer &&
        this.props.surveyResponses.get(this.props.id)!.answer!
          .selectedButtonLabel) ||
      null
    );
  };

  _getAndInitializeResponse = (): [
    Map<string, SurveyResponse>,
    SurveyAnswer
  ] => {
    const responses = this.props.surveyResponses
      ? new Map<string, SurveyResponse>(this.props.surveyResponses)
      : new Map<string, SurveyResponse>();

    const existingAnswer = responses.has(this.props.id)
      ? responses.get(this.props.id)!.answer
      : {};

    if (!this.props.surveyResponses || !existingAnswer) {
      responses.set(this.props.id, {
        questionId: this.props.id,
        questionText: this.props.title || this.props.description,
      });
      this.props.dispatch(setSurveyResponses(responses));
    }
    return [responses, existingAnswer ? existingAnswer : {}];
  };

  _getButtonEnabled = (enabledStatus: EnabledOption): boolean => {
    if (enabledStatus === "withOption") {
      return Array.from(this._getSelectedOptionMap().values()).reduce(
        (val, entry) => val || entry
      );
    } else if (enabledStatus === "withText") {
      return !!this._getEnteredTextInput();
    } else if (enabledStatus === "withNumber") {
      return !!this._getEnteredNumberInput();
    } else if (enabledStatus === "withAddress") {
      // TODO check if address provided
      return true;
    } else if (enabledStatus === "withDate") {
      // TODO: check if date provided
      return true;
    }
    return !!enabledStatus;
  };

  render() {
    // TODO date input
    // TODO address input

    return (
      <View style={[styles.card, !this.props.active && styles.inactive]}>
        {!this.props.active && (
          <TouchableOpacity
            style={styles.overlay}
            onPress={() => {
              this.props.onActivate();
            }}
          />
        )}
        <Title label={this.props.title} size="small" />
        {this.props.description && (
          <Description content={this.props.description} />
        )}
        {this.props.textInput && (
          <TextInput
            autoFocus={true}
            placeholder={this.props.textInput!.placeholder}
            returnKeyType="done"
            value={this._getEnteredTextInput()}
            onChange={text => {
              const [
                responses,
                existingAnswer,
              ] = this._getAndInitializeResponse();
              responses.set(this.props.id, {
                ...responses.get(this.props.id),
                answer: { ...existingAnswer, textInput: text },
              });
              this.props.dispatch(setSurveyResponses(responses));
            }}
          />
        )}
        {this.props.addressInput && (
          <AddressInput
            autoFocus={true}
            showLocationField={this.props.addressInput!.showLocationField}
            value={
              this._getEnteredAddress() ? this._getEnteredAddress() : undefined
            }
            onChange={address => {
              const [
                responses,
                existingAnswer,
              ] = this._getAndInitializeResponse();
              responses.set(this.props.id, {
                ...responses.get(this.props.id),
                answer: { ...existingAnswer, addressInput: address },
              });
              this.props.dispatch(setSurveyResponses(responses));
            }}
          />
        )}
        {this.props.numberInput && (
          <NumberInput
            autoFocus={true}
            placeholder={this.props.numberInput!.placeholder}
            returnKeyType="done"
            value={
              this._getEnteredNumberInput()
                ? "" + this._getEnteredNumberInput()
                : undefined
            }
            onChange={(text: string) => {
              const [
                responses,
                existingAnswer,
              ] = this._getAndInitializeResponse();
              responses.set(this.props.id, {
                ...responses.get(this.props.id),
                answer: { ...existingAnswer, numberInput: parseInt(text) },
              });
              this.props.dispatch(setSurveyResponses(responses));
            }}
            onSubmit={() => {}}
          />
        )}

        {this.props.optionList && (
          <OptionList
            data={this._getSelectedOptionMap()}
            multiSelect={this.props.optionList.multiSelect}
            numColumns={this.props.optionList.numColumns || 1}
            onChange={data => {
              const [
                responses,
                existingAnswer,
              ] = this._getAndInitializeResponse();
              responses.set(this.props.id, {
                ...responses.get(this.props.id),
                answer: { ...existingAnswer, options: data },
              });
              this.props.dispatch(setSurveyResponses(responses));
            }}
          />
        )}
        <View style={styles.buttonContainer}>
          {this.props.buttons.map(button => (
            <Button
              checked={this._getSelectedButtonLabel() === button.label}
              enabled={
                this.props.active && this._getButtonEnabled(button.enabled)
              }
              key={button.label}
              label={button.label}
              onPress={() => {
                const [
                  responses,
                  existingAnswer,
                ] = this._getAndInitializeResponse();
                responses.set(this.props.id, {
                  ...responses.get(this.props.id),
                  answer: {
                    ...existingAnswer,
                    selectedButtonLabel: button.label,
                  },
                });
                this.props.dispatch(setSurveyResponses(responses));
                this.props.onNext(this._getNextQuestion(button.label));
              }}
              primary={button.primary}
            />
          ))}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
  },
  buttonContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
  },
  inactive: {
    opacity: 0.25,
  },
  overlay: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 2,
  },
});
