import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './login';
import ClientRegister from './ClientRegister';
import SellerRegister from './SellerRegister';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [clientRegisterData, setClientRegisterData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    region: '',
    city: '',
    address: '',
  });
  const [sellerRegisterData, setSellerRegisterData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    region: '',
    city: '',
    address: '',
    businessName: '',
  });
  

  const handleRegister = async (userData: any) => {
    // Add your registration logic here
    console.log('Registering user:', userData);
  };

  return (
    <Stack.Navigator>
      {isLogin ? (
        <Stack.Screen name="Login">
          {() => (
            <Login
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              setIsLogin={setIsLogin}
              loginData={loginData}
              setLoginData={setLoginData}
            />
          )}
        </Stack.Screen>
      ) : (
        <>
          <Stack.Screen name="ClientRegister">
            {() => (
              <ClientRegister
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                setIsLogin={setIsLogin}
                handleRegister={handleRegister}
                registerData={clientRegisterData}
                setRegisterData={setClientRegisterData}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="SellerRegister">
            {() => (
              <SellerRegister
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                setIsLogin={setIsLogin}
                handleRegister={handleRegister}
                registerData={sellerRegisterData}
                setRegisterData={setSellerRegisterData}
              />
            )}
          </Stack.Screen>
        </>
      )}
    </Stack.Navigator>
  );
}