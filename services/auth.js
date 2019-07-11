import { AsyncStorage } from 'react-native';
import base64 from 'base-64';
import bcrypt from 'react-native-bcrypt';
import isaac from 'isaac';
if (!Uint8Array.prototype.map) {
  Uint8Array.prototype.map = Array.prototype.map;
}
bcrypt.setRandomFallback(len => {
  const buf = new Uint8Array(len);
  return buf.map(() => Math.floor(isaac.random() * 256));
});

// value is of type object, but set as string since AsyncStorage only support strings
export const setCookie = value =>
  AsyncStorage.setItem('FFG_AUTH_STORAGE_KEY', JSON.stringify(value));

export const removeCookie = () =>
  AsyncStorage.removeItem('FFG_AUTH_STORAGE_KEY');

export const isLoggedIn = async () => {
  let loggedIn = false;
  const savedObject = await AsyncStorage.getItem('FFG_AUTH_STORAGE_KEY');
  if (savedObject) {
    const { isLoggedIn } = JSON.parse(savedObject);
    loggedIn = isLoggedIn;
  }
  return loggedIn;
};

export const getValueFromStorage = async key => {
  let value = null;
  const savedObject = await AsyncStorage.getItem('FFG_AUTH_STORAGE_KEY');
  if (savedObject) {
    const data = JSON.parse(savedObject);
    value = data[key];
  }
  return value;
};

export const getFFGCookies = async () => {
  const savedObject = await AsyncStorage.getItem('FFG_AUTH_STORAGE_KEY');
  let value = null;
  if (savedObject) {
    value = JSON.parse(savedObject);
  }
  return value;
};
