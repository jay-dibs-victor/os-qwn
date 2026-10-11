import React, { useReducer, useEffect, useCallback } from 'react';

// this is how you create your own hook 
//its easy dont let any book , videos or anybody 
//tell you shit!!
export default function useBookingCollection(){
  
  //define the reducer switch case
  const bookingReducer = (state, action) => {
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
  const [state, dispatch] = useReducer(bookingReducer, {booking:[], initialized:false})

  useEffect(()=>{
   // implement the api for the fetch
  },[]);

  //return the hoooks state and dispatcher
   return [state, dispatch];

}