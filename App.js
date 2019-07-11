import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import AppContainer from './containers/App';
import { AlertProvider } from './containers/AlertContainer';
import createStore from './redux';
const { store, persistor } = createStore();
import Amplify from '@aws-amplify/core';

Amplify.configure({
  Auth: {
    // REQUIRED - Amazon Cognito Identity Pool ID
    identityPoolId: 'us-east-2_pEJ5U0LHb',
    // REQUIRED - Amazon Cognito Region
    region: 'us-east-2',
    userPoolId: 'us-east-2_pEJ5U0LHb',
    userPoolWebClientId: 'b1ue32jicaln89jqv166ne69m'
  }
});

export default class App extends React.PureComponent {
  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AlertProvider>
            <AppContainer />
          </AlertProvider>
        </PersistGate>
      </Provider>
    );
  }
}
