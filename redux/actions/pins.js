import {
  GET_PINS_BY_REGION,
  SET_PINS_BY_REGION,
  DELETE_PIN_BY_ID,
  GET_PINS_IMAGE_BY_ID,
  GET_PIN_LOCATION_TYPES
} from './actionTypes';

export const getPinsByRegion = regionId => ({
  type: GET_PINS_BY_REGION,
  regionId
});

export const getPinImageById = pinId => ({
  type: GET_PINS_IMAGE_BY_ID,
  pinId
});

export const setPinByRegion = (regionId, pinData) => ({
  type: SET_PINS_BY_REGION,
  isUpdate: !!pinData.id,
  regionId,
  pinData
});

export const deletePinById = pinId => ({
  type: DELETE_PIN_BY_ID,
  pinId
});

export const getPinLocationTypes = () => ({
  type: GET_PIN_LOCATION_TYPES
});
