import React, { useReducer, useEffect, useCallback } from 'react';

export default function useEarningCollection(){
  
  //define the reducer switch case
  const earningReducer = (state, action) => {
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
  const [state, dispatch] = useReducer(earningReducer, {earning:[], initialized:false})

  useEffect(()=>{
   // implement the api for the fetch
  },[]);

  //return the hoooks state and dispatcher
   return [state, dispatch];

}