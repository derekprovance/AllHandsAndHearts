import React from 'react';
import propTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { View, Text } from 'react-native-animatable';
import StyledInput from '../StyledInput';
import StyledButton from '../StyledButton';
import { StyledButton2 } from '../StyledButton';
import Colors from '../../constants/Colors';
import { delayExec } from '../../utils/utils';
export default class NewAccountPasswordForm extends React.PureComponent {
  state = {
    password: '',
    password2: ''
  };

  _handleOnChangeText = (key, value) => {
    this.setState({
      [key]: value
    });
  };

  handleSetPassword = () => {
    this.styledButton2.load();
    let { password, password2 } = this.state;

    if (password == password2) {
      if (password.length > 0) {
        //TODO(DEREK) - pipe in email to this form
        this.props.setPasswordNewAccount({
          email: 'test@dummy.com',
          password: password
        });
      } else {
        this.showErrorMessage('A password must be provided.');
      }
    } else {
      this.showErrorMessage('Passwords do not match!');
    }
  };

  showErrorMessage(message) {
    this.props.alertWithType('error', 'Set Password', message);
    this.styledButton2 && this.styledButton2.error();
    delayExec(2000, this.styledButton2.reset);
  }

  render() {
    return (
      <View style={styles.container} {...this.props}>
        <Text style={styles.link}>Set a new password for your account.</Text>
        <StyledInput
          secureTextEntry
          style={styles.input}
          clearTextOnFocus
          placeholder="New Password"
          returnKeyType="next"
          enablesReturnKeyAutomatically
          inputRef={element => (this.password01Ref = element)}
          onChangeText={value => this._handleOnChangeText('password', value)}
        />
        <StyledInput
          secureTextEntry
          style={styles.input}
          clearTextOnFocus
          placeholder="Re-enter Password"
          returnKeyType="next"
          enablesReturnKeyAutomatically
          inputRef={element => (this.password02Ref = element)}
          onChangeText={value => this._handleOnChangeText('password2', value)}
        />
        <StyledButton2
          buttonRef={ref => (this.styledButton2 = ref)}
          label="Set Password"
          onPress={this.handleSetPassword}
          onSecondaryPress={() => this.styledButton2.reset()}
        />
        <StyledButton
          style={{
            height: 42,
            backgroundColor: Colors.defaultColor.WARNING_COLOR
          }}
          textStyle={{ color: Colors.defaultColor.PAPER_COLOR }}
          text="Cancel"
          onPress={() => this.props.logout()}
        />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flexGrow: 1
  },
  loginButton: {
    height: 42,
    backgroundColor: Colors.defaultColor.PRIMARY_COLOR
  },
  textStyle: {
    color: Colors.defaultColor.PAPER_COLOR
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
    margin: 20
  }
});
