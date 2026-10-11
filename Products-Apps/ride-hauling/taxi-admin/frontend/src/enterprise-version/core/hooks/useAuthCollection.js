import React, { useReducer, useEffect, useCallback } from 'react';

// this is how you create your own hook 
//its easy dont let any book , videos or anybody 
//tell you shit!!
export  function useAuthCollection(){
  
  //define the reducer switch case
  const authReducer = (state, action) => {
    switch(action.type){
    	case "LOGIN":
    	  return { ...state}
        case "LOGOUT":
    	   return { ...state}
        case "FORGET_PASSWORD_REQUEST":
    	  return {...state}
    	case "CHANGE_PASSWORD":
    	  return {...state}
    	case "REAUTHENTICATE":
    	console.log("called me REAUTHENTICATE")
    	  return {...state}
    	case "DISABLE_LOADING":
    	  return {...state}
    	case "AUTHENTICATION_ERROR":
    	  console.log("called me AUTHENTICATION_ERROR")
    	  return {...state}
    	case "VALIDATION_ERROR":
    	  return {...state}
    	case "NETWORK_ERROR":
    	console.log("called me NETWORK_ERROR")
    	  return {...state}
    	default:
    	  return {...state}
    }
  };
  //define the [state, dispatch] = useReducer()
  const [state, interceptorDispatcher] = useReducer(authReducer, 
  	{
  		user:{} , 
  		loading:true,
  		token:null
  	})

  useEffect(()=>{
    // implement the api for the fetch api if its a display all content page
    // or run custom auto  events eg scroll, click, resize etc
  },[]);

  //return the hoooks state and dispatcher
   return [state, interceptorDispatcher];

}