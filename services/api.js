import { SalesforceApiWrapper } from '../utils/utils';
import { Auth } from 'aws-amplify';
const SalesforceApi = new SalesforceApiWrapper();

export default class Api {
  /**
   * Region related Apis
   */
  getRegionList = async () => {
    return await SalesforceApi.get('/regions');
  };
  getPinsListByRegion = async regionId => {
    const queryEndpoint = `/pins/${regionId}`;
    return await SalesforceApi.get(queryEndpoint);
  };
  getRegionById = async regionId => {
    const queryEndPoint = `/getRegion/${regionId}`;
    return await SalesforceApi.get(queryEndPoint);
  };

  setPinByRegion = async (regionId, pinData, currentUserId) => {
    const payload = {
      createdByUserId: currentUserId,
      name: pinData.name,
      sourceName: pinData.sourceName,
      linkUrl: pinData.sourceLink,
      regionId: regionId,
      address: pinData.address,
      description: pinData.description,
      latitude: pinData.latitude,
      longitude: pinData.longitude,
      pinColor: pinData.pinColor ? pinData.pinColor : '',
      pinType: pinData.pinType ? pinData.pinType.name : 'Other',
      Id: pinData.id ? pinData.id : '',
      pinImage: pinData.photos.length > 0 ? 'true' : 'false'
    };
    return await SalesforceApi.post('/pins', payload);
  };
  setPinPhotosById = async (pinId, photos) => {
    let uriParts = photos.uri.split('.');
    let fileType = uriParts[uriParts.length - 1];
    const payload = {
      parentId: pinId,
      attachmentId: '',
      fileName: `${pinId}${uriParts[0]}`,
      contentType: `image/${fileType}`,
      base64BlobValue: photos.base64
    };
    return await SalesforceApi.post('/pinImage', payload);
  };

  getPhotos = async pinId => {
    const payload = {
      pinId: pinId
    };
    const res = await SalesforceApi.put('/pinImage', payload);
    return res;
  };

  deletePinById = async pinId => {
    const queryEndPoint = `/pins/${pinId}`;
    SalesforceApi.delete(queryEndPoint);
  };

  /**
   * Activity related Apis
   */
  getActivities = async () => {
    return await SalesforceApi.get('/activities');
  };

  setVote = async (pinId, vote, userId) => {
    const payload = {
      pinId: pinId,
      vote: vote,
      userId: userId
    };
    return await SalesforceApi.post('/vote', payload);
  };

  getVotedPins = async userId => {
    const queryEndpoint = `/vote/${userId}`;
    return await SalesforceApi.get(queryEndpoint);
  };

  /**
   * Pin location related Apis
   */
  getPinLocationTypes = async () => {
    return await SalesforceApi.get('/types');
  };

  /**
   * Pin related Apis
   */
  getPinsList = async () => {
    return await SalesforceApi.get('/getPins');
  };

  /**
   * User related Apis
   */
  getUserName = async userId => {
    const queryEndPoint = `/getUserName/${userId}`;
    return await SalesforceApi.get(queryEndPoint);
  };

  /**
   * Alert related Apis
   */
  getBroadcastCards = async () => {
    return await SalesforceApi.get('/broadcasts');
  };

  /**
   * Auth specific Apis
   */
  login = async (email, password) => {
    return await Auth.signIn(email, password)
      .then(success => success)
      .catch(err => err);
  };

  logout = async () => {
    return await Auth.signOut()
      .then(success => success)
      .catch(err => console.log('err: ', err));
  };

  register = async (email, password, name) => {
    return await Auth.signUp({
      username: email,
      password: password,
      attributes: {
        name: name
      }
    })
      .then(success => success)
      .catch(err => err);
  };

  completePassword = async (user, password, attributes) => {
    return await Auth.completeNewPassword(user, password, attributes)
      .then(user => user)
      .catch(err => err);
  };

  changePassword = async (oldPassword, newPassword) => {
    return await Auth.currentAuthenticatedUser()
      .then(user => {
        return Auth.changePassword(user, oldPassword, newPassword);
      })
      .then(data => true)
      .catch(err => err);
  };

  forgotPassword = async email => {
    return await Auth.forgotPassword(email)
      .then(data => data)
      .catch(err => err);
  };

  forgotPasswordCode = async (email, code, new_password) => {
    return await Auth.forgotPasswordSubmit(email, code, new_password)
      .then(data => data)
      .catch(err => err);
  };

  /**
   * Push notification specific api
   */
  registerPushNotificationToken = async payload => {
    const queryEndpoint = '/notification';
    return await SalesforceApi.put(queryEndpoint, payload);
  };

  /**
   * Get and generate Auth token
   */
  generateAuthToken = async () => {
    return SalesforceApi.setToken();
  };

  getSFHelper = () => SalesforceApi;
}
