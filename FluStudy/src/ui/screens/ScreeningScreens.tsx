// Copyright (c) 2018 by Audere
//
// Use of this source code is governed by an MIT-style license that
// can be found in the LICENSE file distributed with this file.

import React from "react";
import {
  Alert,
  KeyboardAvoidingView,
  PushNotificationIOS,
  View,
  StyleSheet,
} from "react-native";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { WithNamespaces, withNamespaces } from "react-i18next";
import KeyboardListener from "react-native-keyboard-listener";
import CheckBox from "react-native-check-box";
import {
  EventInfoKind,
  PushNotificationState,
  PushRegistrationError,
} from "audere-lib/feverProtocol";
import {
  Action,
  Address,
  Option,
  StoreState,
  SurveyResponse,
  appendEvent,
  setEmail,
  setPushNotificationState,
} from "../../store";
import {
  AddressConfig,
  AgeBuckets,
  AgeConfig,
  ButtonConfig,
  ConsentConfig,
  SymptomsConfig,
} from "../../resources/ScreenConfig";
import reduxWriter, { ReduxWriterProps } from "../../store/ReduxWriter";
import AddressInput from "../components/AddressInput";
import Button from "../components/Button";
import ButtonRow from "../components/ButtonRow";
import EmailInput from "../components/EmailInput";
import Screen from "../components/Screen";
import Links from "../components/Links";
import OptionList, { newSelectedOptionsList } from "../components/OptionList";
import Text from "../components/Text";
import {
  BORDER_COLOR,
  ERROR_COLOR,
  GUTTER,
  SECONDARY_COLOR,
  SMALL_TEXT,
} from "../styles";

interface Props {
  dispatch(action: Action): void;
  navigation: NavigationScreenProp<any, any>;
}

@connect()
class WelcomeScreen extends React.Component<Props & WithNamespaces> {
  render() {
    const { t } = this.props;
    return (
      <Screen
        canProceed={true}
        desc={t("description")}
        imageSrc={require("../../img/welcome.png")}
        logo={true}
        navBar={false}
        navigation={this.props.navigation}
        title={t("welcome")}
        onNext={() => {
          this.props.dispatch(
            appendEvent(EventInfoKind.Screening, "StartedScreening")
          );
          this.props.navigation.push("Why");
        }}
      />
    );
  }
}
const Welcome = withNamespaces("welcomeScreen")<Props>(WelcomeScreen);

class WhyScreen extends React.Component<Props & WithNamespaces> {
  render() {
    const { t } = this.props;
    return (
      <Screen
        canProceed={true}
        desc={t("description")}
        imageSrc={require("../../img/why.png")}
        logo={true}
        navBar={false}
        navigation={this.props.navigation}
        title={t("why")}
        onNext={() => {
          this.props.navigation.push("What");
        }}
      />
    );
  }
}
const Why = withNamespaces("whyScreen")<Props>(WhyScreen);

class WhatScreen extends React.Component<Props & WithNamespaces> {
  render() {
    const { t } = this.props;
    return (
      <Screen
        canProceed={true}
        desc={t("description")}
        imageSrc={require("../../img/what.png")}
        logo={true}
        navBar={false}
        navigation={this.props.navigation}
        title={t("what")}
        onNext={() => {
          this.props.navigation.push("Age");
        }}
      />
    );
  }
}
const What = withNamespaces("whatScreen")<Props>(WhatScreen);

class AgeScreen extends React.Component<
  Props & WithNamespaces & ReduxWriterProps
> {
  _onNext = () => {
    if (
      this.props.getAnswer("selectedButtonKey", AgeConfig.id) ===
      AgeBuckets.Under18
    ) {
      this.props.navigation.push("AgeIneligible");
    } else {
      this.props.navigation.push("Symptoms");
    }
  };

  render() {
    const { t } = this.props;
    return (
      <Screen
        canProceed={!!this.props.getAnswer("selectedButtonKey", AgeConfig.id)}
        logo={false}
        navBar={true}
        navigation={this.props.navigation}
        skipButton={true}
        step={1}
        title={t("surveyTitle:" + AgeConfig.title)}
        onNext={this._onNext}
      >
        {AgeConfig.buttons.map((button: ButtonConfig) => (
          <Button
            checked={
              this.props.getAnswer("selectedButtonKey", AgeConfig.id) ===
              button.key
            }
            enabled={true}
            key={button.key}
            label={t("surveyButton:" + button.key)}
            primary={button.primary}
            style={{ marginVertical: GUTTER }}
            onPress={() => {
              this.props.updateAnswer(
                { selectedButtonKey: button.key },
                AgeConfig
              );
              this._onNext();
            }}
          />
        ))}
      </Screen>
    );
  }
}
const Age = reduxWriter(withNamespaces("ageScreen")(AgeScreen));

