import React from 'react';
import propTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import TouchableNativeFeedback from '@expo/react-native-touchable-native-feedback-safe';
import { View, Text } from 'react-native-animatable';
import StyledInput from '../../components/StyledInput';
import { StyledButton2 } from '../StyledButton';
import Colors from '../../constants/Colors';
import { delayExec } from '../../utils/utils';
import { Linking, TouchableOpacity, Alert } from 'react-native';
import Dialog from 'react-native-dialog';

export default class LoginForm extends React.PureComponent {
  state = {
    email: '',
    password: '',
    forgotPassVisible: false,
    forgotPassCodeVisible: false,
    forgotPassSubmitted: false
  };

  showForgotPasswordDialog = () => {
    this.setState({ forgotPassVisible: true });
    this.setState({ password: '' });
  };

  showForgotPasswordCodeDialog = () => {
    this.setState({ forgotPassCodeVisible: true });
    this.setState({ password: '' });
  };

  handleCancel = () => {
    this.setState({ forgotPassVisible: false });
    this.setState({ forgotPassCodeVisible: false });
  };

  showSuccessFailForgotPasswordMessage(nextProps) {
    if (nextProps.auth.forgotPasswordStatus) {
      if (nextProps.auth.forgotPasswordStatus == true) {
        if (this.state.email) {
          this.setState({ forgotPassCodeVisible: true });
        }
      } else {
        this.setState({ forgotPassSubmitted: false });
        this.props.alertWithType(
          'error',
          'Forgot Password',
          `${nextProps.auth.forgotPasswordStatus}`
        );
      }
    }
  }

  showSuccessFailForgotPasswordCodeMessage(nextProps) {
    //TODO(DEREK) - determine between alert and notification
    if (nextProps.auth.forgotPasswordCodeStatus) {
      this.props.alertWithType(
        'error',
        'Forgot Password',
        `${nextProps.auth.forgotPasswordCodeStatus}`
      );

      //TODO(DEREK) - look into if this state should be set elsewhere
      this.setState({ forgotPassSubmitted: false });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.auth.registrationStatus) {
      Alert.alert(nextProps.auth.registrationStatus);
    }

    if (this.state.forgotPassSubmitted) {
      this.showSuccessFailForgotPasswordMessage(nextProps);
      this.showSuccessFailForgotPasswordCodeMessage(nextProps);
    }

    if (this.props.auth.loginError && this.styledButton2) {
      this.props.alertWithType(
        'error',
        'Log in',
        `${nextProps.auth.loginError}`
      );
      this.styledButton2.error();
      delayExec(2000, this.styledButton2.reset);
    }
  }

  _handleOnChangeText = (key, value) => {
    this.setState({
      [key]: value
    });
  };

  handleLogin = async () => {
    this.styledButton2.load();
    let { email, password } = this.state;
    email = email.trim();
    password = password.trim();
    if (email.length > 0 && password.length > 0) {
      await this.props.login({
        email,
        password
      });
      this.props.auth.loggedIn &&
        this.styledButton2 &&
        this.styledButton2.success();
    } else {
      this.styledButton2 && this.styledButton2.error();
      this.props.alertWithType(
        'error',
        'Log in',
        'Both Email and Password are required'
      );
      delayExec(2000, this.styledButton2.reset);
    }
  };

  handleForgotPassword = async () => {
    this.setState({ forgotPassVisible: false });
    let { email } = this.state;
    email = email.trim();

    if (email.length > 0) {
      this.props.forgotPassword({
        email
      });
      this.setState({ forgotPassSubmitted: true });
    } else {
      this.props.alertWithType(
        'error',
        'Log in',
        'Email is required for password reset!'
      );
    }
  };

  handleForgotPasswordCode = async () => {
    this.setState({ forgotPassCodeVisible: false });
    let { email, code, password } = this.state;

    if (
      password != undefined &&
      code != undefined &&
      code.length > 0 &&
      password.length > 0
    ) {
      this.props.forgotPasswordCode({
        email,
        code,
        password
      });
    } else {
      this.props.alertWithType(
        'error',
        'Recovery Code',
        'Both code and password fields are required!'
      );
    }
  };

