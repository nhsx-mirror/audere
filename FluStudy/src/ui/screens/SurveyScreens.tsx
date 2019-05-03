// Copyright (c) 2019 by Audere
//
// Use of this source code is governed by an MIT-style license that
// can be found in the LICENSE file distributed with this file.

import React, { Fragment } from "react";
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { WithNamespaces, withNamespaces } from "react-i18next";
import { BarCodeScanner, Camera, Permissions } from "expo";
import Spinner from "react-native-loading-spinner-overlay";
import DeviceInfo from "react-native-device-info";
import { SampleInfo, WorkflowInfo } from "audere-lib/feverProtocol";
import {
  Action,
  Option,
  StoreState,
  appendInvalidBarcode,
  setKitBarcode,
  setTestStripImg,
  setOneMinuteStartTime,
  setTenMinuteStartTime,
  setSupportCode,
  setWorkflow,
  toggleSupportCodeModal,
  uploader,
} from "../../store";
import {
  WhenSymptomsScreenConfig,
  WhatSymptomsConfig,
  GeneralExposureScreenConfig,
  GeneralHealthScreenConfig,
  BlueLineConfig,
  RedWhenBlueConfig,
  RedLineConfig,
  FirstTestFeedbackConfig,
  SecondTestFeedbackConfig,
  OptInForMessagesConfig,
} from "../../resources/ScreenConfig";
import reduxWriter, { ReduxWriterProps } from "../../store/ReduxWriter";
import timerWithConfigProps, { TimerProps } from "../components/Timer";
import { newCSRUID } from "../../util/csruid";
import BorderView from "../components/BorderView";
import BulletPoint from "../components/BulletPoint";
import Button from "../components/Button";
import ButtonGrid from "../components/ButtonGrid";
import Chrome from "../components/Chrome";
import DigitInput from "../components/DigitInput";
import Links from "../components/Links";
import Modal from "../components/Modal";
import OptionList, { newSelectedOptionsList } from "../components/OptionList";
import Screen from "../components/Screen";
import Text from "../components/Text";
import TextInput from "../components/TextInput";
import { scheduleUSPSPickUp } from "../externalActions";
import {
  invalidBarcodeShapeAlert,
  validBarcodeShape,
  verifiedBarcode,
  verifiedSupportCode,
  unverifiedBarcodeAlert,
} from "../../util/barcodeVerification";
import {
  ASPECT_RATIO,
  BORDER_RADIUS,
  BUTTON_WIDTH,
  ERROR_COLOR,
  GUTTER,
  KEYBOARD_BEHAVIOR,
  LARGE_TEXT,
  EXTRA_SMALL_TEXT,
  SECONDARY_COLOR,
  SMALL_TEXT,
  SYSTEM_PADDING_BOTTOM,
} from "../styles";
import { DEVICE_INFO } from "../../transport/DeviceInfo";
import { tracker, FunnelEvents } from "../../util/tracker";
import RadioGrid from "../components/RadioGrid";

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const TEST_STRIP_MS = 10 * MINUTE_MS;

const BARCODE_PREFIX = "KIT "; // Space intentional. Hardcoded, because never translated.

interface Props {
  dispatch(action: Action): void;
  navigation: NavigationScreenProp<any, any>;
}

interface WorkflowProps {
  workflow: WorkflowInfo;
}

interface ConnectedProps {
  isConnected: boolean;
}

@connect((state: StoreState) => ({
  workflow: state.survey.workflow,
}))
class WelcomeBackScreen extends React.Component<
  Props & WorkflowProps & WithNamespaces
> {
  componentDidMount() {
    tracker.logEvent(FunnelEvents.RECEIVED_KIT);
  }

  _onBack = () => {
    this.props.dispatch(
      setWorkflow({
        ...this.props.workflow,
        skippedScreeningAt: undefined,
      })
    );

    this.props.navigation.pop();
  };

  _onNext = () => {
    if (!!this.props.workflow.skippedScreeningAt) {
      this.props.navigation.push("Age");
    } else {
      this.props.navigation.push("WhatsNext");
    }
  };

  render() {
    const { t } = this.props;
    return (
      <Screen
        canProceed={true}
        desc={t("description")}
        hideBackButton={!this.props.workflow.skippedScreeningAt}
        image="howtestworks_1"
        navigation={this.props.navigation}
        title={t("welcomeBack")}
        onBack={this._onBack}
        onNext={this._onNext}
      >
        {t("bullets")
          .split("\n")
          .map((bullet: string, index: number) => {
            return <BulletPoint key={`bullet-${index}`} content={bullet} />;
          })}
      </Screen>
    );
  }
}
export const WelcomeBack = withNamespaces("welcomeBackScreen")(
  WelcomeBackScreen
);

class ScanInstructionsScreen extends React.Component<Props & WithNamespaces> {
  constructor(props: Props & WithNamespaces) {
    super(props);
    this._onNext = this._onNext.bind(this);
  }

  async _onNext() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    if (status === "granted") {
      this.props.navigation.push("Scan");
    } else {
      this.props.navigation.push("ManualEntry");
    }
  }

  render() {
    const { t } = this.props;
    return (
      <Screen
        buttonLabel={t("okScan")}
        canProceed={true}
        desc={t("description", {
          device: t("common:device:" + DEVICE_INFO.idiomText),
        })}
        footer={<Links center={true} links={["inputManually"]} />}
        image="barcodeonbox"
        navigation={this.props.navigation}
        title={t("scanQrCode")}
        onNext={this._onNext}
      >
        <Text content={t("tips")} style={{ marginBottom: GUTTER / 2 }} />
      </Screen>
    );
  }
}
export const ScanInstructions = withNamespaces("scanInstructionsScreen")(
  ScanInstructionsScreen
);

