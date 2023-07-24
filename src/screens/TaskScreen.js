import React, {useContext, useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import axios from 'axios';
import Network from '../constants/Network';

import {AuthContext} from '../utils/AuthContext';

import Loading from '../components/Loading';

import {Avatar, ListItem, Tab, TabView} from '@rneui/base';

// import * as MediaLibrary from 're';
import {openDatabase} from 'react-native-sqlite-storage';

const db = openDatabase({name: 'Task.db'});

export default function TaskScreen({navigation, route}) {
  const {authState, signOut} = useContext(AuthContext);
  const [loaded, setLoaded] = useState(false);
  const [taskList, setTaskList] = useState([]);
  const [ltaskList, setLTaskList] = useState([]);
  const [index, setIndex] = useState(0);
  const [img, setImg] = useState('');

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'create table if not exists ci_task (id integer primary key not null, employee_id int, task_time text, latitude text, longitude text, image text, store_name text, remark text, phone text, flag int DEFAULT 0 not null);',
      );
    });

    db.transaction(tx => {
      tx.executeSql('DELETE FROM ci_task;');
    });
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchList();
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM ci_task WHERE flag = 0',
          [],
          (tx, results) => {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i) {
              temp.push(results.rows.item(i));
              // console.log(results.rows.item(i));
            }

            setLTaskList(temp);
          },
        );
      });

      Linking.canOpenURL(Network.baseUrl).then(result => {
        if (result) {
          fetch(Network.baseUrl).then(res =>
            res.status === 200
              ? uploadToServer()
              : console.log('not connected'),
          );
        }
      });
    });
    return unsubscribe;
  }, [navigation]);

  async function uploadToServer() {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM ci_task WHERE flag = 0',
        [],
        (tx, results) => {
          for (let i = 0; i < results.rows.length; ++i) {
            let data = results.rows.item(i);
            saveToServer(data);
          }
        },
      );
    });
  }

  const setImage = image => {
    setImg(image);
  };

  async function saveToServer(data) {
    console.log('saving');

    try {
      let formData = new FormData();
      if (data.image) {
        let photoID = data.image.split('|')[0];

        let options = {
          mediaType: 'photo',
          maxWidth: 300,
          maxHeight: 550,
          quality: 1,
        };

        console.log(photoID, 'PHOTO');

        const iinfo = photoID;

        if (iinfo) {
          if (data.image) {
            let photolocalUri = iinfo;
            let photofilename = data.image.split('|')[1];
            let phototype = data.image.split('|')[3];

            formData.append('photo', {
              uri: photolocalUri,
              name: photofilename,
              type: phototype,
            });
          }
        }
      }

      formData.append('current_date', data.task_time);
      formData.append('store_name', data.store_name);
      formData.append('remarks', data.remark);
      formData.append('employee_id', data.employee_id);
      formData.append('phone', data.phone);

      formData.append('lat', data.latitude);
      formData.append('long', data.longitude);

      const url = Network.apiurl + 'task';

      await axios
        .post(url, formData, {
          headers: {'Content-Type': 'multipart/form-data'},
        })
        .then(function (response) {
          if (response.data.status == true) {
            updateFlag(data.id);
            console.log('data uploaded successfully');
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    } catch (err) {
      console.log('error:', err);
    }
  }

  function updateFlag(id) {
    db.transaction(function (tx) {
      tx.executeSql(
        'UPDATE ci_task SET flag = ? WHERE id = ?',
        [1, id],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            navigation.navigate('Task');
          } else alert('Failed');
        },
      );
    });
  }

  const fetchList = async () => {
    const url = Network.apiurl + 'task_list/' + authState.userToken;
    const result = await axios
      .get(url, {headers: {Authorization: Network.token}})
      .then(function (response) {
        if (response.data.status) {
          setTaskList(response.data.data);
        }
        setLoaded(true);
        return true;
      });
  };

  const keyExtractor = (item, myindex) => myindex.toString();

  const renderItem = ({item}) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigation.navigate('TaskDetailScreen', item)}>
      <ListItem bottomDivider>
        {item.image && <Avatar source={{uri: item.image}} />}
        <ListItem.Content>
          <ListItem.Title>{item.store_name}</ListItem.Title>
          <ListItem.Subtitle>{item.phone}</ListItem.Subtitle>
          <ListItem.Subtitle>{item.task_time}</ListItem.Subtitle>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
    </TouchableOpacity>
  );

  const renderLItem = ({item}) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigation.navigate('TaskDetailScreen', item)}>
      <ListItem bottomDivider>
        {item.image && <Avatar source={{uri: item.image.split('|')[0]}} />}
        <ListItem.Content>
          <ListItem.Title>{item.store_name}</ListItem.Title>
          <ListItem.Subtitle>{item.phone}</ListItem.Subtitle>
          <ListItem.Subtitle>{item.task_time}</ListItem.Subtitle>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
    </TouchableOpacity>
  );

  if (!loaded) {
    return <Loading />;
  } else {
    return (
      <>
        <Tab
          value={index}
          onChange={e => setIndex(e)}
          indicatorStyle={{
            backgroundColor: '#ffde38',
            height: 4,
          }}
          variant="primary">
          <Tab.Item
            title="Local"
            titleStyle={active => ({
              color: active ? '#ffffff' : '#333333',
              fontSize: 12,
            })}
            containerStyle={active => ({
              backgroundColor: active ? '#333333' : '#cccccc',
            })}
          />
          <Tab.Item
            title="Uploaded"
            titleStyle={active => ({
              color: active ? '#ffffff' : '#333333',
              fontSize: 12,
            })}
            containerStyle={active => ({
              backgroundColor: active ? '#333333' : '#cccccc',
            })}
          />
        </Tab>

        <TabView value={index} onChange={setIndex} animationType="spring">
          <TabView.Item style={{backgroundColor: '#ffffff', width: '100%'}}>
            <View style={styles.list_container}>
              <FlatList
                data={ltaskList}
                renderItem={renderLItem}
                keyExtractor={item => item.id}
              />
              {authState.inStatus && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.touchableOpacityStyle}
                  onPress={() => navigation.navigate('AddTask')}>
                  <Image
                    source={require('../assets/plus.jpg')}
                    style={styles.floatingButtonStyle}
                  />
                </TouchableOpacity>
              )}
            </View>
          </TabView.Item>
          <TabView.Item style={{width: '100%'}}>
            <View style={styles.list_container}>
              <FlatList
                data={taskList}
                renderItem={renderItem}
                keyExtractor={item => item.id}
              />
              {authState.inStatus && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.touchableOpacityStyle}
                  onPress={() => navigation.navigate('AddTask')}>
                  <Image
                    source={require('../assets/plus.jpg')}
                    style={styles.floatingButtonStyle}
                  />
                </TouchableOpacity>
              )}
            </View>
          </TabView.Item>
        </TabView>
      </>
    );
  }
}

const styles = StyleSheet.create({
  list_container: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },

  touchableOpacityStyle: {
    position: 'absolute',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    right: 30,
    bottom: 30,
  },
  floatingButtonStyle: {
    resizeMode: 'contain',
    width: 100,
    height: 100,
  },
});
