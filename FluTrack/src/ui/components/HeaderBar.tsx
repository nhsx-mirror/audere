// Copyright (c) 2019 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.

import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { NavigationScreenProp } from "react-navigation";
import FeedbackModal from "./FeedbackModal";
import { WithNamespaces, withNamespaces } from "react-i18next";
import { connect } from "react-redux";
import { StoreState } from "../../store";

interface Props {
  completedSurvey?: boolean;
  isDemo?: boolean;
  navigation: NavigationScreenProp<any, any>;
}

@connect((state: StoreState) => ({
  isDemo: state.admin.isDemo,
}))
class HeaderBar extends React.Component<Props & WithNamespaces> {
  state = {
    feedbackVisible: false,
  };

  _toHome = () => {
    // TODO: Mark survey as completed
    this.props.navigation.popToTop();
  };

  _toHomeWarn = () => {
    // TODO: log cancellation, clear form
    const { t } = this.props;
    Alert.alert(t("exitSurvey"), t("returningWillDiscard"), [
      {
        text: t("cancel"),
        onPress: () => {},
      },
      {
        text: t("exit"),
        onPress: () => {
          this.props.navigation.popToTop();
        },
        style: "destructive",
      },
    ]);
  };

  render() {
    const { t } = this.props;
    return (
      <View>
        <FeedbackModal
          visible={this.state.feedbackVisible}
          onDismiss={() => this.setState({ feedbackVisible: false })}
        />
        <View style={styles.container}>
          <TouchableOpacity
            onPress={
              this.props.completedSurvey ? this._toHome : this._toHomeWarn
            }
            style={styles.actionContainer}
          >
            <Feather name="chevron-left" color="#007AFF" size={30} />
            <Text style={styles.actionText}>
              {t(this.props.completedSurvey ? "returnToHome" : "exitStudy")}
            </Text>
          </TouchableOpacity>
          {this.props.isDemo && <Text style={styles.title}>DEMO MODE</Text>}
          <TouchableOpacity
            onPress={() => this.setState({ feedbackVisible: true })}
          >
            <Text style={styles.actionText}>
              {t("feedbackModal:provideFeedback")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  actionContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  actionText: {
    fontFamily: "System",
    fontSize: 17,
    color: "#007AFF",
    lineHeight: 22,
    letterSpacing: -0.41,
  },
  container: {
    alignItems: "center",
    backgroundColor: "#EEEEEE",
    borderBottomColor: "#bbb",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    height: 70,
    justifyContent: "space-between",
    paddingTop: 20,
    paddingHorizontal: 8,
  },
  title: {
    fontFamily: "System",
    fontSize: 17,
    fontWeight: "bold",
  },
});

export default withNamespaces("headerBar")<Props>(HeaderBar);
