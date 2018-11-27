import React from "react";
import {
  Alert,
  ImageEditor,
  ImageStore,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { connect } from "react-redux";
import { Action, setName, setSignaturePng } from "../../../store";
import { CONSENT_FORM_TEXT } from "../../../resources/consentForm";
import { NavigationScreenProp } from "react-navigation";
import { format } from "date-fns";
import * as ExpoPixi from "expo-pixi";
import Button from "./components/Button";
import Description from "./components/Description";
import StatusBar from "./components/StatusBar";
import TextInput from "./components/TextInput";
import Title from "./components/Title";

interface Props {
  dispatch(action: Action): void;
  navigation: NavigationScreenProp<any, any>;
}
interface SnapshotImage {
  height: number;
  width: number;
  uri: string;
}

// @ts-ignore
const remoteDebugging = typeof DedicatedWorkerGlobalScope !== "undefined";

@connect((state: StoreState) => ({
  name: state.form!.name,
}))
export default class ConsentScreen extends React.Component<Props> {
  state = {
    image: null,
  };

  sketch: any;

  _onClear = () => {
    this.sketch.clear();
    this.setState({ image: null });
  };

  _onSubmit = () => {
    if (!this.state.image && !remoteDebugging) {
      Alert.alert(
        "Please sign in the signature box using your fingertip or Apple Pencil."
      );
      return;
    } else if (!!this.state.image) {
      this.saveBase64Async(this.state.image!);
    }
    this.props.navigation.push("Enrolled");
  };

  _onChangeAsync = async () => {
    const image: SnapshotImage = await this.sketch.takeSnapshotAsync({
      format: "png",
    });
    this.setState({ image });
  };

  saveBase64Async = async (image: SnapshotImage) => {
    const cropData = {
      offset: { x: 0, y: 0 },
      size: {
        width: image.width,
        height: image.height,
      },
      displaySize: { width: 600, height: 130 }, // shrink the PNG to this max width and height
      resizeMode: "contain" as "contain", // preserve aspect ratio
    };

    ImageEditor.cropImage(
      image.uri,
      cropData,
      imageURI => {
        ImageStore.getBase64ForTag(
          imageURI,
          (base64Data: string) => {
            console.log(base64Data);
            this.props.dispatch(setSignaturePng(base64Data));
          },
          reason => console.error(reason)
        );
      },
      reason => console.error(reason)
    );

    return true;
  };

  render() {
    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
        <StatusBar
          canProceed={false}
          progressNumber="80%"
          progressLabel="Enrollment"
          title="5. Would you like to take part in a blood collection?"
          onBack={() => this.props.navigation.pop()}
          onForward={this._onSubmit}
        />
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <Title label="Consent" />
          <Description content="Thank you for assisting us with this study. Your informed consent is required for participation. Please read the following statements carefully. Then sign your acknowledgement below." />
          <Text>{CONSENT_FORM_TEXT}</Text>
        </ScrollView>
        <View style={styles.input}>
          <View style={styles.dateContainer}>
            <Text style={styles.text}>
              Today's Date
            </Text>
            <Text style={[styles.text, styles.dateText]}>
              {format(new Date(), "MM/D/YYYY")}
            </Text>
          </View>
          <TextInput
            autoFocus={false}
            placeholder="Full name of subject"
            returnKeyType="done"
            value={this.props.name}
            onChange={text => {
              this.props.dispatch(setName(text));
            }}
          />
        </View>
        <View style={styles.sketchContainer}>
          <ExpoPixi.Signature
            ref={(ref: any) => (this.sketch = ref)}
            style={styles.sketch}
            onChange={this._onChangeAsync}
          />
          <Text style={styles.textHint}>Signature of subject</Text>
        </View>
        <View style={styles.buttonRow}>
          <Button
            enabled={true}
            label="Clear Signature"
            primary={false}
            onPress={this._onClear}
          />
          <Button
            enabled={(!!this.state.image || remoteDebugging) && this.props.name}
            label="Submit"
            primary={true}
            onPress={this._onSubmit}
          />
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    marginHorizontal: 20,
  },
  buttonRow: {
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 30,
  },
  input: {
    marginHorizontal: 30,
  },
  sketch: {
    flex: 1,
    zIndex: 10,
  },
  sketchContainer: {
    height: "14%",
    borderWidth: 1,
    borderRadius: 1,
    borderColor: "#555",
    minHeight: 130,
    marginHorizontal: 30,
    marginTop: 10,
  },
  textHint: {
    color: "#aaa",
    left: 20,
    bottom: 8,
    zIndex: 20,
    position: "absolute",
  },
  dateContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    borderBottomColor: "#bbb",
    borderBottomWidth: StyleSheet.hairlineWidth,
    height: 30,
    marginTop: 20,
    paddingHorizontal: 16,
  },
  dateText: {
    color: "#8E8E93",
  },
  text: {
    alignSelf: "stretch",
    fontSize: 20,
  },
});
