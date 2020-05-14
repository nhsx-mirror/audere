// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import { Link, useHistory } from "react-router-dom";
import React, { memo } from "react";
import {
  validateBoxChecked,
  validateName,
  validateZipCode,
} from "../ui/Questionnaire/QuestionnaireValidators";

import Grid from "@material-ui/core/Grid";
import QuestionnaireForm from "../ui/Questionnaire/Questionnaire";
import QuestionnaireInput from "components/ui/Questionnaire/QuestionnaireInput";
import { ROUTE_DEFINITIONS } from "../../routes/routes";
import { START_STEP } from "components/TestRun/TestRunConstants";
import addressStreetTypeAheadFomatter from "./addressStreetTypeAheadFormatter";
import addressTypeAhead from "./addressTypeahead";
import { confirmAlert } from "../../utils/confirmAlert";
import firebase from "firebase/app";
import { getFirebaseApp } from "../Firebase/Firebase";
import getGeoLocationForInput from "components/PlacesAPI/getGeoLocationForInput";
import { getTermsAndConditions } from "../TermsAndConditions/TermsAndConditions";
import { useAuthState } from "react-firebase-hooks/auth";
import { zipCodeFormatter } from "../ui/Questionnaire/QuestionnaireFormatters";

export const PROFILE_CREATION_FORM = "profileCreationForm";

export interface ProfileCreationPanelProps {
  onFormReady: (formReady: boolean) => void;
}

