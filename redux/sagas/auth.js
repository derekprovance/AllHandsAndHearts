import { takeEvery, call, put, select } from 'redux-saga/effects';
import {
  LOGIN_REQUEST,
  LOGIN_REQUEST_LOADING,
  LOGIN_REQUEST_FAILED,
  REGISTER_REQUEST,
  REGISTER_REQUEST_LOADING,
  REGISTER_REQUEST_SUCCESS,
  REGISTER_REQUEST_FAILED,
  SET_AUTH,
  LOGOUT_REQUEST,
  REQUEST_ERROR,
  INITIALIZE_APP_STATE,
  RESET_TO_MAIN,
  RESET_TO_SIGN_IN,
  REGISTER_PUSH_NOTIFICATION,
  SET_PASSWORD_NEW_ACCOUNT,
  SWITCH_TO_SET_PASSWORD_NEW_ACCOUNT,
  CHANGE_PASSWORD,
  CHANGE_PASSWORD_ERROR,
  CHANGE_PASSWORD_SUCCESS,
  CHANGE_PASSWORD_STATUS_RESET,
  FORGOT_PASSWORD,
  FORGOT_PASSWORD_ERROR,
  FORGOT_PASSWORD_SUCCESS,
  FORGOT_PASSWORD_STATUS_RESET,
  FORGOT_PASSWORD_CODE,
  FORGOT_PASSWORD_CODE_FAILURE,
  FORGOT_PASSWORD_CODE_SUCCESS,
  FORGOT_PASSWORD_CODE_STATUS_RESET,
  LOGOUT_REQUEST_SUCCESS
} from '../actions/actionTypes';
import { purgeStoredState } from 'redux-persist';
import ApiWrapper from '../../services/api';
import persistConfig from '../persistConfig';
const Api = new ApiWrapper();

const getState = state => state;

const authorize = function* authorize({
  email,
  password,
  name,
  isRegistering = false
}) {
  try {
    yield put({
      type: REGISTER_PUSH_NOTIFICATION
    });
    let response;
    if (isRegistering) {
      response = yield call(Api.register, email, password, name);
    } else {
      response = yield call(Api.login, email, password);
    }
    return response;
  } catch (error) {
    console.log(error);
    yield put({ type: REQUEST_ERROR, error: error.message });
    return false;
  }
};
const logout = function* logout() {
  try {
    yield call(Api.logout);
    yield call(purgeStoredState, persistConfig());
    yield put({ type: LOGOUT_REQUEST_SUCCESS });
    yield put({ type: RESET_TO_SIGN_IN });
  } catch (error) {
    yield put({ type: REQUEST_ERROR, error: error.message });
    return false;
  }
};

function* loginFlow(action) {
  yield put({ type: LOGIN_REQUEST_LOADING, loading: true });
  try {
    const { email, password, name } = action.data;
    const auth = yield call(authorize, {
      email,
      password,
      name,
      isRegistering: false
    });

    if (auth.challengeName === 'NEW_PASSWORD_REQUIRED') {
      yield put({
        type: SET_AUTH,
        newAuthState: false,
        cognitoUser: auth
      });
      yield put({ type: SWITCH_TO_SET_PASSWORD_NEW_ACCOUNT, setPass: true });
    } else if (auth && typeof auth === 'object' && auth.attributes) {
      //TODO(DEREK) - possible place to save the security token by Amazon
      yield put({
        type: SET_AUTH,
        newAuthState: true,
        currentUserId: auth.attributes.email,
        user: auth.attributes
      });
      yield put({ type: RESET_TO_MAIN });
    } else {
      yield put({ type: LOGIN_REQUEST_FAILED, error: auth.message });
    }
  } catch (e) {
    yield put({ type: LOGIN_REQUEST_FAILED, error: e });
  } finally {
    yield put({ type: LOGIN_REQUEST_LOADING, loading: false });
    yield put({ type: LOGIN_REQUEST_FAILED, error: null });
    yield put({ type: SET_PASSWORD_NEW_ACCOUNT, setPass: false });
  }
}

function* setPasswordNewAccount(action) {
  //TODO(DEREK) - create success and failure enums
  //TODO(DEREK) - handle this not being saved on resume
  //TODO(DEREK) - look into cleaning this
  try {
    const { user, password, attributes } = action.data;
    const auth = yield call(Api.completePassword, user, password, attributes);
    console.log(auth);
    //TODO(DEREK) - handle fail case
    //TODO(DEREK) - possible place to save the security token by Amazon
    yield put({ type: RESET_TO_LOGIN });
  } catch (e) {
    //TODO(DEREK) - Handle dire fail case
  }
}

function* logoutFlow() {
  yield put({ type: SET_AUTH, newAuthState: false });
  yield call(logout);
}

