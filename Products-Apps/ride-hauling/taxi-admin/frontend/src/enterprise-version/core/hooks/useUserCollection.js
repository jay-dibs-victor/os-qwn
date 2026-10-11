import React, { useReducer, useEffect, useCallback } from 'react';

export default function useUserCollection(){
  
  //define the reducer switch case
  const userReducer = (state, action) => {
    switch(action.type){
    	case "FETCH_ALL":
    	  return { ...state}
    	case "FETCH":
    	  return { ...state}
    	case "ADD":
    	  return {...state}
    	case "UPDATE":
    	  return {...state}
    	case "DELETE":
    	  return {...state}
    	default:
    	  return {...state}
    }
  };
  //define the dispatch with useReducer
  const [state, dispatch] = useReducer(userReducer, {
  	user:[{
      firstaname:"",
      lastname:""
      userId:"",
      email:"",
      token:"",
      username:"",
      role:"",

  	}], initialized:false
  })

  useEffect(()=>{
   // implement the api for the fetch
  },[]);

  //return the hoooks state and dispatcher
   return [state, dispatch];

}