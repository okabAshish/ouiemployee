import {useContext, useEffect, useState} from 'react';
import {
  Alert,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Geolocation from 'react-native-geolocation-service';
import RNSInfo from 'react-native-sensitive-info';
import {AuthContext} from '../../utils/AuthContext';

import axios from 'axios';

import {Button, Card} from '@rneui/base';
import React from 'react';
import {launchCamera} from 'react-native-image-picker';
import Loading from '../../components/Loading';
import Network from '../../constants/Network';

export default function HomeScreen({navigation, route}) {
  // Define the background task for location tracking
  const {authState, setInstatus, setOutstatus} = useContext(AuthContext);
  const [loaded, setLoaded] = useState(true);
  let foregroundSubscription = null;
  const [image, setImage] = useState(null);
  const [inphotoSelected, setinphotoSelected] = useState(false);
  const [outphotoSelected, setoutphotoSelected] = useState(false);
  const [position, setPosition] = useState(null);
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [clockTime, setClockTime] = useState(new Date().toLocaleString());
  const LOCATION_TASK_NAME = 'LOCATION_TRACKER';

  // const locationTracker = async ({data, error}) => {
  //   if (error) {
  //     console.error(error);
  //     return;
  //   }
  //   if (data) {
  //     // Extract location coordinates from data
  //     const {locations} = data;
  //     const location = locations[0];
  //     if (location) {
  //       // console.log("Location in background", location.coords);
  //       let formData = new FormData();
  //       formData.append('employee_id', authState.userToken);
  //       formData.append('lat', location.coords.latitude);
  //       formData.append('long', location.coords.longitude);

  //       const url = Network.apiurl + 'save_track';
  //       // console.log(formData);
  //       await axios
  //         .post(url, formData, {
  //           headers: {'Content-Type': 'multipart/form-data'},
  //         })
  //         .then(function (response) {
  //           // console.log(response.data);
  //           if (response.data.status === true) {
  //           } else {
  //             console.log(response.data.message);
  //           }
  //         })
  //         .catch(function (error) {
  //           console.log(error);
  //         });
  //     }
  //   }
  // };

  const requestPermissions = async () => {
    try {
      let grantedPermission =
        Platform.OS === 'ios'
          ? await Geolocation.requestAuthorization('whenInUse')
          : false;
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Cool Photo App Location Permission',
          message:
            'Cool Photo App needs access to your Location ' +
            'so you can take awesome pictures.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      console.log(grantedPermission, 'PERmission');

      if (
        Platform.OS === 'android' &&
        granted === PermissionsAndroid.RESULTS.GRANTED
      ) {
        getLocation();
      } else if (Platform.OS === 'ios' && grantedPermission === 'granted') {
        getLocation();
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }

    // console.log(foreground, 'FRG');
    // if (foreground.granted)
    //   await Location.requestBackgroundPermissionsAsync();
  };

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      async p => {
        console.log(p);
        setPosition(p?.coords);

        try {
          let formData = new FormData();
          formData.append('employee_id', authState.userToken);
          formData.append('lat', p.coords.latitude);
          formData.append('long', p.coords.longitude);

          const url = Network.apiurl + 'save_track';
          // console.log(formData);
          await axios
            .post(url, formData, {
              headers: {'Content-Type': 'multipart/form-data'},
            })
            .then(function (response) {
              // console.log(response.data);
              if (response.data.status === true) {
              } else {
                console.log(response.data.message);
              }
            });
        } catch (err) {
          console.log(err);
        }
      },
      error => {
        // See error code charts below.
        console.log(error.code, error.message);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  // Request permissions right after starting the app
  useEffect(() => {
    var date = new Date().getDate(); //Current Date
    var month = new Date().getMonth() + 1; //Current Month
    var year = new Date().getFullYear(); //Current Year
    var hours = new Date().getHours(); //Current Hours
    var min = new Date().getMinutes(); //Current Minutes
    var sec = new Date().getSeconds(); //Current Seconds
    setCurrentDate(
      year + '-' + month + '-' + date + ' ' + hours + ':' + min + ':' + sec,
    );

    checkStatus();

    // console.log(status);

    if (status == 'CLOSED') {
      fetchAttendence();
    }

    requestPermissions();

    if (type === 'IN') {
      getLocation();
      // startBackgroundUpdate();
    } else {
      // stopBackgroundUpdate();
    }

    //clock Time
    setInterval(() => {
      setClockTime(new Date().toLocaleString());
    }, 1000);
  }, [type, status]);

  async function fetchAttendence() {
    const url = Network.apiurl + 'attendence_status/' + authState.userToken;

    console.log(url);

    await axios
      .get(url, {headers: {Authorization: Network.token}})
      .then(function (response) {
        if (response.data.status) {
          if (response.data.attendence == 'OUT') {
            setType('OUT');
            setInstatus();
            storeStatus('OUT');
          } else if (response.data.attendence == 'IN') {
            setType('IN');
            storeStatus('IN');
          } else {
            setType('CLOSED');
            setOutstatus();
            storeStatus('CLOSED');
          }
        }
        setLoaded(true);
        return true;
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  async function storeStatus(status) {
    await RNSInfo.setItem('attendence_status', status, {
      sharedPreferencesName: 'mySharedPrefs',
      keychainService: 'myKeychain',
    });
    await RNSInfo.setItem('attendence_date', getTodaysDate(), {
      sharedPreferencesName: 'mySharedPrefs',
      keychainService: 'myKeychain',
    });
    setStatus(status);
  }

  async function checkStatus() {
    const attendence_status = await RNSInfo.getItem('attendence_status', {
      sharedPreferencesName: 'mySharedPrefs',
      keychainService: 'myKeychain',
    });
    const attendence_date = await RNSInfo.getItem('attendence_date', {
      sharedPreferencesName: 'mySharedPrefs',
      keychainService: 'myKeychain',
    });

    if (attendence_status === 'OUT') {
      setInstatus();
    } else if (attendence_status === 'CLOSED') {
      setOutstatus();
    }

    if (attendence_date == getTodaysDate()) {
      setStatus(attendence_status);
      setLoaded(true);
    } else {
      setLoaded(true);
      setStatus('CLOSED');
    }
  }

  function getTodaysDate() {
    var date = new Date().getDate(); //Current Date
    var month = new Date().getMonth() + 1; //Current Month
    var year = new Date().getFullYear();
    var full_date = year + '-' + month + '-' + date;
    return full_date;
  }

  // const startForegroundUpdate = async () => {
  //   // Check if foreground permission is granted
  //   const granted = await Location.checkPermission({
  //     ios: 'whenInUse',
  //     android: {
  //       detail: 'fine',
  //     },
  //   });
  //   if (!granted) {
  //     console.log('location tracking denied');
  //     return;
  //   }

  //   // Make sure that foreground location tracking is not running
  //   // foregroundSubscription?.remove();

  //   // Start watching position in real-time
  //   foregroundSubscription = await Location.subscribeToLocationUpdates(
  //     location => {
  //       setPosition(location[0]);
  //     },
  //   );
  // };

  // // Start location tracking in background
  // const startBackgroundUpdate = async () => {
  //   // console.log("Location tacking stopped");
  //   // Don't track position if permission is not granted
  //   const granted = await Location.checkPermission({
  //     ios: 'whenInUse',
  //     android: {
  //       detail: 'fine',
  //     },
  //   });
  //   if (!granted) {
  //     console.log('location tracking denied');
  //     return;
  //   }

  //   // Make sure the task is defined otherwise do not start tracking
  //   const isTaskDefined = await TaskManager.isTaskDefined(LOCATION_TASK_NAME);
  //   if (!isTaskDefined) {
  //     console.log('Task is not defined');
  //     return;
  //   }

  //   // Don't track if it is already running in background
  //   const hasStarted = await Location.hasStartedLocationUpdatesAsync(
  //     LOCATION_TASK_NAME,
  //   );
  //   if (hasStarted) {
  //     console.log('Already started');
  //     return;
  //   }

  //   await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
  //     // For better logs, we set the accuracy to the most sensitive option
  //     accuracy: Location.Accuracy.BestForNavigation,
  //     // Make sure to enable this notification if you want to consistently track in the background
  //     showsBackgroundLocationIndicator: true,
  //     deferredUpdatesInterval: 3000,
  //     foregroundService: {
  //       notificationTitle: 'OUI Attendance',
  //       notificationBody: 'Login to App for OUT Attendance',
  //       notificationColor: '#fff',
  //     },
  //   });
  // };

  // // Stop location tracking in background
  // const stopBackgroundUpdate = async () => {
  //   const hasStarted = await Location.hasStartedLocationUpdatesAsync(
  //     LOCATION_TASK_NAME,
  //   );
  //   if (hasStarted) {
  //     await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
  //     console.log('Location tacking stopped');
  //   }
  // };

  let openInPhotoPickerAsync = async () => {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Cool Photo App Camera Permission',
        message:
          'Cool Photo App needs access to your camera ' +
          'so you can take awesome pictures.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );

    if (
      Platform.OS === 'android' &&
      granted !== PermissionsAndroid.RESULTS.GRANTED
    ) {
      Alert.alert('Permission to access camera roll is required!');
      return;
    }
    try {
      // console.log('running');
      let options = {
        mediaType: 'photo',
        maxWidth: 300,
        maxHeight: 550,
        quality: 1,
      };

      let pickerResult = await launchCamera(options, response => {
        if (response.didCancel) {
          setinphotoSelected(false);
          return;
        } else if (response.errorCode == 'camera_unavailable') {
          setoutphotoSelected(true);
          return;
        } else if (response.errorCode == 'permission') {
          Alert.alert('Permission to access camera roll is required!');
          return;
        } else if (response.errorCode == 'others') {
          setoutphotoSelected(true);
          return;
        }
        console.log('base64 -> ', response.base64);
        console.log('uri -> ', response.uri);
        console.log('width -> ', response.width);
        console.log('height -> ', response.height);
        console.log('fileSize -> ', response.fileSize);
        console.log('type -> ', response.type);
        console.log('fileName -> ', response.fileName);
      });

      console.log(pickerResult, 'Result');

      setImage({localUri: pickerResult?.assets[0].uri});
      setinphotoSelected(true);
    } catch (error) {
      setoutphotoSelected(true);
      console.log('Error: ', error.message);
    }
  };

  let openOutPhotoPickerAsync = async () => {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Cool Photo App Camera Permission',
        message:
          'Cool Photo App needs access to your camera ' +
          'so you can take awesome pictures.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );

    if (
      Platform.OS === 'android' &&
      granted !== PermissionsAndroid.RESULTS.GRANTED
    ) {
      Alert.alert('Permission to access camera is required!');
      return;
    }
    try {
      let options = {
        mediaType: 'photo',
        maxWidth: 300,
        maxHeight: 550,
        quality: 1,
      };

      let pickerResult = await launchCamera(options, response => {
        if (response.didCancel) {
          setinphotoSelected(false);
          return;
        } else if (response.errorCode == 'camera_unavailable') {
          setoutphotoSelected(true);
          return;
        } else if (response.errorCode == 'permission') {
          Alert.alert('Permission to access camera roll is required!');
          return;
        } else if (response.errorCode == 'others') {
          setoutphotoSelected(true);
          return;
        }
        console.log('base64 -> ', response.base64);
        console.log('uri -> ', response.uri);
        console.log('width -> ', response.width);
        console.log('height -> ', response.height);
        console.log('fileSize -> ', response.fileSize);
        console.log('type -> ', response.type);
        console.log('fileName -> ', response.fileName);
      });

      setImage({localUri: pickerResult?.assets[0].uri});
      setoutphotoSelected(true);
    } catch (error) {
      setoutphotoSelected(true);
      console.log('Error: ', error.message);
    }
  };

  async function uploadData() {
    setLoaded(false);

    let formData = new FormData();
    if (image !== null) {
      let photolocalUri = image.localUri;
      let photofilename = photolocalUri.split('/').pop();
      let photomatch = /\.(\w+)$/.exec(photofilename);
      let phototype = photomatch ? `image/${photomatch[1]}` : `image`;

      formData.append('photo', {
        uri: photolocalUri,
        name: photofilename,
        type: phototype,
      });
    }

    formData.append('current_date', currentDate);
    formData.append('employee_id', authState.userToken);
    if (position != null) {
      formData.append('lat', position.latitude);
      formData.append('long', position.longitude);
    } else {
      formData.append('lat', '');
      formData.append('long', '');
    }
    const url = Network.apiurl + 'attendence';
    await axios
      .post(url, formData, {
        headers: {'Content-Type': 'multipart/form-data'},
      })
      .then(function (response) {
        if (response.data.status == true) {
          console.log('success');
          setinphotoSelected(false);
          setInstatus();
          setType('OUT');
          storeStatus('OUT');
        }
        setImage('');
        setLoaded(true);
        return;
      })
      .catch(function (error) {
        console.log(error + 'HERR');
      });
  }

  async function endSession() {
    setLoaded(false);
    let formData = new FormData();
    if (image !== null) {
      let photolocalUri = image?.localUri;
      let photofilename = photolocalUri.split('/').pop();
      let photomatch = /\.(\w+)$/.exec(photofilename);
      let phototype = photomatch ? `image/${photomatch[1]}` : `image`;
      formData.append('photo', {
        uri: photolocalUri,
        name: photofilename,
        type: phototype,
      });
    }

    formData.append('employee_id', authState.userToken);
    if (position != null) {
      formData.append('lat', position.latitude);
      formData.append('long', position.longitude);
    } else {
      formData.append('lat', '');
      formData.append('long', '');
    }
    const url = Network.apiurl + 'end_session';
    console.log(formData);
    // console.log(url);
    await axios
      .post(url, formData, {
        headers: {'Content-Type': 'multipart/form-data'},
      })
      .then(function (response) {
        if (response.data.status == true) {
          setType('CLOSED');
          storeStatus('CLOSED');
          setOutstatus();
          setoutphotoSelected(false);
        }
        setLoaded(true);
        return;
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  const setInAttadance = () => {
    openInPhotoPickerAsync();
    return false;
  };

  const setOutAttadance = () => {
    openOutPhotoPickerAsync();
    return false;
  };

  useEffect(() => {
    if (inphotoSelected) {
      uploadData();
    }

    if (outphotoSelected) {
      console.log('loging out');
      endSession();
    }
  }, [inphotoSelected, outphotoSelected]);

  // console.log(status);

  if (!loaded) {
    return <Loading />;
  } else {
    return (
      <View style={styles.container}>
        <View style={{marginBottom: 20}}>
          <Text style={styles.clock}>Bonjour</Text>
        </View>
        <View style={{marginBottom: 20}}>
          <Text style={styles.clock}>{clockTime}</Text>
        </View>

        {status === 'IN' && (
          <Button
            title={status}
            onPress={setInAttadance}
            containerStyle={styles.buttoncontainer}
          />
        )}

        {status === 'OUT' && (
          <Button
            title={status}
            onPress={setOutAttadance}
            containerStyle={styles.buttoncontainer}
          />
        )}

        {status === 'CLOSED' && (
          <Card>
            <Text style={{color: '#000'}}>Merci, visite le lendemain</Text>
          </Card>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttoncontainer: {
    width: 200,
    height: 100,
    alignSelf: 'center',
    marginTop: 50,
  },
  thumbnail: {
    width: 400,
    height: 300,
    resizeMode: 'contain',
  },
  clock: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#808080',
  },
});
