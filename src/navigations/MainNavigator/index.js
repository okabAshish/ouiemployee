import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React, {useLayoutEffect} from 'react';
import {Image} from 'react-native';

//SCREENS
import {faHome, faList, faUser} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import HomeScreen from '../../screens/HomeScreen';
import ProfileScreen from '../../screens/ProfileScreen';
import TaskScreen from '../../screens/TaskScreen';

const Tab = createBottomTabNavigator();
const INITIAL_ROUTE_NAME = 'Home';

export default function MainNavigator({navigation, route}) {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'OUI CD SALRU - V1',
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
  }, [navigation]);

  return (
    <Tab.Navigator initialRouteName={INITIAL_ROUTE_NAME}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Home',
          tabBarIcon: ({color, size}) => (
            <FontAwesomeIcon icon={faHome} size={size} color={color} />
          ),
          tabBarActiveTintColor: '#f4511e',
        }}
      />

      <Tab.Screen
        name="Task"
        component={TaskScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Task',
          tabBarIcon: ({color, size}) => (
            <FontAwesomeIcon icon={faList} size={size} color={color} />
          ),
          tabBarActiveTintColor: '#f4511e',
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Profile',
          tabBarIcon: ({color, size}) => (
            <FontAwesomeIcon icon={faUser} size={size} color={color} />
          ),
          tabBarActiveTintColor: '#f4511e',
        }}
      />
    </Tab.Navigator>
  );
}
