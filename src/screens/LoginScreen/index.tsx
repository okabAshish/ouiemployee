import {Alert, View} from 'react-native';

import {useContext, useState} from 'react';
import {Image, Pressable, StyleSheet, TextInput} from 'react-native';

import {Button} from '@rneui/base';

import {faEye, faEyeSlash} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import axios from 'axios';
import Network from '../../constants/Network';
import {AuthContext} from '../../utils/AuthContext';

type Props = {};

const LoginScreen = (props: Props) => {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loaded, setLoaded] = useState(true);
  const {signIn} = useContext(AuthContext);
  const [passwordVisibility, setPasswordVisibility] = useState(true);
  const [rightIcon, setRightIcon] = useState(faEye);

  const onChangeText = val => {
    val = val.replace(/[^0-9]/g, '');
    setCode(val);
  };

  function validate() {
    if (code.length == 0) {
      Alert.alert('Error', 'Please Enter Code');
      return false;
    }
    if (password.length == 0) {
      Alert.alert('Error', 'Please Enter Password');
      return false;
    }
    return true;
  }

  const submitFrom = () => {
    console.log('clicked');
    if (validate()) {
      setLoaded(false);
      const url = Network.apiurl + 'login/';
      console.log(url, 'URL');
      axios
        .post(
          url,
          {
            username: code,
            password: password,
          },
          {headers: {Authorization: Network.token}},
        )
        .then(function (response) {
          console.log(response.data, 'RES');
          setLoaded(true);
          if (response.data.status === true) {
            try {
              signIn(response.data.details.user_id);
            } catch (rejectedValue) {
              // …
              console.log('SET ERROR');
            }
          } else {
            alert(response.data.message);
          }
        })
        .catch(function (error) {
          setLoaded(true);
          console.log(error);
        });
    }
  };

  const handlePasswordVisibility = () => {
    setPasswordVisibility(!passwordVisibility);
    if (rightIcon === faEye) {
      setRightIcon(faEyeSlash);
    } else if (rightIcon === faEyeSlash) {
      setRightIcon(faEye);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/logo.jpg')}
        style={{
          width: 300,
          height: 100,
          resizeMode: 'contain',
          marginBottom: 20,
        }}
      />
      <View>
        <View>
          <TextInput
            onChangeText={code => {
              // console.log(code);

              onChangeText(code);
            }}
            placeholder="10 Digit Mobile no"
            style={styles.inputStyle}
            value={code}
            keyboardType="phone-pad"
            maxLength={10}
            placeholderTextColor={'#808080'}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            secureTextEntry={passwordVisibility}
            enablesReturnKeyAutomatically
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Password"
            placeholderTextColor={'#808080'}
            style={styles.inputField}
            onChangeText={password => setPassword(password)}
            value={password}
          />
          <Pressable onPress={handlePasswordVisibility}>
            <FontAwesomeIcon icon={rightIcon} />
          </Pressable>
        </View>
        <View style={styles.submitButton}>
          <Button onPress={submitFrom} title="Login" color="#0398fc" />
        </View>
        {/* <View style={styles.submitButton}>
        <Button title="Register" color="#f4511e" onPress={() => navigation.navigate('Register')} />
      </View> */}

        {/* <View style={styles.forgotButton}>
        <TouchableWithoutFeedback onPress={() => navigation.navigate('Forgot')} >
          <Text style={{alignSelf:'flex-end'}}>Forgot Password?</Text>
        </TouchableWithoutFeedback>
      </View> */}
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },

  formLabel: {
    fontSize: 20,
    color: '#fff',
  },
  inputStyle: {
    marginTop: 20,
    width: 300,
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 50,
    backgroundColor: '#f7f7f7',
    color: '#000',
  },
  inputError: {
    color: 'red',
    paddingLeft: 10,
  },
  submitButton: {
    marginTop: 20,
  },
  forgotButton: {
    marginTop: 20,
  },
  formText: {
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: 20,
  },
  text: {
    color: '#fff',
    fontSize: 20,
  },
  inputContainer: {
    width: 300,
    height: 40,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 10,
    backgroundColor: '#f7f7f7',
  },
  inputField: {
    width: '90%',
    color: '#000',
  },
});