  resetPasswordClicked() {
    Linking.openURL(
      'mailto:disastercrowdsupport@allhandsandhearts.org?subject=Reset Password Request &body=The following user is requesting a password reset:\n\n' +
        this.state.email
    );
    Alert.alert('Someone from the AHAH team will get back with you shortly.');
  }

  render() {
    return (
      <View style={styles.container} {...this.props}>
        <StyledInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          returnKeyType="next"
          autoCapitalize="none"
          autoCorrect={false}
          enablesReturnKeyAutomatically
          onSubmitEditing={() => this.passwordRef.focus()}
          onChangeText={value => this._handleOnChangeText('email', value)}
        />
        <StyledInput
          secureTextEntry
          clearTextOnFocus
          returnKeyType="done"
          style={styles.input}
          placeholder="Password"
          enablesReturnKeyAutomatically
          inputRef={element => (this.passwordRef = element)}
          onChangeText={value => this._handleOnChangeText('password', value)}
          onSubmitEditing={this.handleLogin}
        />
        <StyledButton2
          buttonRef={ref => (this.styledButton2 = ref)}
          label="Log in"
          onPress={this.handleLogin}
          onSecondaryPress={() => this.styledButton2.reset()}
        />
        <TouchableNativeFeedback onPress={() => this.props.linkPress()}>
          <Text style={styles.link}>Don't have an account?</Text>
        </TouchableNativeFeedback>
        {this.state.forgotPassSubmitted ? (
          <TouchableNativeFeedback onPress={this.showForgotPasswordCodeDialog}>
            <Text style={styles.link}>Enter Recovery Code</Text>
          </TouchableNativeFeedback>
        ) : (
          <TouchableNativeFeedback onPress={this.showForgotPasswordDialog}>
            <Text style={styles.link}>Forgot Password?</Text>
          </TouchableNativeFeedback>
        )}

        <Dialog.Container visible={this.state.forgotPassVisible}>
          <Dialog.Title>Forgot Password</Dialog.Title>
          <StyledInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            returnKeyType="next"
            autoCapitalize="none"
            autoCorrect={false}
            enablesReturnKeyAutomatically
            onChangeText={value => this._handleOnChangeText('email', value)}
          />
          <TouchableNativeFeedback
            onPress={this.resetPasswordClicked.bind(this)}
          >
            <Text style={styles.link}>
              Still having issues? Please contact an administrator.
            </Text>
          </TouchableNativeFeedback>
          <Dialog.Button label="Cancel" onPress={this.handleCancel} />
          <Dialog.Button label="Submit" onPress={this.handleForgotPassword} />
        </Dialog.Container>
        <Dialog.Container visible={this.state.forgotPassCodeVisible}>
          <Dialog.Title>Recovery Code</Dialog.Title>
          <Text style={styles.link}>
            An recovery code has been sent to your e-mail address. Please enter
            the code and new password below to recover your account.
          </Text>
          <StyledInput
            style={styles.input}
            placeholder="Code"
            keyboardType="numeric"
            returnKeyType="next"
            autoCapitalize="none"
            autoCorrect={false}
            enablesReturnKeyAutomatically
            onChangeText={value => this._handleOnChangeText('code', value)}
          />
          <StyledInput
            secureTextEntry
            clearTextOnFocus
            returnKeyType="done"
            style={styles.input}
            placeholder="New Password"
            enablesReturnKeyAutomatically
            inputRef={element => (this.passwordRef = element)}
            onChangeText={value => this._handleOnChangeText('password', value)}
          />
          <Dialog.Button label="Cancel" onPress={this.handleCancel} />
          <Dialog.Button
            label="Submit"
            onPress={this.handleForgotPasswordCode}
          />
        </Dialog.Container>
      </View>
    );
  }
}

LoginForm.propTypes = {
  linkPress: propTypes.func.isRequired
};
const styles = StyleSheet.create({
  container: {
    flexGrow: 1
  },
  input: {
    height: 42,
    color: Colors.defaultColor.PRIMARY_COLOR,
    backgroundColor: Colors.defaultColor.PAPER_COLOR,
    borderColor: '#BFBFC0',
    borderWidth: 0.3,
    borderRadius: Colors.Input.BORDER.RADIUS
  },
  link: {
    color: '#9999a3',
    alignSelf: 'center',
    padding: 20
  }
});