interface InvalidBarcodeProps {
  invalidBarcodes: SampleInfo[];
}

@connect((state: StoreState) => ({
  invalidBarcodes: state.survey.invalidBarcodes,
  isDemo: state.meta.isDemo,
  workflow: state.survey.workflow,
}))
class ScanScreen extends React.Component<
  DemoModeProps & Props & InvalidBarcodeProps & WorkflowProps & WithNamespaces
> {
  state = {
    activeScan: false,
  };

  _willFocus: any;
  _willBlur: any;
  _timer: NodeJS.Timeout | null | undefined;

  componentDidMount() {
    this._willFocus = this.props.navigation.addListener("willFocus", () =>
      this._setTimer()
    );
    this._willBlur = this.props.navigation.addListener("willBlur", () =>
      this._clearTimer()
    );
  }

  componentWillUnmount() {
    this._willFocus.remove();
    this._willBlur.remove();
  }

  _setTimer() {
    this.setState({ activeScan: false });
    // Timeout after 30 seconds
    this._clearTimer();
    this._timer = setTimeout(() => {
      if (this.props.navigation.isFocused()) {
        this.props.navigation.push("ManualEntry");
      }
    }, 30000);
  }

  _clearTimer() {
    if (this._timer != null) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }

  _onBarCodeScanned = async ({ type, data }: { type: any; data: string }) => {
    const { t } = this.props;
    const barcode = data.toLowerCase();

    if (!this.state.activeScan) {
      this.setState({ activeScan: true });
      if (!validBarcodeShape(barcode)) {
        invalidBarcodeShapeAlert(barcode, this._setTimer);
      } else {
        const serverVerifiedBarcode = await verifiedBarcode(barcode);
        if (!serverVerifiedBarcode) {
          const priorUnverifiedAttempts = !!this.props.invalidBarcodes
            ? this.props.invalidBarcodes.length
            : 0;
          this.props.dispatch(
            appendInvalidBarcode({
              sample_type: type,
              code: barcode,
            })
          );
          if (priorUnverifiedAttempts > 2) {
            this.props.navigation.push("BarcodeContactSupport");
          } else {
            unverifiedBarcodeAlert(t("scan"), this._setTimer);
          }
        } else {
          this.props.dispatch(
            setKitBarcode({
              sample_type: type,
              code: barcode,
            })
          );
          this.props.dispatch(
            setWorkflow({
              ...this.props.workflow,
              surveyStartedAt: new Date().toISOString(),
            })
          );
          this.props.navigation.push("ScanConfirmation");
        }
      }
    }
  };

  _onManualEntry = () => {
    this.props.navigation.push("ManualEntry");
  };

  render() {
    const { t } = this.props;
    return (
      <Chrome isDemo={this.props.isDemo} navigation={this.props.navigation}>
        <View style={{ flex: 1 }}>
          <BarCodeScanner
            style={{ flex: 1, alignSelf: "stretch" }}
            onBarCodeScanned={this._onBarCodeScanned}
          />
          <View style={scanStyles.overlayContainer}>
            <View style={scanStyles.targetBox} />
            <TouchableOpacity
              style={scanStyles.overlay}
              onPress={this._onManualEntry}
            >
              <Text
                center={true}
                content={t("enterManually")}
                style={scanStyles.overlayText}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Chrome>
    );
  }
}
const scanStyles = StyleSheet.create({
  overlayText: {
    color: "white",
    textDecorationLine: "underline",
  },
  overlay: {
    alignItems: "center",
    height: 50,
    justifyContent: "center",
    marginTop: 50,
    width: 300,
  },
  overlayContainer: {
    alignItems: "center",
    backgroundColor: "transparent",
    height: Dimensions.get("window").height,
    left: -GUTTER,
    justifyContent: "center",
    position: "absolute",
    top: 0,
    width: Dimensions.get("window").width,
  },
  targetBox: {
    borderColor: "#F5A623",
    borderRadius: 2,
    borderWidth: 4,
    height: 250,
    width: 250,
  },
});
export const Scan = withNamespaces("scanScreen")(ScanScreen);

interface BarcodeProps {
  kitBarcode: SampleInfo;
}

@connect((state: StoreState) => ({
  kitBarcode: state.survey.kitBarcode,
}))
class ScanConfirmationScreen extends React.Component<
  Props & BarcodeProps & WithNamespaces
> {
  componentDidMount() {
    tracker.logEvent(FunnelEvents.SCAN_CONFIRMATION);
  }

  _onNext = () => {
    this.props.navigation.push("Unpacking");
  };

  render() {
    const { t } = this.props;
    return (
      <Screen
        canProceed={true}
        image="barcodesuccess"
        navigation={this.props.navigation}
        title={t("codeSent")}
        onNext={this._onNext}
      >
        {!!this.props.kitBarcode && (
          <BorderView style={{ marginTop: GUTTER }}>
            <Text
              center={true}
              content={t("yourCode") + this.props.kitBarcode.code}
            />
          </BorderView>
        )}
        <Text content={t("description")} style={{ marginVertical: GUTTER }} />
      </Screen>
    );
  }
}
export const ScanConfirmation = withNamespaces("scanConfirmationScreen")(
  ScanConfirmationScreen
);

