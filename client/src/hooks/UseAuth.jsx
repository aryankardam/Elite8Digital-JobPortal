// import { useState, useEffect } from 'react';
// import api from '../Api';

// const useAuth = () => {
//   const [user, setUser] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       // Validate token on component load
//       // For this example, we'll assume a token means authenticated
//       setIsAuthenticated(true);
//     }
//   }, []);

//   const login = async (credentials) => {
//     try {
//       const response = await api.post('/auth/admin/login', credentials);
//       const { token, user } = response.data;
//       localStorage.setItem('token', token);
//       setUser(user);
//       setIsAuthenticated(true);
//       return true;
//     } catch (error) {
//       console.error('Login failed', error);
//       return false;
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem('token');
//     setUser(null);
//     setIsAuthenticated(false);
//   };

//   return { user, isAuthenticated, login, logout };
// };

// export default useAuth;
import React from 'react'

const UseAuth = () => {
  return (
    <div>
      
    </div>
  )
}

export default UseAuth
