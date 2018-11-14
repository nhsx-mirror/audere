const comp = "HOUSEHOLD COMPOSITION";
const expo = "HOUSEHOLD EXPOSURE";
const hist = "ILLNESS HISTORY";
const demo = "DEMOGRAPHIC INFORMATION";

export const sectionDescriptions = new Map<string, string>([
  [hist, "Next, we are going to ask you some quesitons about your health."],
  [demo, "Next, we are going to ask you some questions about yourself."],
]);

export const questionnaire = [
  {
    section: comp,
    data: {
      id: "WhereLive",
      conditionalNext: {
        options: new Map([
          ["House", "Bedrooms"],
          ["Apartment", "Bedrooms"],
          ["Shelter", "BedAssignment"],
        ]),
      },
      nextQuestion: "Address",
      title: "Where do you live?",
      optionList: {
        options: [
          "House",
          "Shelter",
          "Apartment",
          "Dormitory",
          "Assisted living",
          "Skilled nursing center",
          "None of the above",
        ],
        multiSelect: false,
      },
      buttons: [
        { label: "Done", primary: true, enabled: "withOption" },
        { label: "Prefer Not to Say", primary: false, enabled: true },
      ],
    },
  },
  {
    section: comp,
    data: {
      id: "Bedrooms",
      nextQuestion: "Address",
      title: "How many bedrooms do you have?",
      optionList: {
        options: [
          "1 bedroom",
          "2 bedrooms",
          "3 bedrooms",
          "4 bedrooms",
          "More than 4 bedrooms",
        ],
        multiSelect: false,
      },
      buttons: [
        { label: "Done", primary: true, enabled: "withOption" },
        { label: "Prefer Not to Say", primary: false, enabled: true },
      ],
    },
  },
  {
    section: comp,
    data: {
      id: "BedAssignment",
      nextQuestion: "Address",
      title: "What is your bed assignment?",
      textInput: {
        placeholder: "Bed assignment",
      },
      buttons: [
        { label: "Done", primary: true, enabled: "withText" },
        { label: "Do Not Know", primary: false, enabled: true },
        { label: "Prefer Not to Say", primary: false, enabled: true },
      ],
    },
  },
  {
    section: comp,
    data: {
      id: "Address",
      nextQuestion: "ExpoDesc",
      title: "What is your current address?",
      addressInput: {
        showLocationField: false,
      },
      buttons: [
        { label: "Done", primary: true, enabled: "withAddress" },
        { label: "Do Not Know", primary: false, enabled: true },
        { label: "Prefer Not to Say", primary: false, enabled: true },
      ],
    },
  },
  {
    section: expo,
    data: {
      id: "ExpoDesc",
      nextQuestion: "NearSickPeople",
      description:
        "Next, we are going to ask you some questions about people you may have been in contact with. For the purposes of this study, we define contact as physical touching between you and another person, or being within 6 feet of another person for at least two minutes. As a reference, 6 feet is approximately 2 rows of a city bus.",
      buttons: [{ label: "I understand", primary: true, enabled: true }],
    },
  },
  {
    section: expo,
    data: {
      id: "NearSickPeople",
      conditionalNext: {
        buttonLabels: new Map([["Yes", "CoughSneeze"]]),
      },
      nextQuestion: "NearChildren",
      title:
        "In the past week, have you been around a person who seemed to have a cold?",
      buttons: [
        { label: "Yes", primary: true, enabled: true },
        { label: "No", primary: true, enabled: true },
        { label: "Do Not Know", primary: false, enabled: true },
        { label: "Prefer Not to Say", primary: false, enabled: true },
      ],
    },
  },
  {
    section: expo,
    data: {
      id: "CoughSneeze",
      nextQuestion: "NearChildren",
      title: "Were they coughing or sneezing?",
      buttons: [
        { label: "Yes", primary: true, enabled: true },
        { label: "No", primary: true, enabled: true },
        { label: "Prefer Not to Say", primary: false, enabled: true },
      ],
    },
  },
  {
    section: expo,
    data: {
      id: "NearChildren",
      nextQuestion: "ChildrenNearChildren",
      title:
        "In the past week, have you been in contact with any children under 5 years of age for over an hour?",
      optionList: {
        options: ["1 child", "2-5 children", "More than 5 children", "None"],
        multiSelect: false,
      },
      buttons: [
        { label: "Done", primary: true, enabled: "withOption" },
        { label: "Do Not Know", primary: false, enabled: true },
        { label: "Prefer Not to Say", primary: false, enabled: true },
      ],
    },
  },
  {
    section: expo,
    data: {
      id: "ChildrenNearChildren",
      nextQuestion: "Smoke",
      title:
        "Do any children in your household attend a school, childcare setting, or play group with at least 3 other children for 3 or more hours / week?",
      buttons: [
        { label: "Yes", primary: true, enabled: true },
        { label: "No", primary: true, enabled: true },
        { label: "Do Not Know", primary: false, enabled: true },
        { label: "Prefer Not to Say", primary: false, enabled: true },
      ],
    },
  },
  {
    section: expo,
    data: {
      id: "Smoke",
      nextQuestion: "HouseholdSmoke",
      title: "Do you smoke tobacco, marijuana, or vape?",
      buttons: [
        { label: "Yes", primary: true, enabled: true },
        { label: "No", primary: true, enabled: true },
        { label: "Prefer Not to Say", primary: false, enabled: true },
      ],
    },
  },
  {
    section: expo,
    data: {
      id: "HouseholdSmoke",
      adminConditionalNext: [
        // TODO: read location from admin settings
        // if cruise ship or whatever, "ArrivedFrom"
      ],
      nextQuestion: "RecentTravel",
      title: "Does anyone in your house smoke?",
      buttons: [
        { label: "Yes", primary: true, enabled: true },
        { label: "No", primary: true, enabled: true },
        { label: "Prefer Not to Say", primary: false, enabled: true },
      ],
    },
  },
  {
    section: expo,
    data: {
      id: "ArrivedFrom",
      // TODO: figure out how to determine if they arrived from outside of wa,
      // add conditional next if within to RecentTravel default to TimeSpent
      nextQuestion: "RecentTravel",
      title: "Where have you arrived from?",
      textInput: {
        placeholder: "City",
      },
      buttons: [
        { label: "Done", primary: true, enabled: "withText" },
        { label: "Do Not Know", primary: false, enabled: true },
        { label: "Prefer Not to Say", primary: false, enabled: true },
      ],
    },
  },
  {
    section: expo,
    data: {
      id: "RecentTravel",
      nextQuestion: "TimeSpent",
      title: "Where have you travelled in the last week?",
      optionList: {
        options: [
          "Within Washington State only",
          "To another US state",
          "To another country",
        ],
        multiSelect: true,
      },
      buttons: [
        { label: "Done", primary: true, enabled: "withOption" },
        { label: "Do Not Know", primary: false, enabled: true },
        { label: "Prefer Not to Say", primary: false, enabled: true },
      ],
    },
  },
  {
    section: expo,
    data: {
      id: "TimeSpent",
      conditionalNext: {
        options: new Map([["Work", "Occupation"], ["School", "SchoolName"]]),
      },
      nextQuestion: "NumPeople",
      title:
        "Over the last 4 weeks and when you are awake, where have you spent the majority of your time?",
      optionList: {
        options: ["Work", "School", "Home", "Other"],
        multiSelect: false,
      },
      buttons: [
        { label: "Done", primary: true, enabled: "withOption" },
        { label: "Prefer Not to Say", primary: false, enabled: true },
      ],
    },
  },
  {
    section: expo,
    data: {
      id: "Occupation",
      nextQuestion: "WorkAddress",
      title: "What is your occupation?",
      textInput: {
        placeholder: "Occupation",
      },
      buttons: [
        { label: "Done", primary: true, enabled: "withText" },
        { label: "Prefer Not to Say", primary: false, enabled: true },
      ],
    },
  },
  {
    section: expo,
    data: {
      id: "WorkAddress",
      nextQuestion: "HoursWorked",
      title: "Where do you work?",
      addressInput: {
        showLocationField: true,
      },
      buttons: [
        { label: "Done", primary: true, enableD: "withAddress" },
        { label: "Prefer Not to Say", primary: false, enabled: true },
      ],
    },
  },
  {
    section: expo,
    data: {
      id: "HoursWorked",
      nextQuestion: "NumPeople",
      title: "How many hours worked per day?",
      numberInput: {
        placeholder: "Number of hours",
      },
      buttons: [
        { label: "Done", primary: true, enabled: "withNumber" },
        { label: "Prefer Not to Say", primary: false, enabled: true },
      ],
    },
  },
  {
    section: expo,
    data: {
      id: "SchoolName",
      nextQuestion: "SchoolType",
      title: "What is the name of your school?",
      textInput: {
        placeholder: "School name",
      },
      buttons: [
        { label: "Done", primary: true, enabled: "withText" },
        { label: "Prefer Not to Say", primary: false, enabled: true },
      ],
    },
  },
  {
    section: expo,
    data: {
      id: "SchoolType",
      nextQuestion: "NumPeople",
      title: "What type of school do you attend?",
      optionList: {
        options: [
          "Elementary",
          "Middle",
          "High school",
          "College/university",
          "Trade school",
          "Other",
        ],
        multiSelect: true,
        numColumns: 2,
      },
      buttons: [
        { label: "Done", primary: true, enabled: "withOption" },
        { label: "Prefer Not to Say", primary: false, enabled: true },
      ],
    },
  },
  {
    section: expo,
    data: {
      id: "NumPeople",
      nextQuestion: "FluShot",
      title:
        "During a normal day, how many people are you around (within 6 feet for more than 2 minutes)?",
      optionList: {
        options: ["1-5 people", "6-10 people", "More than 10 people"],
        multiSelect: false,
      },
      buttons: [
        { label: "Done", primary: true, enabled: "withOption" },
        { label: "Do Not Know", primary: false, enabled: true },
        { label: "Prefer Not to Say", primary: false, enabled: true },
      ],
    },
  },
  {
    section: hist,
    data: {
      id: "FluShot",
      conditionalNext: {
        buttonLabels: new Map([["Yes", "VaccineDate"]]),
      },
      nextQuestion: "FirstSick",
      title: "Did you get a flu shot in the last year?",
      buttons: [
        { label: "Yes", primary: true, enabled: true },
        { label: "No", primary: true, enabled: true },
        { label: "Do Not Know", primary: false, enabled: true },
        { label: "Prefer Not to Say", primary: false, enabled: true },
      ],
    },
  },
  {
    section: hist,
    data: {
      id: "VaccineDate",
      nextQuestion: "FirstSick",
      title: "What was the date of vaccination?",
      // TODO date picker, month/year
      buttons: [
        { label: "Done", primary: true, enabled: "withDate" },
        { label: "Do Not Know", primary: false, enabled: true },
        { label: "Prefer Not to Say", primary: false, enabled: true },
      ],
    },
  },
  {
    section: hist,
    data: {
      id: "FirstSick",
      nextQuestion: "Antibiotics",
      title: "What day did you start to feel sick?",
      // todo date picker, month/day/year
      buttons: [{ label: "Done", primary: true, enabled: "withDate" }],
    },
  },
  {
    section: hist,
    data: {
      id: "Antibiotics",
      nextQuestion: "Antivirals",
      title: "Did you take antibiotics for this current illness/cold?",
      buttons: [
        { label: "Yes", primary: true, enabled: true },
        { label: "No", primary: true, enabled: true },
        { label: "Prefer Not to Say", primary: false, enabled: true },
      ],
    },
  },
  {
    section: hist,
    data: {
      id: "Antivirals",
      nextQuestion: "DailyInterference",
      title:
        "Did you take an antiviral (like tamiflu) for this current illness/cold?",
      buttons: [
        { label: "Yes", primary: true, enabled: true },
        { label: "No", primary: true, enabled: true },
        { label: "Prefer Not to Say", primary: false, enabled: true },
      ],
    },
  },
  {
    section: hist,
    data: {
      id: "DailyInterference",
      nextQuestion: "DoctorThisWeek",
      title:
        "Is your cold stopping you from doing things you would usually do?",
      buttons: [
        { label: "Yes, a lot", primary: true, enabled: true },
        { label: "Yes, a little", primary: true, enabled: true },
        { label: "No", primary: true, enabled: true },
        { label: "Prefer Not to Say", primary: false, enabled: true },
      ],
    },
  },
  {
    section: hist,
    data: {
      id: "DoctorThisWeek",
      nextQuestion: "DoctorThisYear",
      title: "Have you seen a doctor for your cold this week?",
      buttons: [
        { label: "Yes", primary: true, enabled: true },
        { label: "No", primary: true, enabled: true },
        { label: "Prefer Not to Say", primary: false, enabled: true },
      ],
    },
  },
  {
    section: hist,
    data: {
      id: "DoctorThisYear",
      nextQuestion: "AssignedSex",
      title:
        "In the last year, how many times have you been to a doctor for a cough or a cold?",
      optionList: {
        options: ["1-5 times", "6-10 times", "More than 10 times", "None"],
        multiSelect: false,
      },
      buttons: [
        { label: "Done", primary: true, enabled: "withOption" },
        { label: "Do Not Know", primary: false, enabled: true },
        { label: "Prefer Not to Say", primary: false, enabled: true },
      ],
    },
  },
  {
    section: demo,
    data: {
      id: "AssignedSex",
      conditionalNext: {
        buttonLabels: new Map([["Female", "Pregnant"]]),
      },
      nextQuestion: "Race",
      title: "What was your assigned sex at birth?",
      buttons: [
        { label: "Male", primary: true, enabled: true },
        { label: "Female", primary: true, enabled: true },
        { label: "Prefer Not to Say", primary: false, enabled: true },
      ],
    },
  },
  {
    section: demo,
    data: {
      id: "Pregnant",
      nextQuestion: "Race",
      title: "Are you currently pregnant?",
      buttons: [
        { label: "Yes", primary: true, enabled: true },
        { label: "No", primary: true, enabled: true },
        { label: "Prefer Not to Say", primary: false, enabled: true },
      ],
    },
  },
  {
    section: demo,
    data: {
      id: "Race",
      nextQuestion: "HispanicLatino",
      title: "How would you describe your race",
      description: "Please select all that apply",
      optionList: {
        options: [
          "American Indian or Alaska Native",
          "Asian",
          "Native Hawaiian or Other Pacific Islander",
          "Black or African American",
          "White",
          "Other",
        ],
        multiSelect: true,
      },
      // TODO conditional text input on other
      // textInput: { placeholder: "Please specify" }
      buttons: [
        { label: "Done", primary: true, enabled: "withOption" },
        { label: "Prefer Not to Say", primary: false, enabled: true },
      ],
    },
  },
  {
    section: demo,
    data: {
      id: "HispanicLatino",
      nextQuestion: "MedicalInsurance",
      title: "Are you Hispanic or Latino?",
      buttons: [
        { label: "Yes", primary: true, enabled: true },
        { label: "No", primary: true, enabled: true },
        { label: "Prefer Not to Say", primary: false, enabled: true },
      ],
    },
  },
  {
    section: demo,
    data: {
      id: "MedicalInsurance",
      title: "Do you have medical insurance?",
      description: "Please select all that apply.",
      optionList: {
        options: ["None", "Medicaid", "Private insurance", "Medicare", "Other"],
        multiSelect: true,
      },
      // TODO conditional text input on other
      // textInput: { placeholder: "Please specify" }
      buttons: [
        { label: "Done", primary: true, enabled: "withOption" },
        { label: "Do Not Know", primary: false, enabled: true },
        { label: "Prefer Not to Say", primary: false, enabled: true },
      ],
    },
  },
];