export const ManualConfirmation = withNamespaces("manualConfirmationScreen")(
  ScanConfirmationScreen
);

interface SupportCodeProps {
  supportCode?: string;
}

interface ManualState {
  barcode1: string | null;
  barcode2: string | null;
}

@connect((state: StoreState) => ({
  invalidBarcodes: state.survey.invalidBarcodes,
  kitBarcode: state.survey.kitBarcode,
  supportCode: state.survey.supportCode,
  workflow: state.survey.workflow,
}))
class ManualEntryScreen extends React.Component<
  Props &
    InvalidBarcodeProps &
    SupportCodeProps &
    BarcodeProps &
    WorkflowProps &
    WithNamespaces,
  ManualState
> {
  constructor(
    props: Props &
      InvalidBarcodeProps &
      SupportCodeProps &
      BarcodeProps &
      WorkflowProps &
      WithNamespaces
  ) {
    super(props);
    this.state = {
      barcode1: !!props.kitBarcode ? props.kitBarcode.code.toLowerCase() : null,
      barcode2: !!props.kitBarcode ? props.kitBarcode.code.toLowerCase() : null,
    };
  }

  confirmInput = React.createRef<TextInput>();

  _matchingBarcodes = () => {
    return (
      this.state.barcode1 != null &&
      this.state.barcode2 != null &&
      this.state.barcode1.trim() === this.state.barcode2.trim()
    );
  };

  _onSave = () => {
    this.props.dispatch(
      setKitBarcode({
        sample_type: "manualEntry",
        code: this.state.barcode1!.trim(),
      })
    );
    this.props.dispatch(
      setWorkflow({
        ...this.props.workflow,
        surveyStartedAt: new Date().toISOString(),
      })
    );
    this.props.navigation.push("ManualConfirmation");
  };

  _onNext = async () => {
    const { t } = this.props;
    if (this.state.barcode1 == null) {
      Alert.alert("", t("barcodeRequired"), [
        { text: t("common:button:ok"), onPress: () => {} },
      ]);
    } else if (!this._matchingBarcodes()) {
      Alert.alert("", t("dontMatch"), [
        { text: t("common:button:ok"), onPress: () => {} },
      ]);
    } else if (!validBarcodeShape(this.state.barcode1)) {
      invalidBarcodeShapeAlert(this.state.barcode1);
    } else {
      const serverVerifiedBarcode = await verifiedBarcode(this.state.barcode1);
      if (!serverVerifiedBarcode) {
        const priorUnverifiedAttempts = !!this.props.invalidBarcodes
          ? this.props.invalidBarcodes.length
          : 0;
        this.props.dispatch(
          appendInvalidBarcode({
            sample_type: "manualEntry",
            code: this.state.barcode1,
          })
        );
        if (priorUnverifiedAttempts > 2 && !this.props.supportCode) {
          this.props.navigation.push("BarcodeContactSupport");
        } else {
          unverifiedBarcodeAlert(t("enter"));
        }
      } else {
        this._onSave();
      }
    }
  };

  _onBarcodeOneChange = (barcode1: string) => {
    this.setState({ barcode1: barcode1.toLowerCase() });
  };

  _onBarcodeTwoChange = (barcode2: string) => {
    this.setState({ barcode2: barcode2.toLowerCase() });
  };

  _onBarcodeOneSubmit = () => {
    this.confirmInput.current!.focus();
  };

  render() {
    const { t } = this.props;
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={KEYBOARD_BEHAVIOR}
        enabled
      >
        <Screen
          buttonLabel={t("common:button:continue")}
          canProceed={true}
          desc={t("desc")}
          navigation={this.props.navigation}
          title={t("enterKit")}
          onNext={this._onNext}
        >
          <View
            style={{
              alignSelf: "stretch",
              flexDirection: "row",
              marginBottom: GUTTER,
            }}
          >
            <Text content={"KIT "} style={{ paddingVertical: 3 }} />
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus={this.props.navigation.isFocused()}
              placeholder={t("placeholder")}
              returnKeyType="done"
              style={{ flex: 1 }}
              value={this.state.barcode1}
              onChangeText={this._onBarcodeOneChange}
              onSubmitEditing={this._onBarcodeOneSubmit}
            />
          </View>
          <View
            style={{
              alignSelf: "stretch",
              flexDirection: "row",
              marginBottom: GUTTER,
            }}
          >
            <Text content={"KIT "} style={{ paddingVertical: 3 }} />
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              placeholder={t("secondPlaceholder")}
              ref={this.confirmInput}
              returnKeyType="done"
              style={{ flex: 1 }}
              value={this.state.barcode2}
              onChangeText={this._onBarcodeTwoChange}
            />
          </View>
          <View
            style={{
              alignItems: "center",
              alignSelf: "stretch",
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: GUTTER,
            }}
          >
            <Image
              style={{ aspectRatio: 2.2, flex: 0.4 }}
              source={{ uri: "barcode" }}
            />
            <View style={{ flex: 0.6, paddingLeft: GUTTER }}>
              <Text
                bold={true}
                content={t("tipHeader")}
                style={{ marginBottom: GUTTER }}
              />
              <Text content={t("tips")} />
            </View>
          </View>
        </Screen>
      </KeyboardAvoidingView>
    );
  }
}
export const ManualEntry = withNamespaces("manualEntryScreen")(
  ManualEntryScreen
);

