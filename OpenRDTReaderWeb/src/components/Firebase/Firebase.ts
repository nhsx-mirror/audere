// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import "firebase/auth";
import "firebase/database";
import "firebase/firestore";
import "firebase/storage";

import { TestRunStep, UserInterpretation } from "./FirebaseTypes";

import { START_STEP } from "components/TestRun/TestRunConstants";
import { SYMPTOMS } from "components/SymptomsChecker/SymptomsConstants";
import firebase from "firebase/app";
import { uuid } from "uuidv4";

const firebaseConfig = {
  apiKey: "AIzaSyDix_0UwjpSwBb2NzRRnJhasWY-_4Npo1s",
  authDomain: "openrdt-dashboard-staging.firebaseapp.com",
  databaseURL: "https://openrdt-dashboard-staging.firebaseio.com",
  projectId: "openrdt-dashboard-staging",
  storageBucket: "openrdt-dashboard-staging.appspot.com",
  messagingSenderId: "676539890487",
  appId: "1:676539890487:web:2f528e64922df0f71e38b2",
};

interface Firebase {
  auth: firebase.auth.Auth;
  firestore: firebase.firestore.Firestore;
  storage: firebase.storage.Storage;
}

class Firebase {
  constructor() {
    firebase.initializeApp(firebaseConfig);
    this.auth = firebase.auth();
    this.firestore = firebase.firestore();
    this.storage = firebase.storage();
  }

  /**
   * Authentication Calls
   **/

  ceateUserWithEmailAndPassword = (
    email: string,
    password: string
  ): Promise<firebase.auth.UserCredential> =>
    this.auth.createUserWithEmailAndPassword(email, password);

  signInWithEmailAndPassword = (
    email: string,
    password: string
  ): Promise<firebase.auth.UserCredential> =>
    this.auth.signInWithEmailAndPassword(email, password);

  signOut = (): Promise<void> => this.auth.signOut();

  passwordReset = (email: string): Promise<void> =>
    this.auth.sendPasswordResetEmail(email);

  /**
   * Profile Accessors
   */

  getUserDocument = (userUID: string) =>
    firebaseApp.firestore.collection("users").doc(userUID);

  addProfileToUser = async (params: { profile: any; userUID: string }) => {
    return this.getUserDocument(params.userUID)
      .collection("profiles")
      .add(params.profile);
  };

  getUserProfileCollection = (userUID: string) =>
    this.getUserDocument(userUID).collection("profiles");

  addCompletedTestToProfile = async (params: {
    profileUID: string;
    testRunUID: string;
    userUID: string;
  }) =>
    this.getUserProfileCollection(params.userUID)
      .doc(params.profileUID)
      .update({
        lastCompletedTest: params.testRunUID,
      });

  /**
   * TestRuns Accessors
   */

  getUserTestRunCollection = (userUID: string) => {
    return this.getUserDocument(userUID).collection("testruns");
  };

  getUserTestRunByID = (params: { userUID: string; testRunUID: string }) =>
    this.getUserTestRunCollection(params.userUID).doc(params.testRunUID);

  getTestRunStep = async (params: {
    step: string;
    testRunUID: string;
    userUID: string;
  }): Promise<TestRunStep | null> => {
    const testRun = this.getUserTestRunByID(params);
    const testRunSnapshot = await testRun.get();
    const testRunData = testRunSnapshot.data();
    const steps = testRunData!.steps || {};

    if (params.step in steps) {
      return steps[params.step];
    } else {
      return null;
    }
  };

  addTestRunToUserForProfile = async (params: {
    profileUID: string;
    userUID: string;
  }) => {
    const newTestRun = await this.getUserTestRunCollection(params.userUID).add({
      lastStep: START_STEP,
      timestamp: Date.now(),
      profileUID: params.profileUID,
      steps: {},
    });
    const testRunUID = newTestRun.id;
    await newTestRun.update({
      uid: testRunUID,
    });
    return testRunUID;
  };

  updateTestRunStepTimestamp = async (params: {
    step: string;
    testRunUID: string;
    userUID: string;
  }) => {
    const testRun = this.getUserTestRunByID(params);
    const testRunSnapshot = await testRun.get();
    const testRunData = testRunSnapshot.data();
    const steps = testRunData!.steps || {};
    const now = Date.now();

    if (steps[params.step] === undefined) {
      steps[params.step] = {
        firstVisitedTime: now,
      };
    }
    steps[params.step].lastVisitedTime = now;

    testRun.update({
      lastStep: params.step,
      steps: steps,
      timestamp: now,
    });
  };

  updateTestRunProfileUID = async (params: {
    profileUID: string;
    testRunUID: string;
    userUID: string;
  }) =>
    this.getUserTestRunByID(params).update({
      profileUID: params.profileUID,
    });

  updateTestRunSymptomsList = async (params: {
    reportedSymptoms: { [name: string]: boolean };
    testRunUID: string;
    userUID: string;
  }) => {
    this.getUserTestRunByID(params).update({
      reportedSymptoms: SYMPTOMS.reduce((acc, symptom) => {
        if (params.reportedSymptoms[symptom.name]) {
          acc[symptom.name] = params.reportedSymptoms[symptom.name];
        }
        return acc;
      }, {}),
    });
  };

  updateTestRunUserInterpretation = async (params: {
    userInterpretation: UserInterpretation;
    testRunUID: string;
    userUID: string;
  }) =>
    this.getUserTestRunByID(params).set(
      {
        userInterpretation: params.userInterpretation,
      },
      { merge: true }
    );

  /**
   * Photo Accessors
   */
  uploadPhoto = async (params: {
    imageAsFile?: File | null;
    imageAsURI?: string;
    testRunUID: string;
    userUID: string;
    onError?: (err: Error) => void;
    onFileUploadProgress?: (
      snapshot: firebase.storage.UploadTaskSnapshot
    ) => void;
    onFileUploadComplete: (params: { imgUrl: string }) => void;
  }) => {
    const {
      imageAsFile,
      imageAsURI,
      testRunUID,
      onError,
      onFileUploadComplete,
      onFileUploadProgress,
    } = params;
    if (!imageAsFile && !imageAsURI) {
      throw Error("uploadPhoto needs either a File or a dataURI");
    }
    const filename = uuid();
    const ref = this.storage.ref(`/images/${testRunUID}/${filename}`);
    let uploadTask;
    if (imageAsFile) {
      uploadTask = ref.put(imageAsFile);
    } else {
      uploadTask = ref.putString(imageAsURI!, "data_url");
    }
    //initiates the firebase side uploading
    uploadTask.on(
      "state_changed",
      (snapShot: firebase.storage.UploadTaskSnapshot) => {
        onFileUploadProgress && onFileUploadProgress(snapShot);
      },
      (err: Error) => {
        console.log("Error File during Upload", err);
        onError && onError(err);
      },
      async () => {
        const firebaseUrl = await this.storage
          .ref(`images/${testRunUID}`)
          .child(`${filename}`)
          .getDownloadURL();
        await this.getUserTestRunByID(params).update({
          photoResultURL: firebaseUrl,
          // TODO: actually validate the results.
          testresult: true,
        });
        onFileUploadComplete({ imgUrl: firebaseUrl });
      }
    );
  };
}

let firebaseApp: Firebase;

export const getFirebaseApp = (): Firebase => {
  if (!firebaseApp) {
    firebaseApp = new Firebase();
  }
  return firebaseApp;
};

export default Firebase;
