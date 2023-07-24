import React, {useState} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';

export default function TaskDetailScreen({navigation, route}) {
  const [loaded, setLoaded] = useState(true);
  const item = route.params;

  if (!loaded) {
  } else {
    return (
      <View style={styles.container}>
        <View style={styles.productBox}>
          {item.image ? (
            <Image
              style={{height: 250, width: '100%'}}
              source={{
                uri: item.image.split('|')[0],
              }}
              resizeMode={'contain'}
            />
          ) : (
            <Image
              style={{height: 250, width: '100%'}}
              source={require('../assets/empty.jpg')}
            />
          )}

          <Text style={styles.price}>
            {item.store_name + ' | ' + item.remark}
          </Text>
          <Text style={styles.price}>{item.store_name}</Text>
          <Text style={styles.proName}>{item.phone}</Text>
          <Text style={styles.proName}>{item.remark}</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  pageName: {
    margin: 10,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  productBox: {
    padding: 5,
    margin: 5,
    borderColor: 'orange',
    borderBottomWidth: 1,
  },
  price: {
    padding: 5,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  proName: {
    padding: 5,
    color: 'black',
    textAlign: 'center',
  },
});
