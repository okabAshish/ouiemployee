import React, {useState} from 'react';
import {Image, StyleSheet, View} from 'react-native';

import * as ImagePicker from 'expo-image-picker';

import {Button} from '@rneui/base';

import * as Location from 'expo-location';

const AttendenceButton = ({navigation, type}) => {
  let foregroundSubscription = null;
  const [loaded, setLoaded] = useState(true);
  const [image, setImage] = useState(null);
  const [photoSelected, setphotoSelected] = useState(false);
  const [position, setPosition] = useState(null);

  const startForegroundUpdate = async () => {
    // Check if foreground permission is granted
    const {granted} = await Location.getForegroundPermissionsAsync();
    if (!granted) {
      console.log('location tracking denied');
      return;
    }

    // Make sure that foreground location tracking is not running
    foregroundSubscription?.remove();

    // Start watching position in real-time
    foregroundSubscription = await Location.watchPositionAsync(
      {
        // For better logs, we set the accuracy to the most sensitive option
        accuracy: Location.Accuracy.BestForNavigation,
      },
      location => {
        setPosition(location.coords);
      },
    );
  };

  let openPhotoPickerAsync = async () => {
    let permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    }
    let pickerResult = await ImagePicker.launchCameraAsync({quality: 0.5});
    //console.log(pickerResult);

    if (pickerResult.cancelled === true) {
      setphotoSelected(false);
      return;
    }
    setImage({localUri: pickerResult.uri});
    setphotoSelected(true);
  };

  const setAttadance = () => {
    if (type == 'IN') {
      startBackgroundUpdate();
    } else {
      stopBackgroundUpdate();
    }

    openPhotoPickerAsync();
    return false;
  };

  let uploadData = async () => {};

  return (
    <View style={styles.container}>
      {photoSelected && (
        <Image source={{uri: image.localUri}} style={styles.thumbnail} />
      )}
      <Button
        title={type}
        onPress={setAttadance}
        containerStyle={styles.buttoncontainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
});

export default AttendenceButton;