class SymptomsScreen extends React.PureComponent<
  Props & WithNamespaces & ReduxWriterProps
> {
  _onNext = () => {
    this.props.updateAnswer({ selectedButtonKey: "next" }, SymptomsConfig);
    const { t } = this.props;
    if (this._numSymptoms() > 1 && this._haveCough()) {
      Alert.alert(t("thankYou"), t("nextStep"), [
        {
          text: t("noThanks"),
          onPress: () => {
            this.props.navigation.push("ConsentIneligible");
          },
        },
        {
          text: t("viewConsent"),
          onPress: () => {
            this.props.navigation.push("Consent");
          },
        },
      ]);
    } else {
      Alert.alert(t("areYouSure"), t("minSymptoms"), [
        {
          text: t("common:button:cancel"),
          onPress: () => {},
        },
        {
          text: t("common:button:continue"),
          onPress: () => {
            this.props.navigation.push("SymptomsIneligible");
          },
        },
      ]);
    }
  };

  _haveOption = () => {
    const symptoms: Option[] = this.props.getAnswer(
      "options",
      SymptomsConfig.id
    );
    return symptoms
      ? symptoms.reduce(
          (result: boolean, option: Option) => result || option.selected,
          false
        )
      : false;
  };

  _numSymptoms = () => {
    const symptoms: Option[] = this.props.getAnswer(
      "options",
      SymptomsConfig.id
    );
    return symptoms
      ? symptoms.reduce(
          (count: number, option: Option) =>
            option.selected && option.key !== "noneOfTheAbove"
              ? count + 1
              : count,
          0
        )
      : 0;
  };

  _haveCough = () => {
    const symptoms: Option[] = this.props.getAnswer(
      "options",
      SymptomsConfig.id
    );
    return symptoms
      ? symptoms.reduce(
          (result: boolean, option: Option) =>
            option.selected && option.key === "cough" ? true : result,
          false
        )
      : false;
  };

  render() {
    const { t } = this.props;
    return (
      <Screen
        canProceed={this._haveOption()}
        centerDesc={true}
        desc={t("surveyDescription:" + SymptomsConfig.description!.label)}
        logo={false}
        navBar={true}
        navigation={this.props.navigation}
        step={2}
        title={t("surveyTitle:" + SymptomsConfig.title)}
        onNext={this._onNext}
      >
        <OptionList
          data={newSelectedOptionsList(
            SymptomsConfig.optionList!.options,
            this.props.getAnswer("options", SymptomsConfig.id)
          )}
          multiSelect={true}
          numColumns={1}
          exclusiveOption="noneOfTheAbove"
          onChange={symptoms =>
            this.props.updateAnswer({ options: symptoms }, SymptomsConfig)
          }
        />
      </Screen>
    );
  }
}
const Symptoms = reduxWriter(withNamespaces("symptomsScreen")(SymptomsScreen));

interface ConsentProps {
  email?: string;
}

interface ConsentState {
  email?: string;
  keyboardOpen?: boolean;
  validEmail: boolean;
}

@connect((state: StoreState) => ({
  email: state.survey.email,
}))
class ConsentScreen extends React.PureComponent<
  Props & ConsentProps & WithNamespaces & ReduxWriterProps,
  ConsentState
