import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Address } from "../../store";
import { WithNamespaces, withNamespaces } from "react-i18next";
import KeyboardListener from "react-native-keyboard-listener";
import NumberInput from "./NumberInput";
import StateModal from "./StateModal";
import Text from "./Text";
import TextInput from "./TextInput";
import { BORDER_COLOR, GUTTER, INPUT_HEIGHT, LINK_COLOR } from "../styles";

interface Props {
  value?: Address | null;
  onChange(value: Address): void;
}

interface State {
  keyboardOpen: boolean;
  stateOpen: boolean;
}

class AddressInput extends React.Component<Props & WithNamespaces> {
  address = React.createRef<TextInput>();
  address2 = React.createRef<TextInput>();
  city = React.createRef<TextInput>();
  stateProvince = React.createRef<TextInput>();
  zipcode = React.createRef<NumberInput>();

  state = {
    stateOpen: false,
    keyboardOpen: true,
  };

  render() {
    const { t } = this.props;
    return (
      <View style={styles.container}>
        <KeyboardListener
          onWillShow={() => {
            this.setState({ keyboardOpen: true });
          }}
          onWillHide={() => {
            this.setState({ keyboardOpen: false });
          }}
        />
        <TextInput
          autoCapitalize="words"
          autoCorrect={false}
          autoFocus={true}
          placeholder={
            t("name") + (this.state.keyboardOpen ? "" : t("required"))
          }
          placeholderTextColor={this.state.keyboardOpen ? undefined : "red"}
          returnKeyType="next"
          style={styles.textInput}
          value={this.props.value ? this.props.value!.name : undefined}
          onChangeText={(text: string) => {
            const address = this.props.value || {};
            address.name = text;
            this.props.onChange(address);
          }}
          onSubmitEditing={() => this.address.current!.focus()}
        />
        <TextInput
          autoCapitalize="words"
          autoCorrect={false}
          autoFocus={false}
          placeholder={
            t("streetAddress") + (this.state.keyboardOpen ? "" : t("required"))
          }
          placeholderTextColor={this.state.keyboardOpen ? undefined : "red"}
          ref={this.address}
          returnKeyType="next"
          style={styles.textInput}
          value={this.props.value ? this.props.value!.address : undefined}
          onChangeText={(text: string) => {
            const address = this.props.value || {};
            address.address = text;
            this.props.onChange(address);
          }}
          onSubmitEditing={() => this.address2.current!.focus()}
        />
        <TextInput
          autoCapitalize="words"
          autoCorrect={false}
          autoFocus={false}
          placeholder={t("streetAddress")}
          ref={this.address2}
          returnKeyType="next"
          style={styles.textInput}
          value={this.props.value ? this.props.value!.address2 : undefined}
          onChangeText={(text: string) => {
            const address = this.props.value || {};
            address.address2 = text;
            this.props.onChange(address);
          }}
          onSubmitEditing={() => this.city.current!.focus()}
        />
        <TextInput
          autoCapitalize="words"
          autoCorrect={false}
          placeholder={
            t("city") + (this.state.keyboardOpen ? "" : t("required"))
          }
          placeholderTextColor={this.state.keyboardOpen ? undefined : "red"}
          ref={this.city}
          returnKeyType="next"
          style={styles.textInput}
          value={this.props.value ? this.props.value!.city : undefined}
          onChangeText={(text: string) => {
            const address = this.props.value || {};
            address.city = text;
            this.props.onChange(address);
          }}
          onSubmitEditing={() => {
            this.setState({ stateOpen: true });
          }}
        />
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            style={styles.pickerContainer}
            onPress={() => this.setState({ stateOpen: true })}
          >
            <Text
              content={
                this.props.value && this.props.value.state
                  ? this.props.value.state
                  : t("state")
              }
              style={styles.text}
            />
          </TouchableOpacity>
          <StateModal
            state={
              this.props.value && this.props.value!.state
                ? this.props.value!.state!
                : "WA"
            }
            visible={this.state.stateOpen}
            onDismiss={(state: string) => {
              this.setState({ stateOpen: false });
              const address = this.props.value || {};
              address.state = state;
              this.props.onChange(address);
              this.zipcode.current!.focus();
            }}
          />
          <NumberInput
            placeholder={
              t("zipcode") + (this.state.keyboardOpen ? "" : t("required"))
            }
            placeholderTextColor={this.state.keyboardOpen ? undefined : "red"}
            ref={this.zipcode}
            returnKeyType="next"
            style={[styles.zipcode, styles.textInput]}
            value={this.props.value ? this.props.value!.zipcode : undefined}
            onChangeText={(text: string) => {
              const address = this.props.value || {};
              address.zipcode = text;
              this.props.onChange(address);
            }}
            onSubmitEditing={() => {}}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "stretch",
    marginBottom: GUTTER,
  },
  pickerContainer: {
    borderBottomColor: BORDER_COLOR,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flex: 1,
    height: INPUT_HEIGHT,
    justifyContent: "center",
    padding: GUTTER / 4,
  },
  text: {
    color: LINK_COLOR,
    marginVertical: 0,
  },
  textInput: {
    height: INPUT_HEIGHT,
  },
  zipcode: {
    flex: 1,
    borderLeftColor: BORDER_COLOR,
    borderLeftWidth: StyleSheet.hairlineWidth,
  },
});

export default withNamespaces("addressInput")<Props>(AddressInput);
