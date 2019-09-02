import { Auth, API } from 'aws-amplify';
const AwsApiName = 'DisasterCrowdAPI';

export default class Api {
  /**
   * Region related Apis
   */
  getRegionList = async () => {
    let myInit = {
      headers: await this.getAuthHeader()
    };

    return await API.get(AwsApiName, '/regions', myInit);
  };
  getPinsListByRegion = async regionId => {
    let myInit = {
      headers: await this.getAuthHeader()
    };

    const queryEndpoint = `/pins?regionId=${regionId}`;
    return await API.get(AwsApiName, queryEndpoint, myInit);
  };
  getRegionById = async regionId => {
    let myInit = {
      headers: await this.getAuthHeader()
    };

    const queryEndPoint = `/regions/${regionId}`;
    return await API.get(AwsApiName, queryEndPoint, myInit);
  };

  setPinByRegion = async (regionId, pinData, currentUserId) => {
    let myInit = {
      headers: await this.getAuthHeader(),
      body: {
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
        pinType: pinData.pinType,
        Id: pinData.id ? pinData.id : '',
        pinImage: pinData.photos.length > 0 ? 'true' : 'false'
      }
    };

    return await API.post(AwsApiName, '/pins', myInit);
  };
  setPinPhotosById = async (pinId, photos) => {
    let uriParts = photos.uri.split('.');
    let fileType = uriParts[uriParts.length - 1];
    let myInit = {
      headers: await this.getAuthHeader(),
      body: {
        parentId: pinId,
        attachmentId: '',
        fileName: `${pinId}${uriParts[0]}`,
        contentType: `image/${fileType}`,
        base64BlobValue: photos.base64
      }
    };

    return await API.post(AwsApiName, '/pins/images', myInit);
  };

  getPhotos = async pinId => {
    let myInit = {
      headers: await this.getAuthHeader(),
      body: {
        pinId: pinId
      }
    };

    return await API.put(AwsApiName, '/pins/images', myInit);
  };

  deletePinById = async pinId => {
    let myInit = {
      headers: await this.getAuthHeader()
    };

    const queryEndPoint = `/pins/${pinId}`;
    return await API.del(AwsApiName, queryEndPoint, myInit);
  };

  /**
   * Activity related Apis
   */
  getActivities = async () => {
    let myInit = {
      headers: await this.getAuthHeader()
    };

    return await API.get(AwsApiName, '/activities', myInit);
  };

  setVote = async (pinId, vote, userId) => {
    let myInit = {
      headers: await this.getAuthHeader(),
      body: {
        pinId: pinId,
        vote: vote,
        userId: userId
      }
    };

    return await API.post(AwsApiName, '/vote', myInit);
  };

  getVotedPins = async userId => {
    let myInit = {
      headers: await this.getAuthHeader()
    };

    const queryEndpoint = `/vote`;
    return await API.get(AwsApiName, queryEndpoint, myInit);
  };

  /**
   * Pin location related Apis
   */
  getPinLocationTypes = async () => {
    let myInit = {
      headers: await this.getAuthHeader()
    };

    return await API.get(AwsApiName, '/types', myInit);
  };

  /**
   * Pin related Apis
   */
  getPinsList = async () => {
    let myInit = {
      headers: await this.getAuthHeader()
    };

    return await API.get(AwsApiName, '/pins', myInit);
  };

  /**
   * Alert related Apis
   */
  getBroadcastCards = async () => {
    let myInit = {
      headers: await this.getAuthHeader()
    };

    return await API.get(AwsApiName, '/broadcasts', myInit);
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
    let myInit = {
      headers: await this.getAuthHeader(),
      body: payload
    };

    const queryEndpoint = '/notification';
    return await API.put(AwsApiName, queryEndpoint, myInit);
  };

  getAuthHeader = async () => {
    return {
      Authorization: `Bearer ${(await Auth.currentSession())
        .getIdToken()
        .getJwtToken()}`
    };
  };
}