function* registerFlow(action) {
  const { email, password, name } = action.data;
  yield put({ type: REGISTER_REQUEST_LOADING, loading: true });
  try {
    const registerSuccess = yield call(authorize, {
      email,
      password,
      name,
      isRegistering: true
    });
    if (
      registerSuccess &&
      typeof registerSuccess === 'object' &&
      registerSuccess.user
    ) {
      yield put({
        type: REGISTER_REQUEST_SUCCESS,
        registrationStatus:
          'An e-mail has been sent to you. Please click the link to activate your account.'
      });
      yield put({ type: REGISTER_REQUEST_LOADING, loading: false });
      yield put({ type: RESET_TO_SIGN_IN });
    } else {
      switch (registerSuccess.code) {
        case 'NotAuthorizedException':
          errorMessage =
            'User Registration is disabled. Please contact your administrator.';
          break;
        default:
          errorMessage = registerSuccess.message;
      }
      yield put({ type: REGISTER_REQUEST_LOADING, loading: false });
      yield put({ type: REGISTER_REQUEST_FAILED, error: errorMessage });
    }
  } catch (e) {
    yield put({ type: REGISTER_REQUEST_LOADING, loading: false });
    yield put({ type: REGISTER_REQUEST_FAILED, error: e.message });
  } finally {
    yield put({ type: REGISTER_REQUEST_SUCCESS, registrationStatus: null });
    yield put({ type: REGISTER_REQUEST_FAILED, error: null });
  }
}

function* initializeAppState(action) {
  try {
    const state = yield select(getState);
    if (state.auth.loggedIn) {
      yield put({ type: RESET_TO_MAIN });
    }
    const SFHelper = yield Api.getSFHelper();
    if (!state.auth.accessToken) {
      const token = yield SFHelper.setToken();
      yield put({
        type: 'SET_ACCESS_TOKEN',
        accessToken: token
      });
    } else {
      let parsedDate = state.auth.accessToken.LastModifiedDate.split('+')[0];
      let tokenGeneratedTime = new Date(parsedDate);
      const currentTime = new Date();
      const diffTime =
        (currentTime.getTime() - tokenGeneratedTime.getTime()) /
        (1000 * 3600 * 24);
      const isLessThan24Hours = diffTime <= 1;
      if (isLessThan24Hours) {
        yield call(SFHelper.setPersistedToken, state.auth.accessToken.token__c);
      } else {
        const token = yield SFHelper.setToken();
        yield put({
          type: 'SET_ACCESS_TOKEN',
          accessToken: token
        });
      }
    }
  } catch (e) {
    yield put({ type: RESET_TO_SIGN_IN });
  }
}

function* changePasswordFlow(action) {
  try {
    const { oldPassword, newPassword } = action.data;
    const status = yield call(Api.changePassword, oldPassword, newPassword);

    if (status == true) {
      yield put({
        type: CHANGE_PASSWORD_SUCCESS,
        passwordChangeStatus: 'Password changed successfully!'
      });
    } else {
      yield put({
        type: CHANGE_PASSWORD_ERROR,
        passwordChangeStatus: status.code
          ? status.message
          : 'Error changing password.'
      });
    }
  } catch (e) {
    console.log(e);
    yield put({
      type: CHANGE_PASSWORD_ERROR,
      passwordChangeStatus: e
    });
  } finally {
    yield put({
      type: CHANGE_PASSWORD_STATUS_RESET,
      passwordChangeStatus: ''
    });
  }
}

function* forgotPasswordFlow(action) {
  try {
    const { email } = action.data;
    const status = yield call(Api.forgotPassword, email);

    if (status.code) {
      yield put({
        type: FORGOT_PASSWORD_ERROR,
        forgotPasswordStatus: status.message
      });
    } else {
      yield put({
        type: FORGOT_PASSWORD_SUCCESS,
        forgotPasswordStatus: true
      });
    }
  } catch (e) {
    console.log(e);
    yield put({
      type: FORGOT_PASSWORD_ERROR,
      forgotPasswordStatus: e.message
    });
  } finally {
    yield put({
      type: FORGOT_PASSWORD_STATUS_RESET,
      forgotPasswordStatus: null
    });
  }
}

function* forgotPasswordCodeFlow(action) {
  try {
    const { email, code, password } = action.data;
    const status = yield call(Api.forgotPasswordCode, email, code, password);

    if (status != undefined && status.code) {
      yield put({
        type: FORGOT_PASSWORD_CODE_FAILURE,
        forgotPasswordCodeStatus: status.message
      });
    } else {
      yield put({
        type: FORGOT_PASSWORD_CODE_SUCCESS,
        forgotPasswordCodeStatus: true
      });
    }
  } catch (e) {
    console.log(e);
  } finally {
    yield put({
      type: FORGOT_PASSWORD_CODE_STATUS_RESET,
      forgotPasswordCodeStatus: null
    });
  }
}

function* saga() {
  yield takeEvery(LOGIN_REQUEST, loginFlow);
  yield takeEvery(REGISTER_REQUEST, registerFlow);
  yield takeEvery(LOGOUT_REQUEST, logoutFlow);
  yield takeEvery(INITIALIZE_APP_STATE, initializeAppState);
  yield takeEvery(CHANGE_PASSWORD, changePasswordFlow);
  yield takeEvery(FORGOT_PASSWORD, forgotPasswordFlow);
  yield takeEvery(FORGOT_PASSWORD_CODE, forgotPasswordCodeFlow);
  yield takeEvery(SET_PASSWORD_NEW_ACCOUNT, setPasswordNewAccount);
}
export default saga;
