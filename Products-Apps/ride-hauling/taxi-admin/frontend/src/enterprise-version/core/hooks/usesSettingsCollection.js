import React, { useReducer, useEffect, useCallback } from 'react';

export default function useSettingCollection(){
  
  //define the reducer switch case
  const settingsReducer = (state, action) => {
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
  const [state, dispatch] = useReducer(settingsReducer, {
  	settings:[{
  		type:"",
  		public_testId:"",
  		private_testid:"",
  		public_liveId:"",
  		private_liveId:""
  	}]
  	, initialized:false
  })

  useEffect(()=>{
   // implement the api for the fetch
  },[]);

  //return the hoooks state and dispatcher
   return [state, dispatch];

}