> {
  constructor(props: Props & ConsentProps & WithNamespaces & ReduxWriterProps) {
    super(props);
    this.state = {
      email: props.email,
      keyboardOpen: true,
      validEmail: !!props.email,
    };
  }

  _canProceed = (): boolean => {
    return (
      !this.props.getAnswer("booleanInput", ConsentConfig.id) ||
      (!!this.state.email && this.state.validEmail)
    );
  };

  _onNext = () => {
    const { t } = this.props;
    if (this.props.getAnswer("booleanInput", ConsentConfig.id)) {
      this.props.dispatch(setEmail(this.state.email!));
    }
    this.props.navigation.push("Address");
  };

  render() {
    const { t } = this.props;
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" enabled>
        <KeyboardListener
          onWillShow={() => {
            this.setState({ keyboardOpen: true });
          }}
          onWillHide={() => {
            this.setState({ keyboardOpen: false });
          }}
        />
        <Screen
          canProceed={this._canProceed()}
          navBar={true}
          navigation={this.props.navigation}
          skipButton={true}
          step={3}
          title={t("consent")}
          onNext={this._onNext}
        >
          <Text
            center={true}
            content={t("consentFormHeader")}
            style={{ fontSize: SMALL_TEXT }}
          />
          <Text
            content={t("consentFormText")}
            style={{ fontSize: SMALL_TEXT }}
          />
          <CheckBox
            isChecked={!!this.props.getAnswer("booleanInput", ConsentConfig.id)}
            rightTextView={
              <Text
                content={t("surveyTitle:" + ConsentConfig.title)}
                style={{ paddingLeft: GUTTER / 4 }}
              />
            }
            style={{ alignSelf: "stretch", marginVertical: GUTTER }}
            onClick={() => {
              this.props.updateAnswer(
                {
                  booleanInput: !this.props.getAnswer(
                    "booleanInput",
                    ConsentConfig.id
                  ),
                },
                ConsentConfig
              );
            }}
          />
          {!!this.props.getAnswer("booleanInput", ConsentConfig.id) && (
            <EmailInput
              autoFocus={true}
              placeholder={t("emailAddress")}
              returnKeyType="next"
              validationError={t("validationError")}
              value={this.state.email}
              onChange={(email, validEmail) =>
                this.setState({ email, validEmail })
              }
              onSubmit={validEmail => this.setState({ validEmail })}
            />
          )}
          <ButtonRow
            firstLabel={t("noThanks")}
            firstOnPress={() => {
              this.props.navigation.push("ConsentIneligible");
            }}
            secondEnabled={this._canProceed()}
            secondLabel={t("accept")}
            secondOnPress={this._onNext}
          />
        </Screen>
      </KeyboardAvoidingView>
    );
  }
}
const Consent = reduxWriter(withNamespaces("consentScreen")(ConsentScreen));

class ConsentIneligibleScreen extends React.Component<Props & WithNamespaces> {
  render() {
    const { t } = this.props;
    return (
      <Screen
        canProceed={false}
        footer={
          <Button
            enabled={true}
            primary={true}
            label={t("back")}
            onPress={() => this.props.navigation.pop()}
          />
        }
        imageSrc={require("../../img/consentIneligible.png")}
        logo={true}
        navBar={true}
        navigation={this.props.navigation}
        skipButton={true}
        title={t("ineligible")}
        desc={t("description")}
        onNext={() => {}}
      />
    );
  }
}
const ConsentIneligible = withNamespaces("consentIneligibleScreen")<Props>(
  ConsentIneligibleScreen
);

interface AddressProps {
  name: string;
}

interface AddressState {
  address?: Address;
}

@connect()
class AddressInputScreen extends React.Component<
  Props & AddressProps & WithNamespaces & ReduxWriterProps,
  AddressState
> {
  constructor(props: Props & AddressProps & WithNamespaces & ReduxWriterProps) {
    super(props);
    this.state = {
      address: props.getAnswer("addressInput", AddressConfig.id),
    };
  }

  _onNext = () => {
    if (this._haveValidAddress) {
      this.props.updateAnswer(
        { addressInput: this.state.address },
        AddressConfig
      );
      this.props.navigation.push("Confirmation");
    }
  };

  _haveValidAddress = (): boolean => {
    const address = this.state.address;
    return (
      !!address &&
      !!address.name &&
      !!address.address &&
      !!address.city &&
      !!address.state &&
      !!address.zipcode
    );
  };

  render() {
    const { t } = this.props;
    return (
      <Screen
        buttonLabel={t("common:button:submit")}
        canProceed={this._haveValidAddress()}
        centerDesc={true}
        desc={t("surveyDescription:" + AddressConfig.description!.label)}
        logo={false}
        navBar={true}
        navigation={this.props.navigation}
        step={4}
        title={t("surveyTitle:" + AddressConfig.title)}
        onNext={this._onNext}
      >
        <AddressInput
          value={this.state.address}
          onChange={(address: Address) => this.setState({ address })}
        />
      </Screen>
    );
  }
}
const AddressScreen = reduxWriter(withNamespaces()(AddressInputScreen));

