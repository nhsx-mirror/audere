"use strict";
// Copyright (c) 2019 Audere
//
// This program is free software: you can redistribute it and/or modify it
// under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or (at your
// option) any later version.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public
// License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
exports.__esModule = true;
// The following options come from:
// https://www.hl7.org/fhir/valueset-administrative-gender.html
var PatientInfoGender;
(function (PatientInfoGender) {
    PatientInfoGender["Male"] = "male";
    PatientInfoGender["Female"] = "female";
    PatientInfoGender["Other"] = "other";
    PatientInfoGender["Unknown"] = "unknown";
})(PatientInfoGender = exports.PatientInfoGender || (exports.PatientInfoGender = {}));
var TelecomInfoSystem;
(function (TelecomInfoSystem) {
    TelecomInfoSystem["Phone"] = "phone";
    TelecomInfoSystem["SMS"] = "sms";
    TelecomInfoSystem["Email"] = "email";
})(TelecomInfoSystem = exports.TelecomInfoSystem || (exports.TelecomInfoSystem = {}));
var AddressInfoUse;
(function (AddressInfoUse) {
    AddressInfoUse["Home"] = "home";
    AddressInfoUse["Work"] = "work";
    AddressInfoUse["Temp"] = "temp";
})(AddressInfoUse = exports.AddressInfoUse || (exports.AddressInfoUse = {}));
var ConsentInfoSignerType;
(function (ConsentInfoSignerType) {
    ConsentInfoSignerType["Subject"] = "Subject";
    ConsentInfoSignerType["Parent"] = "Parent";
    ConsentInfoSignerType["Representative"] = "Representative";
    ConsentInfoSignerType["Researcher"] = "Researcher";
})(ConsentInfoSignerType = exports.ConsentInfoSignerType || (exports.ConsentInfoSignerType = {}));
