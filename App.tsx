import {useEffect, useMemo, useReducer, useRef} from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import RNSInfo from 'react-native-sensitive-info';
import {AuthContext} from './src/utils/AuthContext';

import AuthNavigator from './src/navigations/AuthNavigator';
import MainNavigator from './src/navigations/MainNavigator';

import AddTask from './src/screens/AddTask';
import EditProfileScreen from './src/screens/EditProfileScreen';
import TaskDetailScreen from './src/screens/TaskDetailScreen';
import {initialState, reducer} from './src/utils/reducer';
// import EditProfileScreen from './screens/EditProfileScreen';
// import TaskDetailScreen from './screens/TaskDetailScreen';

const Stack = createNativeStackNavigator();

export default function App({navigation}) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const responseListener = useRef();

  // useEffect(() => {
  //   setTimeout(() => {
  //     SplashScreen.hide();
  //   }, 20000);
  // }, []);

  useEffect(() => {
    //console.log(state);
    // Fetch the token from storage then navigate to our appropriate place
    const bootstrapAsync = async () => {
      let userToken;

      try {
        userToken = await RNSInfo.getItem('user_id', {
          sharedPreferencesName: 'mySharedPrefs',
          keychainService: 'myKeychain',
        });

        //console.log(userToken);
      } catch (e) {
        // Restoring token failed
      }

      // After restoring token, we may need to validate it in production apps

      // This will switch to the App screen or Auth screen and this loading
      // screen will be unmounted and thrown away.
      dispatch({type: 'RESTORE_TOKEN', token: userToken});
    };

    bootstrapAsync();
  }, []);

  const authContextValue = useMemo(
    () => ({
      authState: state,
      signIn: async (user_id: any) => {
        await RNSInfo.setItem('user_id', user_id, {
          sharedPreferencesName: 'mySharedPrefs',
          keychainService: 'myKeychain',
        });
        await RNSInfo.setItem('attendence_status', 'CLOSED', {
          sharedPreferencesName: 'mySharedPrefs',
          keychainService: 'myKeychain',
        });

        var date = new Date().getDate(); //Current Date
        var month = new Date().getMonth() + 1; //Current Month
        var year = new Date().getFullYear();
        var full_date = year + '-' + month + '-' + date;
        await RNSInfo.setItem('attendence_date', full_date, {
          sharedPreferencesName: 'mySharedPrefs',
          keychainService: 'myKeychain',
        });
        dispatch({type: 'SIGN_IN', token: user_id});
      },
      signOut: async () => {
        await RNSInfo.deleteItem('user_id', {
          sharedPreferencesName: 'mySharedPrefs',
          keychainService: 'myKeychain',
        });
        dispatch({type: 'SIGN_OUT'});
      },
      signUp: async () => {
        //dispatch({ type: 'SIGN_IN', token: 'dummy-auth-token' });
      },
      setInstatus: async () => {
        dispatch({type: 'SIGN_IN', token: state.userToken, status: true});
      },
      setOutstatus: async () => {
        dispatch({type: 'SIGN_IN', token: state.userToken, status: false});
      },
    }),
    [state],
  );

  return (
    <AuthContext.Provider value={authContextValue}>
      <NavigationContainer>
        {state.userToken != null ? (
          <Stack.Navigator>
            <Stack.Screen name="Root" component={MainNavigator} />
            <Stack.Screen
              name="AddTask"
              options={{headerTitle: 'Add Task'}}
              component={AddTask}
            />
            <Stack.Screen
              name="TaskDetailScreen"
              options={{headerTitle: 'Task Details'}}
              component={TaskDetailScreen}
            />
            <Stack.Screen
              name="EditProfileScreen"
              options={{headerTitle: 'Edit Profile'}}
              component={EditProfileScreen}
            />
          </Stack.Navigator>
        ) : (
          <Stack.Navigator>
            <Stack.Screen
              name="Auth"
              component={AuthNavigator}
              options={{headerShown: false}}
            />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