interface SupportProps {
  supportModalVisible: boolean;
}

@connect((state: StoreState) => ({
  supportModalVisible: state.meta.supportCodeModalVisible,
}))
class BarcodeContactSupportScreen extends React.Component<
  Props & SupportProps & WithNamespaces
> {
  state = {
    invalidCode: false,
    supportCode: "",
  };

  _updateSupportCode = (supportCode: string) => {
    this.setState({ supportCode });
    this._onSupportCodeSubmit(supportCode);
  };

  _onModalSubmit = () => {
    this._onSupportCodeSubmit(this.state.supportCode);
  };

  _onSupportCodeSubmit = (supportCode: string) => {
    if (verifiedSupportCode(supportCode)) {
      this.setState({ invalidCode: false });
      this.props.dispatch(setSupportCode(supportCode));
      this.props.dispatch(toggleSupportCodeModal());
      this.props.navigation.push("ManualEntry");
    } else {
      this.setState({ invalidCode: true });
    }
  };

  render() {
    const { t } = this.props;
    const width = Dimensions.get("window").width;
    return (
      <Screen
        canProceed={false}
        desc={t("description")}
        footer={<Links center={true} links={["supportCode"]} />}
        hideBackButton={true}
        image="contactsupport"
        navigation={this.props.navigation}
        skipButton={true}
        title={t("title")}
      >
        <Modal
          height={280}
          width={width * 0.8}
          title={t("supportVerification")}
          visible={this.props.supportModalVisible}
          onDismiss={() => this.props.dispatch(toggleSupportCodeModal())}
          onSubmit={this._onModalSubmit}
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={KEYBOARD_BEHAVIOR}
            enabled
          >
            <View style={{ justifyContent: "space-between", padding: GUTTER }}>
              <Text
                content={t("enterCode")}
                style={{ paddingBottom: GUTTER }}
              />
              <DigitInput
                digits={5}
                style={
                  this.state.invalidCode ? { color: ERROR_COLOR } : undefined
                }
                onSubmitEditing={this._updateSupportCode}
              />
              <Text
                center={true}
                content={this.state.invalidCode ? t("invalidCode") : ""}
                style={{ color: ERROR_COLOR, paddingVertical: GUTTER }}
              />
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </Screen>
    );
  }
}
export const BarcodeContactSupport = withNamespaces(
  "barcodeContactSupportScreen"
)(BarcodeContactSupportScreen);

@connect()
class SwabInTubeScreen extends React.Component<Props & WithNamespaces> {
  componentDidMount() {
    tracker.logEvent(FunnelEvents.SURVIVED_FIRST_SWAB);
  }

  _onNext = () => {
    this.props.dispatch(setOneMinuteStartTime());
    this.props.navigation.push("FirstTimer");
  };

  render() {
    const { t } = this.props;
    return (
      <Screen
        buttonLabel={t("startTimer")}
        canProceed={true}
        desc={t("description")}
        image="putswabintube"
        navigation={this.props.navigation}
        title={t("title")}
        videoId="putSwabInTube"
        onNext={this._onNext}
      />
    );
  }
}
export const SwabInTube = withNamespaces("swabInTubeScreen")(SwabInTubeScreen);

interface FirstTimerProps {
  oneMinuteStartTime: number | undefined;
}

interface DemoModeProps {
  isDemo: boolean;
}

@connect((state: StoreState) => ({
  isDemo: state.meta.isDemo,
}))
class FirstTimerScreen extends React.Component<
  Props & DemoModeProps & FirstTimerProps & WithNamespaces & TimerProps
> {
  _onTitlePress = () => {
    this.props.isDemo && this.props.onFastForward();
  };

  _onNext = () => {
    this.props.onNext();
    this.props.navigation.push("RemoveSwabFromTube");
  };

  render() {
    const { t } = this.props;
    return (
      <Screen
        canProceed={this.props.done()}
        desc={this.props.getRemainingTime() > 30 * 1000 ? t("tip") : t("tip2")}
        footer={
          <View
            style={{
              alignSelf: "stretch",
              alignItems: "center",
              marginBottom: GUTTER,
            }}
          >
            {!this.props.done() && (
              <View style={{ alignSelf: "stretch" }}>
                <Text
                  content={t("note")}
                  style={{ alignSelf: "stretch", marginBottom: GUTTER }}
                />
                <BorderView
                  style={{
                    alignSelf: "center",
                    borderRadius: BORDER_RADIUS,
                    width: BUTTON_WIDTH,
                  }}
                >
                  <Text
                    bold={true}
                    content={this.props.getRemainingLabel()}
                    style={{ color: SECONDARY_COLOR }}
                  />
                </BorderView>
              </View>
            )}
          </View>
        }
        image="oneminutetimer"
        navigation={this.props.navigation}
        skipButton={!this.props.done()}
        title={t("title")}
        onNext={this._onNext}
        onTitlePress={this._onTitlePress}
      />
    );
  }
}
export const FirstTimer = timerWithConfigProps({
  totalTimeMs: MINUTE_MS,
  startTimeConfig: "oneMinuteStartTime",
  nextScreen: "RemoveSwabFromTube",
})(withNamespaces("firstTimerScreen")(FirstTimerScreen));

@connect()
class StripInTubeScreen extends React.Component<Props & WithNamespaces> {
  _onNext = () => {
    this.props.dispatch(setTenMinuteStartTime());
    this.props.navigation.push("WhatSymptoms");
  };

