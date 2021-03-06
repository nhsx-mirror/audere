import { GiftcardFailureReason } from "audere-lib/coughProtocol";
import { Linking } from "expo";
import React, { Component, Fragment } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";
import { AppState, StyleSheet, View } from "react-native";
import { NavigationScreenProp, withNavigation } from "react-navigation";
import { connect } from "react-redux";
import { appSupport, followUpSurveyUrl } from "../../resources/LinkConfig";
import {
  Action,
  setGiftCardAmount,
  setGiftCardURL,
  StoreState,
} from "../../store";
import {
  checkGiftcardAvailability,
  getGiftCard,
} from "../../transport/Giftcards";
import { getRemoteConfig } from "../../util/remoteConfig";
import {
  AppEvents,
  AppHealthEvents,
  logFirebaseEvent,
} from "../../util/tracker";
import Text from "../components/Text";
import {
  BORDER_RADIUS,
  GUTTER,
  PRIMARY_COLOR,
  SECONDARY_COLOR,
  THICK_BORDER_WIDTH,
} from "../styles";
import Button from "./Button";
import Divider from "./Divider";
import SurveyLinkBlock from "./flu/SurveyLinkBlock";

interface Props {
  barcode: string;
  completed48HoursAgo: boolean;
  dispatch(action: Action): void;
  docId: string;
  giftCardAmount: number;
  giftCardURL?: string;
  isConnected: boolean;
  isDemo: boolean;
  navigation: NavigationScreenProp<any, any>;
}

interface State {
  failureReason: GiftcardFailureReason | "";
}

class GiftCard extends Component<Props & WithNamespaces, State> {
  constructor(props: Props & WithNamespaces) {
    super(props);
    this.state = { failureReason: "" };
  }

  async componentDidMount() {
    AppState.addEventListener("change", this._handleAppStateChange);
    this._checkGiftCardAmount();
    this._checkGiftCardAvailability();
  }

  componentWillUnmount() {
    AppState.removeEventListener("change", this._handleAppStateChange);
  }

  _handleAppStateChange = async (nextAppState: string) => {
    if (nextAppState === "active") {
      // Force a re-render in case remoteConfig values have changed;
      // e.g. giftCardsAvailable or skipSurveyNotification
      if (!this._checkGiftCardAmount()) {
        this.forceUpdate();
      }
      this._checkGiftCardAvailability();
    }
  };

  _checkGiftCardAmount = (): boolean => {
    const needsAmount =
      !!getRemoteConfig("giftCardsAvailable") && !this.props.giftCardAmount;
    if (needsAmount) {
      this.props.dispatch(setGiftCardAmount());
    }
    return needsAmount;
  };

  _checkGiftCardAvailability = async () => {
    const { docId, barcode, giftCardAmount, isConnected, isDemo } = this.props;
    const giftCardsAvailable = getRemoteConfig("giftCardsAvailable");

    this.setState({ failureReason: "" });
    if (isConnected && giftCardsAvailable) {
      try {
        const response = await checkGiftcardAvailability(
          docId,
          barcode,
          giftCardAmount,
          isDemo
        );

        if (response.hasOwnProperty("failureReason")) {
          logFirebaseEvent(AppHealthEvents.GIFTCARD_API_ERROR, {
            failureReason: response.failureReason,
          });
          this.setState({ failureReason: response.failureReason! });
        }
      } catch (e) {
        logFirebaseEvent(AppHealthEvents.GIFTCARD_API_ERROR, {
          failureReason: GiftcardFailureReason.API_ERROR,
        });
        this.setState({ failureReason: GiftcardFailureReason.API_ERROR });
      }
    }

    const { failureReason } = this.state;
    const invalidBarcode =
      failureReason === GiftcardFailureReason.INVALID_BARCODE;
    const cardsExhausted =
      failureReason === GiftcardFailureReason.CARDS_EXHAUSTED;
    const APIError =
      failureReason === GiftcardFailureReason.API_ERROR ||
      failureReason === GiftcardFailureReason.INVALID_DOC_ID;

    if (giftCardsAvailable && !invalidBarcode && !APIError && !cardsExhausted) {
      logFirebaseEvent(AppEvents.GIFT_CARD_LINK_SHOWN);
    }
  };

  _onRedeemPress = async () => {
    const {
      docId,
      barcode,
      giftCardAmount,
      isConnected,
      isDemo,
      giftCardURL,
    } = this.props;

    if ((!giftCardURL || giftCardURL.length === 0) && isConnected) {
      try {
        const response = await getGiftCard(
          docId,
          barcode,
          giftCardAmount,
          isDemo
        );

        if (response.hasOwnProperty("failureReason")) {
          logFirebaseEvent(AppHealthEvents.GIFTCARD_API_ERROR, {
            failureReason: response.failureReason,
          });
          this.setState({ failureReason: response.failureReason! });
        } else if (!!response.giftcard) {
          this.props.dispatch(setGiftCardURL(response.giftcard.url));
          logFirebaseEvent(AppEvents.GIFT_CARD_LINK_PRESSED);

          this.setState({ failureReason: "" }, () => {
            Linking.openURL(response.giftcard!.url);
          });
        }
      } catch (e) {
        logFirebaseEvent(AppHealthEvents.GIFTCARD_API_ERROR, {
          failureReason: GiftcardFailureReason.API_ERROR,
        });
        this.setState({ failureReason: GiftcardFailureReason.API_ERROR });
      }
    } else {
      logFirebaseEvent(AppEvents.GIFT_CARD_LINK_PRESSED);
      Linking.openURL(giftCardURL);
    }
  };