class AgeIneligibleScreen extends React.Component<Props & WithNamespaces> {
  render() {
    const { t } = this.props;
    return (
      <Screen
        canProceed={false}
        desc={t("description")}
        imageSrc={require("../../img/ineligible.png")}
        logo={true}
        navBar={false}
        navigation={this.props.navigation}
        skipButton={true}
        title={t("ineligible")}
        onNext={() => this.props.navigation.popToTop()}
      >
        <Links
          links={[
            {
              label: t("links:shareLink"),
              onPress: () => {
                Alert.alert("Hello", "Waiting on content", [
                  { text: "Ok", onPress: () => {} },
                ]);
              },
            },
            {
              label: t("links:learnLink"),
              onPress: () => {
                Alert.alert("Hello", "Waiting on content", [
                  { text: "Ok", onPress: () => {} },
                ]);
              },
            },
            {
              label: t("links:medLink"),
              onPress: () => {
                Alert.alert("Hello", "Waiting on content", [
                  { text: "Ok", onPress: () => {} },
                ]);
              },
            },
          ]}
        />
      </Screen>
    );
  }
}
const AgeIneligible = withNamespaces("ageIneligibleScreen")<Props>(
  AgeIneligibleScreen
);

class SymptomsIneligibleScreen extends React.Component<Props & WithNamespaces> {
  render() {
    const { t } = this.props;
    return (
      <Screen
        canProceed={false}
        desc={t("description")}
        imageSrc={require("../../img/ineligible.png")}
        logo={true}
        navBar={false}
        navigation={this.props.navigation}
        skipButton={true}
        title={t("ineligible")}
        onNext={() => this.props.navigation.popToTop()}
      >
        <Links
          links={[
            {
              label: t("links:shareLink"),
              onPress: () => {
                Alert.alert("Hello", "Waiting on content", [
                  { text: "Ok", onPress: () => {} },
                ]);
              },
            },
            {
              label: t("links:learnLink"),
              onPress: () => {
                Alert.alert("Hello", "Waiting on content", [
                  { text: "Ok", onPress: () => {} },
                ]);
              },
            },
            {
              label: t("links:medLink"),
              onPress: () => {
                Alert.alert("Hello", "Waiting on content", [
                  { text: "Ok", onPress: () => {} },
                ]);
              },
            },
          ]}
        />
        <Text
          content={t("disclaimer")}
          style={{
            alignSelf: "stretch",
            color: SECONDARY_COLOR,
            marginBottom: GUTTER,
          }}
        />
      </Screen>
    );
  }
}
const SymptomsIneligible = withNamespaces("symptomsIneligibleScreen")<Props>(
  SymptomsIneligibleScreen
);

interface PushProps {
  pushState: PushNotificationState;
}

@connect((state: StoreState) => ({
  pushState: state.survey.pushState,
}))
class ConfirmationScreen extends React.Component<
  Props & PushProps & WithNamespaces
> {
  render() {
    const { t } = this.props;
    return (
      <Screen
        canProceed={true}
        desc={t("description")}
        imageSrc={require("../../img/confirmation.png")}
        logo={true}
        navBar={true}
        navigation={this.props.navigation}
        title={t("confirmed")}
        onNext={() => {
          if (this.props.pushState.showedSystemPrompt) {
            this.props.navigation.push("ExtraInfo");
          } else {
            this.props.navigation.push("PushNotifications");
          }
        }}
      />
    );
  }
}
const Confirmation = withNamespaces("confirmationScreen")<Props & PushProps>(
  ConfirmationScreen
);

@connect((state: StoreState) => ({
  pushState: state.survey.pushState,
}))
class PushNotificationsScreen extends React.Component<
  Props & PushProps & WithNamespaces