  render() {
    const { t } = this.props;
    return (
      <Screen
        buttonLabel={t("common:button:continue")}
        canProceed={true}
        desc={t("description")}
        image="openteststrip_1"
        navigation={this.props.navigation}
        title={t("title")}
        videoId="putTestStripInTube"
        onNext={this._onNext}
      />
    );
  }
}
export const StripInTube = withNamespaces("stripInTubeScreen")(
  StripInTubeScreen
);

class WhatSymptomsScreen extends React.Component<
  Props & WithNamespaces & ReduxWriterProps
> {
  _onNext = () => {
    this.props.navigation.push("WhenSymptoms");
  };

  render() {
    const { t } = this.props;
    return (
      <Screen
        canProceed={true}
        centerDesc={true}
        configs={[WhatSymptomsConfig]}
        desc={t("description")}
        hasDivider={true}
        navigation={this.props.navigation}
        title={t("title")}
        getAnswer={this.props.getAnswer}
        updateAnswer={this.props.updateAnswer}
        onNext={this._onNext}
      />
    );
  }
}
export const WhatSymptoms = reduxWriter(
  withNamespaces("surveyScreen")(WhatSymptomsScreen)
);

class WhenSymptomsScreen extends React.Component<
  Props & WithNamespaces & ReduxWriterProps
> {
  _onNext = () => {
    this.props.navigation.push("GeneralExposure");
  };

  _createConfigs = () => {
    const configs: any = [];

    WhenSymptomsScreenConfig.forEach((question: any) => {
      return this.props
        .getAnswer("options", WhatSymptomsConfig.id)
        .filter((option: Option) => option.selected)
        .forEach((option: Option) => {
          configs.push({
            buttons: question.buttons,
            description: option.key,
            id: question.id + "_" + option.key,
            required: question.required,
            title: question.title,
            type: "buttonGrid",
          });
        });
    });
    return configs;
  };

  render() {
    const { getAnswer, navigation, t, updateAnswer } = this.props;
    return (
      <Screen
        canProceed={true}
        centerDesc={true}
        configs={this._createConfigs()}
        desc={t("description")}
        getAnswer={getAnswer}
        hasDivider={true}
        navigation={navigation}
        title={t("title")}
        updateAnswer={updateAnswer}
        onNext={this._onNext}
      />
    );
  }
}
export const WhenSymptoms = reduxWriter(
  withNamespaces("surveyScreen")(WhenSymptomsScreen)
);

class GeneralExposureScreen extends React.Component<
  Props & WithNamespaces & ReduxWriterProps
> {
  _onNext = () => {
    this.props.navigation.push("GeneralHealth");
  };

  render() {
    const { t, getAnswer, navigation, updateAnswer } = this.props;
    const header = (
      <Fragment>
        <Text content={t("expoDesc")} style={{ marginBottom: GUTTER }} />
        <Image style={imageStyles.image} source={{ uri: "generalexposure" }} />
        <Text
          content={t("expoRef")}
          italic={true}
          style={{ marginBottom: GUTTER }}
        />
      </Fragment>
    );

    return (
      <Screen
        canProceed={true}
        centerDesc={true}
        configs={GeneralExposureScreenConfig}
        desc={t("description")}
        getAnswer={getAnswer}
        hasDivider={true}
        header={header}
        navigation={navigation}
        onNext={this._onNext}
        title={t("generalExposure")}
        updateAnswer={updateAnswer}
      />
    );
  }
}
export const GeneralExposure = reduxWriter(
  withNamespaces("surveyScreen")(GeneralExposureScreen)
);

class GeneralHealthScreen extends React.Component<
  Props & WithNamespaces & ReduxWriterProps
> {
  _onNext = () => {
    this.props.navigation.push("ThankYouSurvey");
  };

  render() {
    const { getAnswer, navigation, t, updateAnswer } = this.props;
    const header = <Text content={t("generalDesc")} />;

    return (
      <Screen
        canProceed={true}
        centerDesc={true}
        configs={GeneralHealthScreenConfig}
        desc={t("description")}
        hasDivider={true}
        header={header}
        navigation={navigation}
        title={t("generalHealth")}
        onNext={this._onNext}
        getAnswer={getAnswer}
        updateAnswer={updateAnswer}
      />
    );
  }
}
export const GeneralHealth = reduxWriter(
  withNamespaces("surveyScreen")(GeneralHealthScreen)
);

interface ThankYouSurveyProps {
  tenMinuteStartTime: number | undefined;
}

@connect((state: StoreState) => ({
  isDemo: state.meta.isDemo,
  tenMinuteStartTime: state.survey.tenMinuteStartTime,
}))
class ThankYouSurveyScreen extends React.Component<
  Props & DemoModeProps & WithNamespaces & ThankYouSurveyProps & TimerProps