export default memo((props: ProfileCreationPanelProps) => {
  const [auth] = useAuthState(firebase.auth());

  const QuestionnaireFormMemoized = memo(QuestionnaireForm);
  const history = useHistory();
  const { onFormReady } = props;

  return (
    <QuestionnaireFormMemoized
      error={null}
      formId={PROFILE_CREATION_FORM}
      onFormReady={onFormReady}
      onSubmit={async (event, questions) => {
        try {
          event.preventDefault();
          const firebaseApp = getFirebaseApp();
          const profile: any = {};
          Object.getOwnPropertyNames(questions).forEach(fieldname => {
            profile[fieldname] = questions[fieldname].value || null;
          });

          await getGeoLocationForInput(
            [
              questions.address1.value,
              questions.city.value,
              questions.state.value,
              "USA",
            ].join(",")
          )
            .then(results => {
              const result = results[0];

              if (result === undefined) {
                throw Error("No corresponding geolocation found");
              }

              profile.lattitude = result.geometry.location.lat();
              profile.longitude = result.geometry.location.lng();
            })
            .catch(err => {
              throw err;
            });

          const profileDocument = await firebaseApp.addProfileToUser({
            profile: profile,
            userUID: auth!.uid,
          });

          const testRunID = await getFirebaseApp().addTestRunToUserForProfile({
            profileUID: profileDocument.id,
            userUID: auth!.uid,
          });

          const route = { ...ROUTE_DEFINITIONS.PERFORMTEST };
          route.path = route.path
            .replace(":testRunUID", testRunID)
            .replace(":step", START_STEP);
          history.push(route.path);
        } catch (e) {
          confirmAlert("oops", e.message);
        }
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <QuestionnaireInput
            autofill={false}
            error={null}
            formatter={(text: string) => text}
            icon="user"
            label="First Name"
            mandatory={true}
            name="firstname"
            placeholder=""
            type="text"
            validators={[validateName]}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <QuestionnaireInput
            autofill={false}
            error={null}
            formatter={(text: string) => text}
            icon="user"
            label="Last Name"
            mandatory={true}
            name="lastname"
            placeholder=""
            type="text"
            validators={[validateName]}
          />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <QuestionnaireInput
            autofill={false}
            error={null}
            formatter={addressStreetTypeAheadFomatter}
            icon="home"
            label="Street Address"
            mandatory={true}
            name="address1"
            placeholder=""
            type="text"
            validators={[validateName]}
            typeahead={{
              callFunction: addressTypeAhead,
              values: [],
            }}
          />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={6} sm={3}>
          <QuestionnaireInput
            autofill={false}
            error={null}
            formatter={zipCodeFormatter}
            label="ZIP Code"
            mandatory={true}
            name="zipcode"
            placeholder=""
            type="text"
            validators={[validateZipCode]}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <QuestionnaireInput
            autofill={false}
            error={null}
            formatter={(text: string) => text}
            label="State"
            mandatory={true}
            name="state"
            placeholder="Select a State"
            selectOptions={[
              { value: "AL", name: "AL" },
              { value: "AK", name: "AK" },
              { value: "AS", name: "AS" },
              { value: "AZ", name: "AZ" },
              { value: "AR", name: "AR" },
              { value: "CA", name: "CA" },
              { value: "CO", name: "CO" },
              { value: "CT", name: "CT" },
              { value: "DE", name: "DE" },
              { value: "DC", name: "DC" },
              { value: "FM", name: "FM" },
              { value: "FL", name: "FL" },
              { value: "GA", name: "GA" },
              { value: "GU", name: "GU" },
              { value: "HI", name: "HI" },
              { value: "ID", name: "ID" },
              { value: "IL", name: "IL" },
              { value: "IN", name: "IN" },
              { value: "IA", name: "IA" },
              { value: "KS", name: "KS" },
              { value: "KY", name: "KY" },
              { value: "LA", name: "LA" },
              { value: "ME", name: "ME" },
              { value: "MH", name: "MH" },
              { value: "MD", name: "MD" },
              { value: "MA", name: "MA" },
              { value: "MI", name: "MI" },
              { value: "MN", name: "MN" },
              { value: "MS", name: "MS" },
              { value: "MO", name: "MO" },
              { value: "MT", name: "MT" },
              { value: "NE", name: "NE" },
              { value: "NV", name: "NV" },
              { value: "NH", name: "NH" },
              { value: "NJ", name: "NJ" },
              { value: "NM", name: "NM" },
              { value: "NY", name: "NY" },
              { value: "NC", name: "NC" },
              { value: "ND", name: "ND" },
              { value: "MP", name: "MP" },
              { value: "OH", name: "OH" },
              { value: "OK", name: "OK" },
              { value: "OR", name: "OR" },
              { value: "PW", name: "PW" },
              { value: "PA", name: "PA" },
              { value: "PR", name: "PR" },
              { value: "RI", name: "RI" },
              { value: "SC", name: "SC" },
              { value: "SD", name: "SD" },
              { value: "TN", name: "TN" },
              { value: "TX", name: "TX" },
              { value: "UT", name: "UT" },
              { value: "VT", name: "VT" },
              { value: "VI", name: "VI" },
              { value: "VA", name: "VA" },
              { value: "WA", name: "WA" },
              { value: "WV", name: "WV" },
              { value: "WI", name: "WI" },
              { value: "WY", name: "WY" },
            ]}
            type="select"
            validators={[]}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <QuestionnaireInput
            autofill={false}
            error={null}
            formatter={(text: string) => text}
            icon="city"
            label="City"
            mandatory={true}
            name="city"
            placeholder=""
            type="text"
            validators={[]}
          />
        </Grid>
      </Grid>
      <QuestionnaireInput
        autofill={false}
        error={null}
        formatter={(text: string) => text}
        label={
          <>
            I have read and understand the{" "}
            <Link
              to={ROUTE_DEFINITIONS.TERMSANDCONDITIONS.path}
              onClick={event => {
                event.preventDefault();
                confirmAlert(
                  "OpenRDT Terms and Conditions",
                  getTermsAndConditions()
                );
              }}
            >
              terms and conditions
            </Link>
            .
          </>
        }
        mandatory={true}
        name="eula"
        placeholder=""
        type="checkbox"
        validators={[validateBoxChecked]}
      />
    </QuestionnaireFormMemoized>
  );
});
