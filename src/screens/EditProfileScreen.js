import React, {useContext, useEffect, useState} from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';

import axios from 'axios';
import Network from '../constants/Network';

import {Button} from '@rneui/base';
import Loading from '../components/Loading';

import {AuthContext} from '../utils/AuthContext';

export default function EditProfileScreen({navigation, route}) {
  const [loaded, setLoaded] = useState(false);
  const [details, setprofileDetails] = useState(false);
  const [isloading, setLoadning] = useState(false);
  const [first_name, setFirstName] = useState(false);
  const [last_name, setLastName] = useState(false);
  const [address, setAddress] = useState(false);
  const [email, setEmail] = useState(false);

  const {authState} = useContext(AuthContext);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getProfile();
    });
    return unsubscribe;
  }, [navigation]);

  async function getProfile() {
    const url = Network.apiurl + 'profile/' + authState.userToken;
    //console.log(url);
    const result = await axios
      .get(url, {headers: {Authorization: Network.token}})
      .then(function (response) {
        //console.log(response.data)
        if (response.data.status) {
          setprofileDetails(response.data.user_details);
          setFirstName(response.data.user_details.firstname);
          setLastName(response.data.user_details.lastname);
          setEmail(response.data.user_details.email);
          setAddress(response.data.user_details.address);
        }
        setLoaded(true);
        return true;
      });
  }

  function updateProfile() {
    setLoadning(true);
    if (!first_name || !last_name || !email || !address) {
      return alert('(*) fields are required');
    }

    let formData = new FormData();
    formData.append('employee_id', authState.userToken);
    formData.append('email', email);
    formData.append('first_name', first_name);
    formData.append('last_name', last_name);
    formData.append('address', address);

    const url = Network.apiurl + 'update_profile';
    axios
      .post(url, formData, {
        headers: {'Content-Type': 'multipart/form-data'},
      })
      .then(function (response) {
        // console.log(response.data);
        if (response.data.status == true) {
          setFirstName(false);
          setLastName(false);
          setAddress(false);
          setEmail(false);
          navigation.pop();
        }
        setLoadning(false);
        return;
      })
      .catch(function (error) {
        setLoadning(false);
        return alert(error);
      });
  }

  if (!loaded) {
    return <Loading />;
  } else {
    return (
      <View style={styles.container}>
        {loaded && (
          <View style={styles.card}>
            <View style={styles.list}>
              <Text style={styles.label}> First Name* :</Text>
              <TextInput
                style={styles.input}
                placeholder="First Name"
                onChangeText={val => setFirstName(val)}
                value={first_name}
              />
            </View>
            <View style={styles.list}>
              <Text style={styles.label}>Last Name* :</Text>
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                onChangeText={val => setLastName(val)}
                value={last_name}
              />
            </View>
            <View style={styles.list}>
              <Text style={styles.label}>Email* :</Text>
              <TextInput
                style={styles.input}
                keyboardType="email-address"
                placeholder="Your Email"
                onChangeText={val => setEmail(val)}
                value={email}
              />
            </View>
            <View style={styles.list}>
              <Text style={styles.label}>Address* :</Text>
              <TextInput
                style={styles.input}
                placeholder="Your Address"
                onChangeText={val => setAddress(val)}
                value={address}
              />
            </View>

            <View>
              <Button
                title="Save Profile"
                containerStyle={{
                  width: 250,
                  margin: 10,
                  alignSelf: 'center',
                  marginVertical: 30,
                }}
                buttonStyle={{backgroundColor: '#333'}}
                onPress={updateProfile}
                loading={isloading}
              />
            </View>
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexGrow: 1,
    backgroundColor: '#f7f7f7',
  },
  card: {
    padding: 2,
    margin: 2,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  text: {
    color: '#fff',
    fontSize: 20,
  },
  list: {
    flexDirection: 'row',
    height: 40,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  thumb: {
    width: 200,
    height: 150,
    resizeMode: 'contain',
    backgroundColor: '#f7f7f7',
    alignSelf: 'center',
  },
  input: {
    width: 250,
    alignSelf: 'center',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    height: 40,
    paddingVertical: 10,
    justifyContent: 'center',
    color: '#000',
  },
  input2: {
    width: 220,
    alignSelf: 'center',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    color: '#000',
    height: 60,
  },
  labelcontainer: {
    flexDirection: 'row',
    alignContent: 'center',
  },
  label: {
    width: 100,
    height: 40,
    color: '#000',
    textAlignVertical: 'center',
  },
  icon: {
    marginTop: 20,
    height: 40,
  },
});