  _navToFAQ = () => {
    this.props.navigation.navigate("GeneralQuestions");
  };

  _navToSurvey = () => {
    Linking.openURL(`${followUpSurveyUrl}?r=${this.props.barcode}`);
  };

  render() {
    const { completed48HoursAgo, giftCardAmount, isConnected, t } = this.props;
    const { failureReason } = this.state;
    const giftCardsAvailable = getRemoteConfig("giftCardsAvailable");
    const invalidBarcode =
      failureReason === GiftcardFailureReason.INVALID_BARCODE;
    const cardsExhausted =
      failureReason === GiftcardFailureReason.CARDS_EXHAUSTED;
    const APIError =
      failureReason === GiftcardFailureReason.API_ERROR ||
      failureReason === GiftcardFailureReason.INVALID_DOC_ID;

    const thankYouText = !!giftCardsAvailable
      ? completed48HoursAgo
        ? cardsExhausted
          ? "surveyNoGiftCard"
          : "surveyGiftCard"
        : cardsExhausted
        ? "noSurveyNoGiftCard"
        : "noSurveyGiftCard"
      : "desc";

    const giftcardText = !!giftCardsAvailable
      ? isConnected
        ? invalidBarcode
          ? "invalidBarcode"
          : cardsExhausted
          ? "noGiftCard"
          : APIError
          ? "APIError"
          : "giftCard"
        : "offline"
      : "noGiftCard";

    const skipSurveyNotification = getRemoteConfig("skipSurveyNotification");

    return (
      <View>
        <Fragment>
          <Text content={t(thankYouText)} />
          <Divider style={styles.divider} />
          {!!completed48HoursAgo && !skipSurveyNotification && (
            <Fragment>
              <SurveyLinkBlock />
              <Divider style={styles.divider} />
            </Fragment>
          )}

          {!!giftCardsAvailable && (
            <Fragment>
              <Text content={t(giftcardText, { giftCardAmount })} />
              {!cardsExhausted && isConnected && !invalidBarcode && !APIError && (
                <Fragment>
                  <Button
                    enabled={isConnected && !invalidBarcode && !cardsExhausted}
                    label={t("redeem")}
                    onPress={this._onRedeemPress}
                    primary={true}
                    style={styles.redeemButton}
                  />
                  <Text content={t("note")} italic={true} />
                  <Text
                    bold={true}
                    content={t("faqLink")}
                    onPress={this._navToFAQ}
                    style={styles.link}
                  />
                </Fragment>
              )}
              {(invalidBarcode || APIError) &&
                (!cardsExhausted && isConnected) && (
                  <Button
                    label={t("emailSupport")}
                    enabled={true}
                    onPress={appSupport}
                    primary={true}
                    style={[styles.redeemButton, { marginBottom: 0 }]}
                  />
                )}
              <Divider style={styles.divider} />
            </Fragment>
          )}
        </Fragment>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  divider: {
    marginTop: GUTTER,
  },
  link: {
    marginTop: GUTTER,
    color: SECONDARY_COLOR,
  },
  redeemButton: {
    marginVertical: GUTTER,
    alignSelf: "center",
    borderWidth: THICK_BORDER_WIDTH,
    borderColor: PRIMARY_COLOR,
    borderRadius: BORDER_RADIUS,
  },
  redeemText: {
    paddingHorizontal: GUTTER,
    paddingVertical: GUTTER / 2,
    color: PRIMARY_COLOR,
  },
});

export default connect((state: StoreState) => ({
  completed48HoursAgo:
    (new Date().getTime() -
      new Date(state.survey.workflow.surveyCompletedAt!).getTime()) /
      1000 /
      60 /
      60 >=
    48,
  docId: state.survey.csruid,
  barcode: state.survey.kitBarcode ? state.survey.kitBarcode.code : "",
  isConnected: state.meta.isConnected,
  isDemo: state.meta.isDemo,
  giftCardAmount:
    !!state.survey.giftCardInfo && !!state.survey.giftCardInfo.giftCardAmount
      ? state.survey.giftCardInfo.giftCardAmount
      : 0,
  giftCardURL:
    !!state.survey.giftCardInfo && !!state.survey.giftCardInfo.giftCardURL
      ? state.survey.giftCardInfo.giftCardURL
      : "",
}))(withNavigation(withNamespaces("Giftcard")(GiftCard)));
