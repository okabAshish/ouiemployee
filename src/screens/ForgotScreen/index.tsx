import React, {useContext, useEffect, useState} from 'react';

import {Button} from '@rneui/base';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';

import axios from 'axios';
import Network from '../../constants/Network';

import {AuthContext} from '../../utils/AuthContext';

export default function ForgotScreen() {
  const state = {
    phone: '',
    password: '',
    otp: '',
    user_id: '',
  };

  const [myState, setmyState] = useState(state);
  const [updatedValues, setcupdatedValues] = useState(false);

  const [loading, setLoadning] = useState(false);

  const [resendloading, setResendLoadning] = useState(false);

  const [hidePass, setHidePass] = useState(true);

  const {signIn} = useContext(AuthContext);

  const [otpview, setOTPview] = useState(false);
  const [regview, setRegview] = useState(false);
  const [editable, setEditable] = useState(true);

  const [seconds, setSeconds] = useState(30);
  const [startcounter, setCounter] = useState(false);

  useEffect(() => {
    if (startcounter) {
      if (seconds > 0) {
        setTimeout(() => setSeconds(seconds - 1), 1000);
      } else {
        setSeconds('done');
      }
    }
  });

  const resendOTP = async () => {
    setResendLoadning(true);

    const {phone} = myState;

    try {
      // here place your signup logic
      // console.log("user successfully signed up!: ", success);

      const url = Network.apiurl + 'send_otp_forgot';

      //console.log(url);

      axios
        .post(
          url,
          {
            number: phone,
          },
          {
            headers: {Authorization: Network.token},
          },
        )
        .then(function (response) {
          setResendLoadning(false);

          // console.log(response.data);

          if (response.data.status === true) {
            try {
              //console.log(response.data.user_details.user_id);
              setOTPview(true);
              setSeconds(30);
              setCounter(true);
            } catch (rejectedValue) {
              // …
              console.log('SET ERROR');
            }
          } else {
            setResendLoadning(false);
            Alert.alert(response.data.message);
          }
        })
        .catch(function (error) {
          setLoadning(false);
          console.log(error);
        });
    } catch (err) {
      console.log('error signing up: ', err);
    }
  };

  const checkOTP = async () => {
    setLoadning(true);

    const {phone, otp, user_id} = myState;
    if (otp == '' || otp.length < 4) {
      setLoadning(false);
      return Alert.alert('Please enter OTP correctly');
    }

    try {
      // here place your signup logic
      // console.log("user successfully signed up!: ", success);

      const url = Network.apiurl + 'verify_otp';

      //console.log(url);

      axios
        .post(
          url,
          {
            number: phone,
            otp: otp,
          },
          {
            headers: {Authorization: Network.token},
          },
        )
        .then(function (response) {
          setLoadning(false);

          // console.log(response.data);

          if (response.data.status === true) {
            try {
              //console.log(response.data.user_details.user_id);
              //signIn(myState.user_id.toString());
              setRegview(true);
              setOTPview(false);
              setEditable(false);
            } catch (rejectedValue) {
              // …
              console.log('SET ERROR');
            }
          } else {
            setLoadning(false);
            Alert.alert(response.data.message);
          }
        })
        .catch(function (error) {
          setLoadning(false);
          console.log(error);
        });
    } catch (err) {
      console.log('error signing up: ', err);
    }
  };

  const updatePassword = async () => {
    //console.log(myState);

    setLoadning(true);

    const {phone, password} = myState;
    //console.log(name);
    if (phone == '' || password == '') {
      setLoadning(false);
      return Alert.alert('Please Fill all the fields');
    }

    if (phone.length < 10) {
      setLoadning(false);
      return Alert.alert('Phone must be minimum 10 characters');
    }

    if (password.length < 6) {
      setLoadning(false);
      return Alert.alert('Password must be minimum 6 characters');
    }

    try {
      // here place your signup logic
      // console.log("user successfully signed up!: ", success);

      const url = Network.apiurl + 'forgot';

      //console.log(url);

      axios
        .post(
          url,
          {
            mobile_no: phone,
            password: password,
          },
          {
            headers: {Authorization: Network.token},
          },
        )
        .then(function (response) {
          setLoadning(false);

          console.log(response.data);

          if (response.data.status === true) {
            try {
              //console.log(response.data.user_details.user_id);
              signIn(response.data.user_details.user_id.toString());
              //myState.user_id = response.data.user_details.user_id.toString();
              //setOTPview(true);
              //setCounter(true);
            } catch (rejectedValue) {
              // …
              console.log('SET ERROR');
            }
          } else {
            setLoadning(false);
            Alert.alert(response.data.message);
          }
        })
        .catch(function (error) {
          setLoadning(false);
          console.log(error);
        });
    } catch (err) {
      console.log('error signing up: ', err);
    }
  };

  const onChangeText = (key, val) => {
    const newState = myState; // clone the array
    //newState.key = val; // set the new value \\
    //setmyState(newState);
    console.log(key);
    if (key == 'phone') {
      val = val.replace(/[^0-9]/g, '');
    }
    newState[key] = val;
    setmyState(newState);
    setcupdatedValues(updatedValues == true ? false : true);
    console.log(myState);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{marginTop: 24, backgroundColor: '#fff'}}>
      <View style={styles.container}>
        <Image
          source={require('../../assets/logo.jpg')}
          style={{
            width: 300,
            height: 100,
            resizeMode: 'contain',
            marginVertical: 10,
            alignSelf: 'center',
            marginTop: 10,
          }}
        />

        {otpview ? (
          <>
            <View style={styles.labelcontainer}>
              <Text style={styles.label}>OTP</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter OTP"
                onChangeText={val => onChangeText('otp', val)}
                keyboardType={'numeric'}
                value={myState.otp}
                maxLength={4}
              />
            </View>
            <View
              style={{
                marginTop: 20,
                width: 200,
                marginLeft: 20,
                alignSelf: 'center',
              }}>
              <Button
                title="Verify"
                color="#f4511e"
                onPress={checkOTP}
                loading={loading}
              />
              {seconds != 'done' ? (
                <Text
                  style={{
                    fontSize: 12,
                    marginTop: 10,
                    alignSelf: 'center',
                  }}>
                  {seconds}
                </Text>
              ) : (
                <Button
                  title="Resend OTP"
                  onPress={resendOTP}
                  loading={resendloading}
                  buttonStyle={{
                    backgroundColor: '#333',
                    paddingVertical: 10,
                    marginTop: 10,
                  }}
                />
              )}
            </View>
          </>
        ) : (
          <>
            <View style={styles.labelcontainer}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="10 Digit Mobile Number"
                onChangeText={val => onChangeText('phone', val)}
                keyboardType={'numeric'}
                value={myState.phone}
                maxLength={10}
                editable={editable}
              />
            </View>

            {regview && (
              <View style={styles.labelcontainer}>
                <Text style={styles.label}>Password</Text>
                <View></View>
                <TextInput
                  style={styles.input2}
                  onChangeText={val => onChangeText('password', val)}
                  value={myState.password}
                  secureTextEntry={hidePass ? true : false}
                />
                {hidePass ? (
                  <Icon
                    name="eye-slash"
                    style={styles.icon}
                    size={24}
                    color="black"
                    onPress={() => setHidePass(!hidePass)}
                  />
                ) : (
                  <Icon
                    name="eye"
                    style={styles.icon}
                    size={24}
                    color="black"
                    onPress={() => setHidePass(!hidePass)}
                  />
                )}
              </View>
            )}

            {regview ? (
              <View
                style={{
                  marginTop: 20,
                  width: 200,
                  marginLeft: 20,
                  alignSelf: 'center',
                }}>
                <Button
                  title="Update Password"
                  color="#f4511e"
                  onPress={updatePassword}
                  loading={loading}
                />
              </View>
            ) : (
              <View
                style={{
                  marginTop: 20,
                  width: 200,
                  marginLeft: 20,
                  alignSelf: 'center',
                }}>
                <Button
                  title="Proceed"
                  color="#f4511e"
                  onPress={resendOTP}
                  loading={loading}
                />
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    width: 250,
    alignSelf: 'center',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    height: 60,
  },
  input2: {
    width: 220,
    alignSelf: 'center',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    height: 60,
  },
  labelcontainer: {
    flexDirection: 'row',
    alignContent: 'center',
  },
  label: {
    marginTop: 20,
    width: 90,
    height: 40,
    paddingHorizontal: 10,
    textAlignVertical: 'center',
  },
  icon: {
    marginTop: 20,
    height: 40,
  },
});