> {
  componentDidMount() {
    tracker.logEvent(FunnelEvents.COMPLETED_SURVEY);
  }

  _onNext = () => {
    this.props.onNext();
    this.props.navigation.push("TestStripReady");
  };

  _onTitlePress = () => {
    this.props.isDemo && this.props.onFastForward();
  };

  render() {
    const { t } = this.props;
    return (
      <Screen
        canProceed={this.props.done()}
        desc={t("desc")}
        footer={
          this.props.done() ? (
            undefined
          ) : (
            <BorderView
              style={{
                alignSelf: "center",
                borderRadius: BORDER_RADIUS,
                width: BUTTON_WIDTH,
              }}
            >
              <Text
                bold={true}
                content={this.props.getRemainingLabel()}
                style={{ color: SECONDARY_COLOR }}
              />
            </BorderView>
          )
        }
        image="questionsthankyou"
        navigation={this.props.navigation}
        skipButton={!this.props.done()}
        title={t("title")}
        onNext={this._onNext}
        onTitlePress={this._onTitlePress}
      >
        {!this.props.done() && (
          <Text content={t("waiting")} style={{ alignSelf: "stretch" }} />
        )}
      </Screen>
    );
  }
}
export const ThankYouSurvey = timerWithConfigProps({
  totalTimeMs: TEST_STRIP_MS,
  startTimeConfig: "tenMinuteStartTime",
  nextScreen: "TestStripReady",
})(withNamespaces("thankYouSurveyScreen")(ThankYouSurveyScreen));

class TestStripSurveyScreen extends React.Component<
  Props & WithNamespaces & ReduxWriterProps
> {
  constructor(props: Props & WithNamespaces & ReduxWriterProps) {
    super(props);
    this._onNext = this._onNext.bind(this);
  }

  async _onNext() {
    const { status } = await Permissions.getAsync(Permissions.CAMERA);
    const getAnswer = this.props.getAnswer;
    const blueAnswer = getAnswer("selectedButtonKey", BlueLineConfig.id);

    switch (blueAnswer) {
      case "yes":
        const redAnswer = getAnswer("selectedButtonKey", RedWhenBlueConfig.id);

        tracker.logEvent(FunnelEvents.RESULT_BLUE);
        switch (redAnswer) {
          case "yesAboveBlue":
          case "yesBelowBlue":
          case "yesAboveBelowBlue":
            tracker.logEvent(FunnelEvents.RESULT_BLUE_ANY_RED);
            break;
          case "noRed":
            tracker.logEvent(FunnelEvents.RESULT_BLUE_NO_RED);
            break;
        }
        break;

      case "no":
        tracker.logEvent(FunnelEvents.RESULT_NO_BLUE);
        break;
    }

    if (status === "denied") {
      this.props.navigation.push("CleanFirstTest");
    } else {
      this.props.navigation.push("PictureInstructions");
    }
  }

  render() {
    const { t } = this.props;
    return (
      <Screen
        canProceed={true}
        desc={t("desc")}
        image="lookatteststrip"
        navigation={this.props.navigation}
        title={t("title")}
        onNext={this._onNext}
      >
        <ButtonGrid
          desc={true}
          question={BlueLineConfig}
          getAnswer={this.props.getAnswer}
          updateAnswer={this.props.updateAnswer}
        />
        {this.props.getAnswer("selectedButtonKey", BlueLineConfig.id) ===
          "yes" && (
          <RadioGrid
            question={RedWhenBlueConfig}
            getAnswer={this.props.getAnswer}
            updateAnswer={this.props.updateAnswer}
          />
        )}
        {this.props.getAnswer("selectedButtonKey", BlueLineConfig.id) ===
          "no" && (
          <RadioGrid
            question={RedLineConfig}
            getAnswer={this.props.getAnswer}
            updateAnswer={this.props.updateAnswer}
          />
        )}
      </Screen>
    );
  }
}
export const TestStripSurvey = reduxWriter(
  withNamespaces("testStripSurveyScreen")(TestStripSurveyScreen)
);

class PictureInstructionsScreen extends React.Component<
  Props & WithNamespaces
> {
  constructor(props: Props & WithNamespaces) {
    super(props);
    this._onNext = this._onNext.bind(this);
    this._skip = this._skip.bind(this);
  }

  _skip() {
    this.props.navigation.push("CleanFirstTest");
  }

  async _onNext() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    if (status === "granted") {
      this.props.navigation.push("TestStripCamera");
    } else {
      this._skip();
    }
  }

  render() {
    const { t } = this.props;
    return (
      <Screen
        canProceed={true}
        desc={t("desc")}
        footer={<Links center={true} links={["skipTestStripPhoto"]} />}
        image="takepictureteststrip"
        navigation={this.props.navigation}
        title={t("title")}
        videoId="takePhotoOfStrip"
        onNext={this._onNext}
      >
        <Image style={imageStyles.image} source={{ uri: "teststripcamera1" }} />
        <Text
          content={t("tip2")}
          style={{ alignSelf: "stretch", marginBottom: GUTTER }}
        />
        <Image style={imageStyles.image} source={{ uri: "teststripcamera2" }} />
        <Text
          content={t("tip3")}
          style={{ alignSelf: "stretch", marginBottom: GUTTER }}
        />
      </Screen>
    );
  }
}
export const PictureInstructions = withNamespaces("pictureInstructionsScreen")(
  PictureInstructionsScreen
);

@connect((state: StoreState) => ({
  isDemo: state.meta.isDemo,
}))
class TestStripCameraScreen extends React.Component<
  DemoModeProps & Props & WithNamespaces
