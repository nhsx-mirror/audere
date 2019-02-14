import React from "react";
import { AppState, TouchableWithoutFeedback, View } from "react-native";
import {
  Action,
  StoreState,
  appendEvent,
  clearState,
  getActiveRouteName,
} from "../store/";
import { connect } from "react-redux";
import { createReduxContainer } from "react-navigation-redux-helpers";
import {
  NavigationActions,
  NavigationState,
  StackActions,
} from "react-navigation";
import { EventInfoKind, WorkflowInfo } from "audere-lib/feverProtocol";
import AppNavigator from "./AppNavigator";

const AppContainer = createReduxContainer(AppNavigator);

interface Props {
  isDemo: boolean;
  lastUpdate?: number;
  navigationState: NavigationState;
  workflow: WorkflowInfo;
  dispatch(action: Action): void;
}

class AppWithNavigationState extends React.Component<Props> {
  QUAD_PRESS_DELAY = 600;
  lastTap: number | null = null;
  secondLastTap: number | null = null;
  thirdLastTap: number | null = null;

  handleQuadTap = () => {
    const now = Date.now();
    if (
      this.props.isDemo &&
      this.lastTap != null &&
      this.secondLastTap != null &&
      this.thirdLastTap != null &&
      now - this.thirdLastTap! < this.QUAD_PRESS_DELAY
    ) {
      this._handleAppStateChange("quadTap");
    } else {
      this.thirdLastTap = this.secondLastTap;
      this.secondLastTap = this.lastTap;
      this.lastTap = now;
    }
  };

  componentDidMount() {
    AppState.addEventListener("change", this._handleAppStateChange);
    this._handleAppStateChange("launch");
  }

  componentWillUnMount() {
    AppState.removeEventListener("change", this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState: string) => {
    // NOTE system notifications (camera, push notification permission requests) toggle
    // the app's active/inactive state. This is fine for now since we don't have any timeouts
    // here that happen immediately, all require a minimum amount of elapsed time. This could
    // be an issue in the future.
    const currentDate = new Date();
    const activeRoute = getActiveRouteName(this.props.navigationState);

    if (this.props.lastUpdate == null) {
      return;
    }

    const MILLIS_IN_SECOND = 1000.0;
    const SECONDS_IN_MINUTE = 60;
    const MINUTES_IN_HOUR = 60;
    const HOURS_IN_DAY = 24;

    const intervalMilis = currentDate.getTime() - this.props.lastUpdate;
    const elapsedMinutes =
      intervalMilis / (MILLIS_IN_SECOND * SECONDS_IN_MINUTE);
    const elapsedHours =
      intervalMilis / (MILLIS_IN_SECOND * SECONDS_IN_MINUTE * MINUTES_IN_HOUR);

    if (
      nextAppState === "launch" ||
      nextAppState === "active" ||
      nextAppState === "quadTap"
    ) {
      if (
        this.props.workflow.screeningComplete &&
        !this.props.workflow.surveyStarted &&
        (nextAppState === "quadTap" || elapsedMinutes > 3 * MINUTES_IN_HOUR)
      ) {
        // Have completed screening but not started survey and at least 3 hours have passed,
        // redirect to welcome back (survey)
        this.props.dispatch(
          appendEvent(
            EventInfoKind.TimeoutNav,
            "app:" + nextAppState + ":screeningCompleteRedirectToSurveyStart"
          )
        );
        this.props.dispatch(
          StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: "WelcomeBack" })],
          })
        );
      } else if (
        (activeRoute === "AgeIneligible" ||
          activeRoute === "SymptomsIneligible" ||
          activeRoute === "ConsentIneligible") &&
        (nextAppState === "quadTap" || elapsedHours > HOURS_IN_DAY)
      ) {
        // Was on ineligible screen for at least 24 hours, clear state
        this.props.dispatch(
          appendEvent(
            EventInfoKind.TimeoutNav,
            "app:" +
              nextAppState +
              ":ineligibleExpirationRedirectToScreeningStart"
          )
        );
        this.props.dispatch(clearState());
      } else if (
        !this.props.workflow.screeningComplete &&
        (nextAppState === "quadTap" || elapsedHours > 2 * HOURS_IN_DAY)
      ) {
        // Have not completed screening (not ordered kit) and 2 days have passed, clear state
        this.props.dispatch(
          appendEvent(
            EventInfoKind.TimeoutNav,
            "app:" +
              nextAppState +
              ":screeningExpirationRedirectToScreeningStart"
          )
        );
        this.props.dispatch(clearState());
      } else if (
        this.props.workflow.surveyComplete &&
        (nextAppState === "quadTap" || elapsedHours > HOURS_IN_DAY)
      ) {
        // Successfully completed survey and 1 day has passed, clear state
        this.props.dispatch(
          appendEvent(
            EventInfoKind.TimeoutNav,
            "app:" + nextAppState + ":surveyCompleteRedirectToScreeningStart"
          )
        );
        this.props.dispatch(clearState());
      } else if (
        this.props.workflow.surveyStarted &&
        (nextAppState === "quadTap" || elapsedHours > 4 * HOURS_IN_DAY)
      ) {
        // Started survey but did not finish, at least 4 days have passed, clear state
        this.props.dispatch(
          appendEvent(
            EventInfoKind.TimeoutNav,
            "app:" +
              nextAppState +
              ":surveyIncompleteExpirationRedirectToScreeningStart"
          )
        );
        this.props.dispatch(clearState());
      }
    }
  };

  render() {
    return (
      <TouchableWithoutFeedback onPress={this.handleQuadTap}>
        <View style={{ flex: 1 }}>
          <AppContainer
            state={this.props.navigationState}
            dispatch={this.props.dispatch}
          />
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

export default connect((state: StoreState) => ({
  isDemo: state.meta.isDemo,
  lastUpdate: state.survey.timestamp,
  navigationState: state.navigation,
  workflow: state.survey.workflow,
}))(AppWithNavigationState);
