import React from 'react';
import { Platform, BackHandler } from 'react-native';
import { Notifications } from 'expo';
import { connect } from 'react-redux';
import {
  addNavigationHelpers,
  NavigationActions,
  StackNavigator,
  TabNavigator
} from 'react-navigation';
import Colors from '../constants/Colors';
import MainModalNavigator from './MainModalTabNavigator';
import registerForPushNotificationsAsync from '../api/registerForPushNotificationsAsync';
import LoginScreen from '../containers/LoginScreenContainer';

export const AppNavigator = StackNavigator({
  LoginScreen: {
    screen: LoginScreen,
    navigationOptions: {
      header: null
    }
  },
  MainModalNavigator: { screen: MainModalNavigator }
});
class RootNavigator extends React.Component {
  componentWillMount() {
    if (Platform.OS !== 'android') {
      return;
    }

    BackHandler.addEventListener('hardwareBackPress', () => {
      const { dispatch, nav } = this.props;

      // This assumes that we always want to clsoe the app when you are at the first screen
      // of the top most navigator or at the first screen of the first level of nested navigators
      if (nav.index === 0) {
        if (!nav.routes[0].index) {
          return false;
        } else if (nav.routes[0].index === 0) {
          return false;
        }
      }

      dispatch(NavigationActions.back());

      return true;
    });
  }

  componentWillUnmount() {
    if (Platform.OS === 'android') {
      BackHandler.removeEventListener('hardwareBackPress');
    }
    this._notificationSubscription && this._notificationSubscription.remove();
  }
  componentDidMount() {
    this._notificationSubscription = this._registerForPushNotifications();
  }

  _registerForPushNotifications() {
    // Send our push token over to our backend so we can receive notifications
    // You can comment the following line out if you want to stop receiving
    // a notification every time you open the app. Check out the source
    // for this function in api/registerForPushNotificationsAsync.js
    registerForPushNotificationsAsync();

    // Watch for incoming notifications
    this._notificationSubscription = Notifications.addListener(
      this._handleNotification
    );
  }

  _handleNotification = ({ origin, data }) => {
    console.log(
      `Push notification ${origin} with data: ${JSON.stringify(data)}`
    );
  };
  render() {
    const { dispatch, nav } = this.props;

    return (
      <AppNavigator
        navigation={addNavigationHelpers({ dispatch, state: nav })}
      />
    );
  }
}

const mapStateToProps = state => ({
  nav: state.nav
});

export default connect(mapStateToProps)(RootNavigator);
