import {Button} from '@rneui/base';
import React, {useContext, useEffect, useState} from 'react';
import {
  Alert,
  Image,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';

import Loading from '../../components/Loading';
import {AuthContext} from '../../utils/AuthContext';

// import * as MediaLibrary from 'expo-media-library';

import {launchCamera} from 'react-native-image-picker';
import {openDatabase} from 'react-native-sqlite-storage';
const db = openDatabase({name: 'Task.db'});

let foregroundSubscription = null;

export default function AddTask({navigation, route}) {
  const {authState, signOut} = useContext(AuthContext);
  const [loaded, setLoaded] = useState(true);
  const [image, setImage] = useState(null);
  const [limage, setLImage] = useState(null);
  const [photoSelected, setphotoSelected] = useState(false);
  const [position, setPosition] = useState(null);
  const [currentDate, setCurrentDate] = useState('');
  const [store, setStore] = useState('');
  const [remarks, setRemarks] = useState('');
  const [phone, setPhone] = useState('');

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      async p => {
        console.log(p);
        setPosition(p?.coords);
      },
      error => {
        // See error code charts below.
        console.log(error.code, error.message);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'OUI CD SALRU',
      headerLeft: () => (
        <Image
          source={require('../../assets/icon.jpg')}
          style={{width: 36, height: 36, marginHorizontal: 10}}
        />
      ),
      headerTintColor: '#fff',
      headerStyle: {
        backgroundColor: '#f4511e',
      },
    });
    // });

    getLocation();

    //   const requestPermissions = async () => {
    //     const foreground = await Location.requestForegroundPermissionsAsync();
    //   };
    //   requestPermissions();
    //   startForegroundUpdate();

    var date = new Date().getDate(); //Current Date
    var month = new Date().getMonth() + 1; //Current Month
    var year = new Date().getFullYear(); //Current Year
    var hours = new Date().getHours(); //Current Hours
    var min = new Date().getMinutes(); //Current Minutes
    var sec = new Date().getSeconds(); //Current Seconds
    setCurrentDate(
      year + '-' + month + '-' + date + ' ' + hours + ':' + min + ':' + sec,
    );
  }, [navigation]);

  useEffect(
    function () {
      if (limage !== null) {
        addToDb();
      }
    },
    [limage],
  );

  // const startForegroundUpdate = async () => {
  //   const {granted} = await Location.getForegroundPermissionsAsync();
  //   if (!granted) {
  //     console.log('location tracking denied');
  //     return;
  //   }
  //   foregroundSubscription?.remove();

  //   foregroundSubscription = await Location.watchPositionAsync(
  //     {
  //       accuracy: Location.Accuracy.BestForNavigation,
  //     },
  //     location => {
  //       setPosition(location.coords);
  //     },
  //   );
  // };

  let openPhotoPickerAsync = async () => {
    if (Platform.OS === 'android') {
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

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permission to access camera roll is required!');
        return;
      }
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
          setphotoSelected(false);
          return;
        } else if (response.errorCode == 'camera_unavailable') {
          setphotoSelected(true);
          return;
        } else if (response.errorCode == 'permission') {
          Alert.alert('Permission to access camera roll is required!');
          return;
        } else if (response.errorCode == 'others') {
          setphotoSelected(true);
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

      setImage(pickerResult);
      setphotoSelected(true);
    } catch (error) {
      setphotoSelected(true);
      console.log('Error: ', error.message);
    }
  };

  const openImage = () => {
    openPhotoPickerAsync();
    return false;
  };

  //   const SaveToPhone = async item => {
  //     const permission = await MediaLibrary.requestPermissionsAsync();
  //     if (permission.granted) {
  //       setLoaded(false);
  //       try {
  //         const asset = await MediaLibrary.createAssetAsync(item);
  //         const part1 = asset.uri;
  //         const part2 = asset.filename;
  //         const part3 = asset.id;
  //         const img = part1 + '|' + part2 + '|' + part3;
  //         setLImage(img);
  //         setLoaded(true);
  //       } catch (error) {
  //         setLImage(null);
  //         setLoaded(true);
  //         console.log(error);
  //       }
  //     } else {
  //       console.log('Need Storage permission to save file');
  //     }
  //   };

  function addToDb() {
    db.transaction(function (tx) {
      tx.executeSql(
        'INSERT INTO ci_task (employee_id, task_time, latitude, longitude, image, store_name, remark, phone) VALUES (?,?,?,?,?,?,?,?)',
        [
          authState.userToken,
          currentDate,
          position != null ? position.latitude : '',
          position != null ? position.longitude : '',
          limage,
          store,
          remarks,
          phone,
        ],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            setLImage(null);
            Alert.alert(
              'Success',
              'Task saved successfully',
              [
                {
                  text: 'Ok',
                  onPress: () => navigation.navigate('Task'),
                },
              ],
              {cancelable: false},
            );
          } else console.log('Failed');
        },
      );
    });
  }

  async function saveTask() {
    console.log('Helo');
    if (!store || !phone || !remarks) {
      return Alert.alert('(*) fields are required');
    }

    if (!image) {
      return Alert.alert('Image required');
    }

    if (image !== null) {
      // console.log('No image');

      try {
        const asset = image.assets[0];
        const part1 = asset.uri;
        const part2 = asset.filename;
        const part3 = asset.id;
        const part4 = asset.type;
        const img = part1 + '|' + part2 + '|' + part3 + '|' + part4;
        setLImage(img);
        setLoaded(true);
      } catch (error) {
        setLImage(null);
        setLoaded(true);
        console.log(error);
      }
    }
    return;
  }

  if (!loaded) {
    return <Loading />;
  } else {
    return (
      <View style={styles.container}>
        {loaded && (
          <View style={styles.card}>
            <View>
              <Button
                title="Pick Image"
                containerStyle={styles.buttoncontainer}
                onPress={openImage}
              />
            </View>

            {photoSelected && (
              <Image
                source={{uri: image.assets[0].uri}}
                style={styles.thumbnail}
              />
            )}
            <View style={styles.list}>
              <Text style={styles.label}> Store Name* :</Text>
              <TextInput
                style={styles.input}
                onChangeText={store => setStore(store)}
                placeholderTextColor={'#808080'}
                value={store}
              />
            </View>

            <View style={styles.list}>
              <Text style={styles.label}> Phone* :</Text>
              <TextInput
                keyboardType="phone-pad"
                maxLength={10}
                style={styles.input}
                onChangeText={phone => setPhone(phone)}
                placeholderTextColor={'#808080'}
                value={phone}
              />
            </View>

            <View style={styles.list}>
              <Text style={styles.label}> Remarks* :</Text>
              <TextInput
                style={styles.input}
                onChangeText={remarks => setRemarks(remarks)}
                placeholderTextColor={'#808080'}
                value={remarks}
              />
            </View>

            <View>
              <Button
                title="Save"
                onPress={saveTask}
                containerStyle={{
                  width: 250,
                  margin: 10,
                  alignSelf: 'center',
                  marginVertical: 10,
                }}
                buttonStyle={{backgroundColor: '#333'}}
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
    alignItems: 'center',
    //   justifyContent: "center",
  },
  list_container: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  card: {
    padding: 2,
    margin: 2,
    marginTop: 20,
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
    paddingVertical: 20,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  thumb: {
    width: 200,
    height: 150,
    resizeMode: 'contain',
    backgroundColor: '#f7f7f7',
    alignSelf: 'center',
  },
  thumbnail: {
    width: 200,
    height: 100,
    resizeMode: 'contain',
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
    height: 60,
    color: '#000',
  },
  labelcontainer: {
    flexDirection: 'row',
    alignContent: 'center',
  },
  label: {
    width: 100,
    height: 40,
    textAlignVertical: 'center',
    color: '#000',
  },
  icon: {
    marginTop: 20,
    height: 40,
  },
  buttoncontainer: {
    width: 200,
    height: 100,
    alignSelf: 'center',
    marginVertical: 10,
  },
});
