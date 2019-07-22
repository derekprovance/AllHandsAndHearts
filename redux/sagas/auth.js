import { takeEvery, call, put, select } from 'redux-saga/effects';
import {
  LOGIN_REQUEST,
  LOGIN_REQUEST_LOADING,
  LOGIN_REQUEST_FAILED,
  REGISTER_REQUEST,
  REGISTER_REQUEST_LOADING,
  SET_AUTH,
  LOGOUT_REQUEST,
  REQUEST_ERROR,
  INITIALIZE_APP_STATE,
  RESET_TO_MAIN,
  RESET_TO_SIGN_IN,
  REGISTER_PUSH_NOTIFICATION,
  CHANGE_PASSWORD,
  CHANGE_PASSWORD_ERROR,
  CHANGE_PASSWORD_SUCCESS,
  CHANGE_PASSWORD_STATUS_RESET,
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
    const { email, password } = action.data;
    const auth = yield call(authorize, {
      email,
      password,
      name,
      isRegistering: false
    });
    //TODO(DEREK) - possible place to save the security token by Amazon
    if (auth && typeof auth === 'object' && auth.attributes) {
      yield put({
        type: SET_AUTH,
        newAuthState: true,
        currentUserId: auth.attributes.email,
        user: auth.attributes
      });
      yield put({ type: RESET_TO_MAIN });
    } else {
      yield put({ type: LOGIN_REQUEST_FAILED, error: 'Login failed.' });
    }
  } catch (e) {
    console.log(e);
    yield put({ type: LOGIN_REQUEST_FAILED, error: e });
  } finally {
    yield put({ type: LOGIN_REQUEST_LOADING, loading: false });
    yield put({ type: LOGIN_REQUEST_FAILED, error: null });
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
    console.log(registerSuccess.user);
    if (
      registerSuccess &&
      typeof registerSuccess === 'object' &&
      registerSuccess.user
    ) {
      //TODO(DEREK) - Need to throw an alert for a successful register
      //TODO(DEREK) - Need to notify user that they will need to confirm their e-mail address
    } else {
      //TODO(DEREK) - Need to throw an alert for a failed successful register
      // Perhaps test here if it fails, that it actually hits this end block
      console.log('If you see this, great. If not, remove else');
    }
    yield put({ type: REGISTER_REQUEST_LOADING, loading: false });
    yield put({ type: RESET_TO_SIGN_IN });
  } catch (e) {
    yield put({ type: REGISTER_REQUEST_LOADING, loading: false });
    yield put({ type: LOGIN_REQUEST_FAILED, error: null });
    yield put({ type: RESET_TO_SIGN_IN });
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

function* saga() {
  yield takeEvery(LOGIN_REQUEST, loginFlow);
  yield takeEvery(REGISTER_REQUEST, registerFlow);
  yield takeEvery(LOGOUT_REQUEST, logoutFlow);
  yield takeEvery(INITIALIZE_APP_STATE, initializeAppState);
  yield takeEvery(CHANGE_PASSWORD, changePasswordFlow);
}
export default saga;
