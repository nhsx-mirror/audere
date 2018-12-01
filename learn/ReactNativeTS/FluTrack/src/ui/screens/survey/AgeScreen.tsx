import React from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";
import { NavigationScreenProp } from "react-navigation";
import reduxWriter, { ReduxWriterProps } from "../../../store/ReduxWriter";
import { SymptomsConfig } from "./SymptomsScreen";
import Button from "../../components/Button";
import ContentContainer from "../../components/ContentContainer";
import ScreenContainer from "../../components/ScreenContainer";
import StatusBar from "../../components/StatusBar";
import Title from "../../components/Title";

interface Props {
  navigation: NavigationScreenProp<any, any>;
}

export const AgeBucketConfig = {
  id: 'AgeBucket',
  title: '2. What is the age of the participant?',
  buttons: [
    { key: "18orOver", primary: false },
    { key: "13to17", primary: false },
    { key: "under13", primary: false },
  ],
}

class AgeScreen extends React.Component<Props & WithNamespaces & ReduxWriterProps> {
  _onDone = () => {
    this.props.navigation.push("Symptoms", { data: SymptomsConfig });
  };

  render() {
    const { t } = this.props;
    return (
      <ScreenContainer>
        <StatusBar
          canProceed={!!this.props.getAnswer("selectedButtonKey")}
          progressNumber="20%"
          progressLabel={t("common:statusBar:enrollment")}
          title={t("welcomeFluStudy")}
          onBack={() => this.props.navigation.pop()}
          onForward={this._onDone}
        />
        <ContentContainer>
          <Title label={AgeBucketConfig.title} />
          {AgeBucketConfig.buttons.map(button => (
            <Button
              checked={this.props.getAnswer("selectedButtonKey") === button.key}
              enabled={true}
              key={button.key}
              label={t("surveyButton:" + button.key)}
              onPress={() => {
                this.props.updateAnswer({ selectedButtonKey: button.key });
                this._onDone();
              }}
              primary={button.primary}
            />
          ))}
        </ContentContainer>
      </ScreenContainer>
    );
  }
}

export default reduxWriter(withNamespaces("ageScreen")(AgeScreen));
