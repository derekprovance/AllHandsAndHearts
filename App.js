import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import AppContainer from './containers/App';
import { AlertProvider } from './containers/AlertContainer';
import createStore from './redux';
const { store, persistor } = createStore();
import Amplify from '@aws-amplify/core';

//TODO(DEREK) - verify if having the values here is a no-no or not
Amplify.configure({
  Auth: {
    identityPoolId: 'us-east-2:891cc7d9-d48d-40fc-b49b-f2b2b8c95488',
    region: 'us-east-2',
    userPoolId: 'us-east-2_pEJ5U0LHb',
    userPoolWebClientId: 'b1ue32jicaln89jqv166ne69m'
  },
  API: {
    endpoints: [
      {
        name: 'DisasterCrowdAPI',
        endpoint: 'https://w571598in4.execute-api.us-east-2.amazonaws.com/v1'
      }
    ]
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