> {
  _registrationEvent = (token: string) => {
    const newPushState = { ...this.props.pushState, token };
    this.props.dispatch(setPushNotificationState(newPushState));
    this.props.navigation.push("ExtraInfo");
  };

  _registrationErrorEvent = (result: PushRegistrationError) => {
    const newPushState = { ...this.props.pushState, registrationError: result };
    this.props.dispatch(setPushNotificationState(newPushState));
    this.props.navigation.push("ExtraInfo");
  };

  componentWillMount() {
    PushNotificationIOS.addEventListener("register", this._registrationEvent);
    PushNotificationIOS.addEventListener(
      "registrationError",
      this._registrationErrorEvent
    );
  }

  componentWillUnmount() {
    PushNotificationIOS.removeEventListener(
      "register",
      this._registrationEvent
    );
    PushNotificationIOS.removeEventListener(
      "registrationError",
      this._registrationErrorEvent
    );
  }

  render() {
    const { t } = this.props;
    return (
      <Screen
        canProceed={false}
        desc={t("description")}
        footer={
          <ButtonRow
            firstLabel={t("common:button:no")}
            firstOnPress={() => {
              const newPushState = {
                ...this.props.pushState,
                softResponse: false,
              };
              this.props.dispatch(setPushNotificationState(newPushState));
              this.props.navigation.push("ExtraInfo");
            }}
            secondEnabled={true}
            secondLabel={t("common:button:yes")}
            secondOnPress={() => {
              if (this.props.pushState.showedSystemPrompt) {
                this.props.navigation.push("ExtraInfo");
              } else {
                const newPushState = {
                  ...this.props.pushState,
                  softResponse: true,
                  showedSystemPrompt: true,
                };
                this.props.dispatch(setPushNotificationState(newPushState));
                PushNotificationIOS.requestPermissions();
              }
            }}
          />
        }
        imageSrc={require("../../img/pushNotifications.png")}
        logo={true}
        navBar={true}
        navigation={this.props.navigation}
        skipButton={true}
        title={t("pushNotifications")}
        onNext={() => {}}
      />
    );
  }
}
const PushNotifications = withNamespaces("pushNotificationsScreen")<
  Props & PushProps
>(PushNotificationsScreen);

class InstructionsScreen extends React.Component<Props & WithNamespaces> {
  render() {
    const { t } = this.props;
    return (
      <Screen
        canProceed={false}
        desc={t("description")}
        imageSrc={require("../../img/instructions.png")}
        logo={true}
        navBar={true}
        navigation={this.props.navigation}
        skipButton={true}
        title={t("instructions")}
        onNext={() => {}}
      />
    );
  }
}
const Instructions = withNamespaces("instructionsScreen")<Props>(
  InstructionsScreen
);

class ExtraInfoScreen extends React.Component<Props & WithNamespaces> {
  render() {
    const { t } = this.props;
    return (
      <Screen
        canProceed={true}
        imageSrc={require("../../img/extraInfo.png")}
        logo={true}
        navBar={true}
        navigation={this.props.navigation}
        title={t("extraInfo")}
        onNext={() => {
          this.props.navigation.push("Instructions");
        }}
      >
        <Links
          links={[
            {
              label: t("links:shareLink"),
              onPress: () => {
                Alert.alert("Hello", "Waiting on content", [
                  { text: "Ok", onPress: () => {} },
                ]);
              },
            },
            {
              label: t("links:learnLink"),
              onPress: () => {
                Alert.alert("Hello", "Waiting on content", [
                  { text: "Ok", onPress: () => {} },
                ]);
              },
            },
            {
              label: t("links:medLink"),
              onPress: () => {
                Alert.alert("Hello", "Waiting on content", [
                  { text: "Ok", onPress: () => {} },
                ]);
              },
            },
          ]}
        />
      </Screen>
    );
  }
}
const ExtraInfo = withNamespaces("extraInfoScreen")<Props>(ExtraInfoScreen);

export {
  Welcome,
  Why,
  What,
  Age,
  Symptoms,
  AddressScreen,
  AgeIneligible,
  SymptomsIneligible,
  Consent,
  ConsentIneligible,
  Confirmation,
  PushNotifications,
  Instructions,
  ExtraInfo,
};
