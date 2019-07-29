import React from 'react';
import { connect } from 'react-redux';
import { loginRequest, registerRequest } from '../redux/actions/auth';
import LoginScreen from '../screens/LoginScreen';
import { AlertConsumer } from '../containers/AlertContainer';
import { forgotPassword, forgotPasswordCode } from '../redux/actions/auth';

const mapDispatchToProps = dispatch => {
  return {
    login: user => {
      dispatch(loginRequest(user));
    },
    register: user => {
      dispatch(registerRequest(user));
    },
    forgotPassword: data => {
      dispatch(forgotPassword(data));
    },
    forgotPasswordCode: data => {
      dispatch(forgotPasswordCode(data));
    }
  };
};
const mapStateToProps = state => ({
  auth: state.auth
});

const Login = connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginScreen);
export default props => {
  return (
    <AlertConsumer>{value => <Login {...value} {...props} />}</AlertConsumer>
  );
};