> {
  camera = React.createRef<any>();

  constructor(props: DemoModeProps & Props & WithNamespaces) {
    super(props);
    this._takePicture = this._takePicture.bind(this);
  }

  state = {
    spinner: !DeviceInfo.isEmulator(),
  };

  _cameraReady = () => {
    this.setState({ spinner: false });
  };

  async _takePicture() {
    if (!this.state.spinner) {
      this.setState({ spinner: true });

      try {
        const photo = await this.camera.current!.takePictureAsync({
          quality: 0.8,
          base64: true,
          orientation: "portrait",
          fixOrientation: true,
        });
        const csruid = await newCSRUID();
        uploader.savePhoto(csruid, photo.base64);
        this.props.dispatch(
          setTestStripImg({
            sample_type: "TestStripBase64",
            code: csruid,
          })
        );
        this.setState({ spinner: false });
        this.props.navigation.push("TestStripConfirmation", {
          photo: photo.uri,
        });
      } catch (e) {
        this.setState({ spinner: false });
      }
    }
  }

  render() {
    const { t } = this.props;
    return (
      <Chrome isDemo={this.props.isDemo} navigation={this.props.navigation}>
        <View style={{ flex: 1, marginBottom: -1 * SYSTEM_PADDING_BOTTOM }}>
          <Spinner visible={this.state.spinner} />
          <Camera
            ref={this.camera}
            style={cameraStyles.camera}
            onCameraReady={this._cameraReady}
          />
          <View style={cameraStyles.overlayContainer}>
            <Text
              center={true}
              content={t("title")}
              style={cameraStyles.overlayText}
            />
            <View style={cameraStyles.innerContainer}>
              <Image
                style={cameraStyles.testStrip}
                source={{ uri: "teststripdetail" }}
              />
              <View style={{ flex: 1, marginLeft: GUTTER }}>
                <Text
                  center={true}
                  content={t("stripHere")}
                  style={cameraStyles.overlayText}
                />
                <View style={cameraStyles.targetBox} />
              </View>
            </View>
            <View style={{ alignItems: "center", alignSelf: "stretch" }}>
              <Text
                center={true}
                content={t("description")}
                style={cameraStyles.overlayText}
              />
              <TouchableOpacity onPress={this._takePicture}>
                <View style={cameraStyles.outerCircle}>
                  <View style={cameraStyles.circle} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Chrome>
    );
  }
}

const imageStyles = StyleSheet.create({
  image: {
    aspectRatio: ASPECT_RATIO,
    height: undefined,
    marginBottom: GUTTER,
    width: "100%",
  },
});

const cameraStyles = StyleSheet.create({
  camera: {
    alignSelf: "stretch",
    flex: 1,
  },
  innerContainer: {
    height: "100%",
    flexDirection: "row",
    flex: 1,
    marginHorizontal: GUTTER * 2,
    marginBottom: GUTTER,
  },
  outerCircle: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderColor: "white",
    borderWidth: 7,
    borderRadius: 40,
    height: 80,
    width: 80,
  },
  circle: {
    backgroundColor: "white",
    borderColor: "transparent",
    borderRadius: 30,
    borderWidth: 3,
    height: 60,
    width: 60,
  },
  overlayText: {
    color: "white",
    fontSize: LARGE_TEXT,
    marginVertical: GUTTER,
    textShadowColor: "rgba(0, 0, 0, 0.99)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  overlayContainer: {
    alignItems: "center",
    justifyContent: "space-between",
    left: 0,
    right: 0,
    position: "absolute",
    top: 0,
    bottom: 0,
    marginBottom: GUTTER + SYSTEM_PADDING_BOTTOM,
  },
  targetBox: {
    alignSelf: "center",
    borderColor: "white",
    borderRadius: 5,
    borderStyle: "dashed",
    borderWidth: 4,
    flex: 1,
    shadowColor: "rgba(0, 0, 0, 0.99)",
    shadowOffset: { width: -1, height: 1 },
    shadowRadius: 10,
    width: "65%",
  },
  testStrip: {
    alignSelf: "center",
    aspectRatio: 0.135,
    height: "95%",
    marginTop: GUTTER,
    marginLeft: GUTTER,
    width: undefined,
  },
});

export const TestStripCamera = withNamespaces("testStripCameraScreen")(
  TestStripCameraScreen
);

interface TestStripProps {
  testStripImg: SampleInfo;
}

class TestStripConfirmationScreen extends React.Component<
  Props & TestStripProps & WithNamespaces
> {
  _onNext = () => {
    this.props.navigation.push("CleanFirstTest");
  };

  render() {
    const { navigation, t } = this.props;
    const photo = navigation.getParam("photo", null);
    const screenWidth = Dimensions.get("window").width;
    const screenHeight = Dimensions.get("window").height;
    return (
      <Screen
        canProceed={true}
        desc={t("desc")}
        navigation={this.props.navigation}
        title={t("title")}
        onNext={this._onNext}
      >
        {photo != null && (
          <Image
            style={{
              alignSelf: "center",
              aspectRatio: screenWidth / screenHeight,
              width: "50%",
              marginVertical: GUTTER,
            }}
            source={{ uri: photo }}
          />
        )}
      </Screen>
    );
  }
}
export const TestStripConfirmation = withNamespaces(
  "testStripConfirmationScreen"
)(TestStripConfirmationScreen);

class FirstTestFeedbackScreen extends React.Component<
  Props & WithNamespaces & ReduxWriterProps
> {
  _onNext = () => {
    this.props.navigation.push("BeginSecondTest");
  };

  render() {
    const { t } = this.props;
    return (
      <Screen
        canProceed={true}
        image="nicejob"
        navigation={this.props.navigation}
        title={t("title")}
        onNext={this._onNext}
      >
        <RadioGrid
          desc={true}
          hideQuestion={false}
          question={FirstTestFeedbackConfig}
          getAnswer={this.props.getAnswer}
          updateAnswer={this.props.updateAnswer}
        />
      </Screen>
    );
  }
}
export const FirstTestFeedback = reduxWriter(
  withNamespaces("firstTestFeedbackScreen")(FirstTestFeedbackScreen)
);

