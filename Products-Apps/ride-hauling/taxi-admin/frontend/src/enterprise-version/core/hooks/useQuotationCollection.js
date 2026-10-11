import React, { useReducer, useEffect, useCallback } from 'react';

export default function useQuotationCollection(){
  
  //define the reducer switch case
  const quotationReducer = (state, action) => {
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
  const [state, dispatch] = useReducer(quotationReducer, {sos:[], initialized:false})

  useEffect(()=>{
   // implement the api for the fetch
  },[]);

  //return the hoooks state and dispatcher
   return [state, dispatch];

}