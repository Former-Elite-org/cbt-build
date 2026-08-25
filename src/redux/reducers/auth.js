// import { academicYear, school } from "../../core/common/selectoption/selectoption";
import {
  AUTH,
  LOADING_LOGIN,
  LOADING_SIGNUP,
  LOGOUT,
  AUTH_ERROR,
  ERRORS,
  SET_SCHOOL_LOCATION,
  SET_ACADEMIC_YEAR,
  SET_SCHOOL_LOCATIONS,
  SET_SELECTED_BRANCH,
} from "../actions/types";

const initialState = {
  authenticated: false,
  user: {},
  admin: {},
  student: {},
  teacher: {},
  loadingLogin: false,
  loadingSignup: false,
  school: {},
  school_location: null,
  school_locations: [],
  academic_year: "",
  classes: [],
  subjects: [],
  requestIsValid: true,
  error: "",
  loadingApp: false,
  item_code: "",
  recoverPhone: { code: "", phone: "" },
  teacher_roles: [],
  academic_calendar: [],
  sections: [],
  class_teachers: [],
  branches: [],
  selected_branch: {},
};

// export default function auth(state = initialState, action=f=>f) {
//   let newState;
//   switch (action.type) {
//     case AUTH:
//       newState = {
//         ...state,
//         user: action.payload?.user,
//         authenticated: true,
//         school: action.payload?.school || state.school,
//         classes: action.payload?.classes || state.classes,
//         subjects: action.payload?.subjects || state.subjects,
//         admin: action.payload?.admin || state.admin,
//         student: action.payload?.student || state.student,
//         school_location: action.payload?.user?.school_location
//       };
//       break;

//     case LOADING_LOGIN:
//       newState = {
//         ...state,
//         loadingLogin: !state.loadingLogin,
//       };
//       break;

//     case ERRORS:
//       newState = {
//         ...state,
//         error: action.payload,
//       };
//       break;

//     case LOADING_SIGNUP:
//       newState = {
//         ...state,
//         loadingSignup: !state.loadingSignup,
//       };
//       break;

//     case AUTH_ERROR:
//       newState = {
//         ...state,
//         error: "",
//       };
//       break;

//       case SET_SCHOOL_LOCATION:
//         newState = {
//           ...state,
//           school_location: action.payload,
//         };
//       break;
//       case SET_ACADEMIC_YEAR:
//       newState = {
//        ...state,
//         academic_year: action.payload,
//       };
//       break;
//     case LOGOUT:
//       newState = {
//         ...state,
//         authenticated: false,
//         user: {},
//         admin: {},
//         school: null,
//         classes: [],
//         subjects: [],
//       };
//       break;

//     default:
//       newState = state;
//   }
//   return newState;
// }
export default function auth(state = initialState, action = {}) {
  let newState;
  switch (action.type) {
    case AUTH:
      newState = {
        ...state,
        user: action.payload?.user,
        authenticated: true,
        school: action.payload?.school || state.school,
        classes: action.payload?.classes || state.classes,
        subjects: action.payload?.subjects || state.subjects,
        admin: action.payload?.admin || state.admin,
        student: action.payload?.student || state.student,
        school_locations:
          action.payload?.school_locations || state.school_locations,
        school_location: action.payload?.user?.school_location,
        academic_calendar: action.payload?.academic_calendar || [],
        teacher_roles: action.payload?.teacher_roles,
        sections: action.payload?.sections || [],
        class_teachers: action.payload?.class_teachers || [],
        selected_branch: Array.isArray(action.payload?.school_locations)
          ? action.payload?.school_locations[0]
          : null, // Set first branch as default
      };
      break;

    case "AUTH_WITH_BRANCH":
      newState = {
        ...state,
        user: action.payload?.user,
        authenticated: true,
        school: action.payload?.school || state.school,
        classes: action.payload?.classes || state.classes,
        subjects: action.payload?.subjects || state.subjects,
        admin: action.payload?.admin || state.admin,
        student: action.payload?.student || state.student,
        school_locations:
          action.payload?.school_locations || state.school_locations,
        school_location: action.payload?.user?.school_location,
        academic_calendar: action.payload?.academic_calendar || [],
        teacher_roles: action.payload?.teacher_roles,
        sections: action.payload?.sections || [],
        class_teachers: action.payload?.class_teachers || [],
        branches: action.payload?.branches || [],
        selected_branch: action.payload?.selected_branch || null,
      };
      break;
    case LOADING_LOGIN:
      newState = {
        ...initialState,
        loadingLogin: !state.loadingLogin,
      };
      break;

    case ERRORS:
      newState = {
        ...state,
        error: action.payload,
      };
      break;

    case LOADING_SIGNUP:
      newState = {
        ...state,
        loadingSignup: !state.loadingSignup,
      };
      break;

    case AUTH_ERROR:
      newState = {
        ...state,
        error: "",
      };
      break;

    case SET_SCHOOL_LOCATION:
      newState = {
        ...state,
        school_location: action.payload,
      };
      break;
    case SET_SCHOOL_LOCATIONS:
      newState = {
        ...state,
        school_locations: action.payload,
      };
      break;
    case SET_ACADEMIC_YEAR:
      newState = {
        ...state,
        academic_calendar: action.payload,
      };
      break;

    case SET_SELECTED_BRANCH:
      newState = {
        ...state,
        selected_branch: action.payload,
      };
      break;
    case LOGOUT:
      newState = {
        ...state,
        authenticated: false,
        user: {},
        admin: {},
        school: null,
        classes: [],
        subjects: [],
      };
      break;

    default:
      newState = state;
  }
  return newState;
}
