import React from "react";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { StoreState } from "../../../store/index";
import { Action, setAdverseEventTypes } from "../../../store";
import OptionTable from "./components/OptionTable";
import OptionList from "../experiment/components/OptionList";
import Button from "../experiment/components/Button";
import { Text, StyleSheet, View, Alert } from "react-native";
import ScreenContainer from "../experiment/components/ScreenContainer";

interface Props {
  navigation: NavigationScreenProp<any, any>;
  dispatch(action: Action): void;
  screenProps: any;
  adverseEventTypes?: Map<string, boolean>;
}

const participantName = "John Doe"; //TODO: read the name out of redux
@connect((state: StoreState) => ({
  adverseEventTypes: state.form!.adverseEventTypes,
}))
export default class AdverseScreen extends React.Component<Props> {
  static navigationOptions = {
    title: "Adverse Events",
  };
  state = {
    adverseEvents: false,
  };
  _onNext = () => {
    if (this.state.adverseEvents) {
      this.props.navigation.push("AdverseDetails");
    } else {
      Alert.alert(
        "Submit?",
        "No adverse events will be recorded for this collection.",
        [
          {
            text: "Cancel",
            onPress: () => {},
          },
          {
            text: "OK",
            onPress: () => {
              this.props.navigation.popToTop();
            },
          },
        ]
      );
    }
  };

  render() {
    return (
      <ScreenContainer>
        <Text style={styles.sectionHeaderText}>
          Were there any adverse events experienced from the last collection for{" "}
          {participantName}?
        </Text>
        <OptionTable
          data={["Yes", "No"]}
          numColumns={1}
          selected={this.state.adverseEvents ? "Yes" : "No"}
          onChange={(answer: string) =>
            this.setState({ adverseEvents: answer === "Yes" })
          }
        />
        {this.state.adverseEvents && (
          <View>
            <Text style={styles.sectionHeaderText}>
              Which procedures had adverse events?
            </Text>
            <OptionList
              data={
                this.props.adverseEventTypes instanceof Map
                  ? this.props.adverseEventTypes
                  : OptionList.emptyMap(["Blood draw", "Nasal swab"])
              }
              numColumns={1}
              multiSelect={true}
              fullWidth={true}
              backgroundColor="#fff"
              onChange={adverseEventTypes =>
                this.props.dispatch(setAdverseEventTypes(adverseEventTypes))
              }
            />
          </View>
        )}
        <View style={styles.buttonView}>
          <Button
            primary={true}
            enabled={
              !this.state.adverseEvents ||
              (this.props.adverseEventTypes instanceof Map
                ? Array.from(this.props.adverseEventTypes.values()).reduce(
                    (result, value) => result || value,
                    false
                  )
                : false)
            }
            label={this.state.adverseEvents ? "Next" : "Submit"}
            onPress={this._onNext}
          />
        </View>
      </ScreenContainer>
    );
  }
}

const styles = StyleSheet.create({
  sectionHeaderText: {
    marginTop: 35,
    marginBottom: 7,
    marginLeft: 15,
    fontSize: 24,
  },
  descriptionText: {
    marginLeft: 15,
    fontSize: 17,
  },
  buttonView: {
    justifyContent: "center",
    alignItems: "center",
  },
});
