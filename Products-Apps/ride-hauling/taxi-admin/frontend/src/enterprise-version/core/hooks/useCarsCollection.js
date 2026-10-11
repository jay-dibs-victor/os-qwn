import React, { useReducer, useEffect, useCallback } from 'react';

// this is how you create your own hook 
//its easy dont let any book , videos or anybody 
//tell you shit!!
export default function useCarCollection(){
  
  //define the reducer switch case
  const sosReducer = (state, action) => {
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
    	case "PARTNER_RETRIEVAL_REQUEST":
    	  return {...state}

    	case "CAR_INSPECTION_REQUEST":
    	  return {...state}
    	default:
    	  return {...state}
    }
  };
  //define the dispatch with useReducer
  const [state, dispatch] = useReducer(carReducer, {car:[], initialized:false})

  useEffect(()=>{
   // implement the api for the fetch
  },[]);

  //return the hoooks state and dispatcher
   return [state, dispatch];

}