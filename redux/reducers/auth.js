import {
  SENDING_REQUEST,
  SET_AUTH,
  LOGIN_REQUEST_LOADING,
  LOGIN_REQUEST_SUCCESS,
  LOGIN_REQUEST_FAILED,
  REGISTER_REQUEST_LOADING,
  REGISTER_REQUEST_SUCCESS,
  REGISTER_REQUEST_FAILED,
  SET_PASSWORD_NEW_ACCOUNT,
  SWITCH_TO_SET_PASSWORD_NEW_ACCOUNT,
  CHANGE_PASSWORD_SUCCESS,
  CHANGE_PASSWORD_ERROR,
  CHANGE_PASSWORD_STATUS_RESET,
  FORGOT_PASSWORD_ERROR,
  FORGOT_PASSWORD_SUCCESS,
  FORGOT_PASSWORD_STATUS_RESET,
  FORGOT_PASSWORD_CODE_FAILURE,
  FORGOT_PASSWORD_CODE_SUCCESS,
  FORGOT_PASSWORD_CODE_STATUS_RESET
} from '../actions/actionTypes';

const INITIAL_STATE = {
  loggedIn: false,
  loading: false,
  currentUserId: '',
  user: {},
  accessToken: ''
};

export const auth = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_AUTH:
      return {
        ...state,
        loggedIn: action.newAuthState,
        currentUserId: action.currentUserId,
        user: action.user
      };
    case 'SET_ACCESS_TOKEN':
      return {
        ...state,
        accessToken: action.accessToken
      };
    case LOGIN_REQUEST_LOADING:
      return { ...state, loading: action.loading };
    case LOGIN_REQUEST_SUCCESS:
      return { ...state, loggedIn: action.newAuthState };
    case LOGIN_REQUEST_FAILED:
      return { ...state, loginError: action.error };

    case REGISTER_REQUEST_LOADING:
      return { ...state, loading: action.loading };
    case REGISTER_REQUEST_SUCCESS:
      return { ...state, registrationStatus: action.registrationStatus };
    case REGISTER_REQUEST_FAILED:
      return { ...state, registerError: action.error };
    case SWITCH_TO_SET_PASSWORD_NEW_ACCOUNT:
      return { ...state, setPass: action.setPass };
    case CHANGE_PASSWORD_SUCCESS:
    case CHANGE_PASSWORD_ERROR:
    case CHANGE_PASSWORD_STATUS_RESET:
      return { ...state, passwordChangeStatus: action.passwordChangeStatus };
    case FORGOT_PASSWORD_ERROR:
    case FORGOT_PASSWORD_SUCCESS:
    case FORGOT_PASSWORD_STATUS_RESET:
      return { ...state, forgotPasswordStatus: action.forgotPasswordStatus };
    case FORGOT_PASSWORD_CODE_FAILURE:
    case FORGOT_PASSWORD_CODE_SUCCESS:
    case FORGOT_PASSWORD_CODE_STATUS_RESET:
      return {
        ...state,
        forgotPasswordCodeStatus: action.forgotPasswordCodeStatus
      };
    default:
      return state;
  }
};

export default auth;
