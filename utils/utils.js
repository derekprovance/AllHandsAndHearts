import { InteractionManager } from 'react-native';

/**
 * Returns children from either a function or children
 * @param {React.children} children
 * @param {React.Props} props
 */
export const synthesizeChildren = (children, props) => {
  return typeof children === 'function'
    ? children(props)
    : children && children;
};

export const runAfterInteractions = () =>
  new Promise(resolve => {
    InteractionManager.runAfterInteractions(() => {
      resolve();
    });
  });

export const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export const delayExec = (ms, func) =>
  new Promise(resolve => {
    setTimeout(() => {
      resolveconnect(func());
    }, ms);
  });
export class SalesforceApiWrapper {
  constructor() {
    this.token = '';
    this.HEADERS = {};
  }

  static create() {
    const salesForceWrapperClass = new SalesforceApiWrapper();
    salesForceWrapperClass.setToken();
    return salesForceWrapperClass;
  }

  setToken = async () => {
    await this.generateAuthToken();
    let tokenObj = await this.getAuthToken();
    this.token = tokenObj.token__c;
    this.setHeaders();
    return tokenObj;
  };
  setPersistedToken = token => {
    this.token = token;
    this.setHeaders();
    return this.token;
  };

  getToken = () => {
    return this.token;
  };

  setHeaders = () => {
    this.HEADERS = {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  };

  getHeaders = () => {
    return this.HEADERS;
  };

  fetchWrapper = async (requestUrl, options) => {
    return fetch(requestUrl, options)
      .then(res => {
        if (res.status === 401) {
          this.setToken();
        }
        return res.json();
      })
      .catch(error => error);
  };

  payloadHelper = (type, payload) => {
    const options = {
      method: type,
      headers: this.HEADERS,
      body: JSON.stringify(payload)
    };
    return options;
  };

  get = async url => {
    const requestUrl = `https://cs19.salesforce.com/services/apexrest${url}`;
    const init = {
      method: 'GET',
      headers: this.HEADERS
    };
    return await this.fetchWrapper(requestUrl, init);
  };

  getBase = async url => {
    const HEADERS = {
      'Content-Type': 'application/json'
    };
    const init = {
      method: 'GET',
      headers: HEADERS
    };
    return await this.fetchWrapper(url, init);
  };

  post = async (url, payload) => {
    const requestUrl = `https://cs19.salesforce.com/services/apexrest${url}`;
    return await this.fetchWrapper(
      requestUrl,
      this.payloadHelper('POST', payload)
    );
  };

  put = async (url, payload) => {
    const requestUrl = `https://cs19.salesforce.com/services/apexrest${url}`;
    return await this.fetchWrapper(
      requestUrl,
      this.payloadHelper('PUT', payload)
    );
  };

  delete = async url => {
    const requestUrl = `https://cs19.salesforce.com/services/apexrest${url}`;
    const init = {
      method: 'DELETE',
      headers: this.HEADERS
    };
    this.fetchWrapper(requestUrl, init);
  };

  /**
   * Get and generate Auth token
   */
  getAuthToken = async () => {
    return await this.getBase(
      `https://jdev-aahtoken.cs19.force.com/services/apexrest/getAuthToken`
    );
  };

  generateAuthToken = async () => {
    return await this.getBase(
      `https://jdev-aahtoken.cs19.force.com/services/apexrest/generateAuthToken`
    );
  };
}

export default { synthesizeChildren };