class SecondTestFeedbackScreen extends React.Component<
  Props & WithNamespaces & ReduxWriterProps
> {
  _onNext = () => {
    this.props.navigation.push("Packing");
  };

  render() {
    const { t } = this.props;
    return (
      <Screen
        canProceed={true}
        image="nicejob"
        navigation={this.props.navigation}
        title={t("title")}
        onNext={this._onNext}
      >
        <RadioGrid
          desc={true}
          hideQuestion={false}
          question={SecondTestFeedbackConfig}
          getAnswer={this.props.getAnswer}
          updateAnswer={this.props.updateAnswer}
        />
      </Screen>
    );
  }
}
export const SecondTestFeedback = reduxWriter(
  withNamespaces("secondTestFeedbackScreen")(SecondTestFeedbackScreen)
);

class ShipBoxScreen extends React.Component<
  Props & WithNamespaces & ReduxWriterProps
> {
  _onNext = () => {
    this.props.navigation.push("SchedulePickup");
  };

  _onDropOff = () => {
    this.props.navigation.push("EmailOptIn");
  };

  render() {
    const { t } = this.props;
    return (
      <Screen
        buttonLabel={t("schedulePickup")}
        canProceed={true}
        desc={t("description")}
        image="shippingyourbox"
        footer={
          <Button
            enabled={true}
            label={t("iWillDropOff")}
            primary={true}
            textStyle={{ fontSize: EXTRA_SMALL_TEXT }}
            onPress={this._onDropOff}
          />
        }
        navigation={this.props.navigation}
        title={t("title")}
        videoId="shipBox"
        onNext={this._onNext}
      >
        <Links links={["showNearbyUsps"]} />
      </Screen>
    );
  }
}
export const ShipBox = reduxWriter(
  withNamespaces("shipBoxScreen")(ShipBoxScreen)
);

class SchedulePickupScreen extends React.Component<Props & WithNamespaces> {
  _onNext = () => {
    scheduleUSPSPickUp(() => {
      this.props.navigation.push("EmailOptIn");
    });
  };

  render() {
    const { t } = this.props;
    return (
      <Screen
        buttonLabel={t("title")}
        canProceed={true}
        desc={t("description")}
        image="schedulepickup"
        navigation={this.props.navigation}
        title={t("title")}
        onNext={this._onNext}
      >
        <BulletPoint content={t("rule1")} />
        <BulletPoint content={t("rule2")} />
      </Screen>
    );
  }
}
export const SchedulePickup = withNamespaces("schedulePickupScreen")(
  SchedulePickupScreen
);

interface EmailProps {
  email?: string;
}

@connect((state: StoreState) => ({
  isConnected: state.meta.isConnected,
  workflow: state.survey.workflow,
}))
class EmailOptInScreen extends React.Component<
  Props & ConnectedProps & WorkflowProps & WithNamespaces & ReduxWriterProps
> {
  componentDidMount() {
    tracker.logEvent(FunnelEvents.COMPLETED_SHIPPING);
  }

  _onNext = async () => {
    const { isConnected, t } = this.props;

    this.props.dispatch(
      setWorkflow({
        ...this.props.workflow,
        surveyCompletedAt: new Date().toISOString(),
      })
    );

    const awaitingUpload = await uploader.documentsAwaitingUpload();

    if (!!awaitingUpload && awaitingUpload > 0 && !isConnected) {
      Alert.alert(
        t("common:notifications:dataUploadTitle"),
        t("common:notifications:dataUploadDesc"),
        [{ text: "Try Again" }]
      );
    } else {
      this.props.navigation.push("Thanks");
    }
  };

  _onChange = (options: Option[]) => {
    this.props.updateAnswer({ options }, OptInForMessagesConfig);
  };

  render() {
    const { t } = this.props;
    return (
      <Screen
        canProceed={true}
        desc={t("description")}
        image="optinmessages"
        navigation={this.props.navigation}
        title={t("title")}
        onNext={this._onNext}
      >
        <OptionList
          data={newSelectedOptionsList(
            OptInForMessagesConfig.optionList!.options,
            this.props.getAnswer("options", OptInForMessagesConfig.id)
          )}
          multiSelect={true}
          numColumns={1}
          style={{ marginBottom: GUTTER }}
          onChange={this._onChange}
        />
      </Screen>
    );
  }
}
export const EmailOptIn = reduxWriter(
  withNamespaces("emailOptInScreen")(EmailOptInScreen)
);

interface ThanksScreenProps {
  email: string;
}

@connect((state: StoreState) => ({
  email: state.survey.email,
}))
class ThanksScreen extends React.Component<
  Props & ThanksScreenProps & WithNamespaces & ReduxWriterProps
> {
  render() {
    const { t } = this.props;
    return (
      <Screen
        canProceed={false}
        desc={t("description", { email: this.props.email })}
        image="finalthanks"
        navigation={this.props.navigation}
        skipButton={true}
        title={t("title")}
      >
        <Links links={["learnMore", "findMedHelp"]} />
        <Text
          content={t("disclaimer")}
          style={{
            alignSelf: "stretch",
            fontSize: SMALL_TEXT,
            marginBottom: GUTTER,
          }}
        />
      </Screen>
    );
  }
}
export const Thanks = reduxWriter(withNamespaces("thanksScreen")(ThanksScreen));
