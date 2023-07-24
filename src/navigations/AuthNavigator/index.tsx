import {createNativeStackNavigator} from '@react-navigation/native-stack';

// SCREENS
import ForgotScreen from '../../screens/ForgotScreen';
import LoginScreen from '../../screens/LoginScreen';

const Stack = createNativeStackNavigator();

const INITIAL_ROUTE_NAME = 'Login';

export default function AuthNavigator({navigation, route}) {
  return (
    <Stack.Navigator initialRouteName={INITIAL_ROUTE_NAME}>
      <Stack.Screen
        name="Login"
        options={{headerShown: false}}
        component={LoginScreen}
      />
      <Stack.Screen
        name="Forgot"
        options={{headerShown: false}}
        component={ForgotScreen}
      />
    </Stack.Navigator>
  );
}
