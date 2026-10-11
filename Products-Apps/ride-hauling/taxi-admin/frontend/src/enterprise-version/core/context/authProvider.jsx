import React, { useContext , useEffect, useState, useCallback } from 'react'
import { useAuthCollection } from '../hooks/useAuthCollection';
import AuthenticateGatewayInterceptor from "../interceptors/AuthGateway"

// define the auth context with default data to be overridden by use the useAuth
export const AuthContext = React.createContext({
	user:null,
	token:null,
	loading:false
});


export const AuthProvider = ({ children }) => {
    const [{ loading, user, token }, interceptorDispatcher] = useAuthCollection();
 //   console.log(loading, user,token)
    return (
        <AuthContext.Provider value={{ loading, user, token, interceptorDispatcher }}>
          <AuthenticateGatewayInterceptor 
             children={children} 
             user={user}  
             userDispatcher={interceptorDispatcher}
          />
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const authCtx = useContext(AuthContext);
    //console.log(authCtx)
    if (!authCtx) {
        throw new Error("Component beyond auth context!")
    }
    return authCtx;
}


