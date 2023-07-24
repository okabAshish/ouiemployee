import {Button} from '@rneui/base';
import axios from 'axios';
import React, {useContext, useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Loading from '../components/Loading';
import Network from '../constants/Network';
import {AuthContext} from '../utils/AuthContext';

export default function ProfileScreen({navigation, route}) {
  const [loaded, setLoaded] = useState(false);
  const [details, setprofileDetails] = useState(false);

  const {authState, signOut} = useContext(AuthContext);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // The screen is focused
      // Call any action
      getProfile();
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
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
        }
        setLoaded(true);
        return true;
      });
  }

  function senttoEdit() {
    setLoaded(false);
    navigation.navigate('EditProfileScreen');
  }

  if (!loaded) {
    return <Loading />;
  } else {
    return (
      <View style={styles.container}>
        {loaded && (
          <View style={styles.card}>
            <View style={styles.list}>
              <Text style={styles.color}>
                Name : {details.firstname} {details.lastname}
              </Text>
            </View>

            <View style={styles.list}>
              <Text style={styles.color}>Phone : {details.username}</Text>
            </View>
            <View style={styles.list}>
              <Text style={styles.color}>Email : {details.email}</Text>
            </View>
            <View style={styles.list}>
              <Text style={styles.color}>Address : {details.address}</Text>
            </View>

            <View style={styles.list}>
              <View style={{flexDirection: 'row'}}>
                <Text style={styles.color}>Status:</Text>
                {details.is_verify == '1' ? (
                  <Text style={{color: 'green'}}> Verified </Text>
                ) : (
                  <Text style={{color: 'red'}}> Not Verified</Text>
                )}
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                alignContent: 'center',
              }}>
              <Button
                title="Edit"
                onPress={senttoEdit}
                containerStyle={{width: 120, margin: 10}}
                buttonStyle={{backgroundColor: '#333'}}
              />
              <Button
                title="Logout"
                onPress={signOut}
                containerStyle={{width: 120, margin: 10}}
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
    padding: 20,
    margin: 10,
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
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e3e3e3',
  },
  color: {
    color: '#000',
  },
  thumb: {
    width: 200,
    height: 150,
    resizeMode: 'contain',
    backgroundColor: '#f7f7f7',
    alignSelf: 'center',
  },
});
