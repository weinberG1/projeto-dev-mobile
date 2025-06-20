import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider } from "../context/AuthContext.js";
import HomeScreen from "../screens/HomeScreen.js";

export default function AppNavigator () {
    const Stack = createNativeStackNavigator();

    return (
        <AuthProvider>
            <Stack.Navigator>
                <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            </Stack.Navigator>
        </AuthProvider>
        
    )
}