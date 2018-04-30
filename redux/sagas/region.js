import { takeEvery, call, put } from 'redux-saga/effects';
import {
  GET_REGION_DATA,
  GET_REGION_DATA_LOADING,
  GET_REGION_DATA_RECEIVED,
  GET_REGION_DATA_ERROR,
  GET_PINS_BY_REGION,
  GET_PINS_BY_REGION_RECEIVED,
  GET_PINS_BY_REGION_ERROR,
  SET_PINS_BY_REGION,
  DELETE_PIN_BY_ID
} from '../actions/actionTypes';

import ApiWrapper from '../../services/api';
const Api = new ApiWrapper();

/**
 * Region saga
 */

const getRegionDataHelper = function* getRegionDataHelper() {
  yield put({ type: GET_REGION_DATA_LOADING, loading: true });
  let response;
  try {
    response = yield call(Api.getRegionList);
    return response;
  } catch (error) {
    yield put({ type: GET_REGION_DATA_ERROR, error: error.message });
    return false;
  } finally {
    yield put({ type: GET_REGION_DATA_LOADING, loading: false });
  }
};

const getPinsDataHelper = function* getPinsDataHelper(regionId) {
  try {
    let pinData = yield call(Api.getPinsListByRegion, regionId);
    pinData = pinData.map(pin => {
      const newPin = {
        ...pin,
        photos: [
          'https://www.yayomg.com/wp-content/uploads/2014/04/yayomg-pig-wearing-party-hat.jpg',
          'https://www.yayomg.com/wp-content/uploads/2014/04/yayomg-pig-wearing-party-hat.jpg',
          'https://www.yayomg.com/wp-content/uploads/2014/04/yayomg-pig-wearing-party-hat.jpg',
          'https://www.yayomg.com/wp-content/uploads/2014/04/yayomg-pig-wearing-party-hat.jpg',
          'https://www.yayomg.com/wp-content/uploads/2014/04/yayomg-pig-wearing-party-hat.jpg',
          'https://www.yayomg.com/wp-content/uploads/2014/04/yayomg-pig-wearing-party-hat.jpg'
        ]
      };
      return newPin;
    });
    return pinData;
  } catch (error) {
    console.log(error);
    yield put({ type: GET_REGION_DATA_ERROR, pinError: error.message });
    return false;
  }
};

function* getRegion() {
  // This will now return undefined if no cards are retrieved from Salesforce.
  // Or if the connection was not successful.
  // i.e it will not dispatch a received action, thus no modal will pop up.
  const regionData = yield call(getRegionDataHelper);
  yield put({
    type: GET_REGION_DATA_RECEIVED,
    regionData
  });
}

function* getPinsByRegion(action) {
  const pinData = yield call(getPinsDataHelper, action.regionId);
  yield put({
    type: GET_PINS_BY_REGION_RECEIVED,
    pinData
  });
}

function* setPinDataByRegion(action) {
  const newPin = yield call(
    Api.setPinByRegion,
    action.regionId,
    action.pinData
  );
  console.log('New Pin Added::');
  console.log(newPin);
  yield put({
    type: GET_PINS_BY_REGION,
    regionId: action.regionId
  });
}

function* deletePinDataById(action) {
  yield call(Api.deletePinById, action.pinId);
}

function* saga() {
  yield takeEvery(GET_REGION_DATA, getRegion);
  yield takeEvery(GET_PINS_BY_REGION, getPinsByRegion);
  yield takeEvery(SET_PINS_BY_REGION, setPinDataByRegion);
  yield takeEvery(DELETE_PIN_BY_ID, deletePinDataById);
}
export default saga;
