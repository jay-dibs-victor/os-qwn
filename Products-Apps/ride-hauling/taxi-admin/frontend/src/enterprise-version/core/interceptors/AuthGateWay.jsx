import React, {Suspense, useEffect } from  "react"
import { Redirect,  BrowserRouter, Switch } from "react-router-dom"

// gate way component interface for authentication
export const AuthenticateGateway = ({ user, userDispatcher,children}) =>{
 
 //clean up old browser token 
 const clearStaleToken = ()=>{
 	localStorage.clear();
  sessionStorage.clear();
 }

 //removed idle time code
 // clear idle state and refresh idle timer
 const kickOut =()=>{
    sessionStorage.removeItem("time_alloted")
    localStorage.clear();
  }
 //get the api for current user
 async function getUserCredentials(){

  try{
  	   
	   const url =`${import.meta.env.VITE_API_URL || 'http://localhost:12000/api/v1'}/auth/me`
	   const userResponse = await fetch(url);
	   const user = await userResponse.json();
	   console.log(user)
	   
	   if(user.hasOwnProperty("token") ){
	    userDispatcher({
	 	  type:"REAUTHENTICATE",
	 	  user:user
	    });
	    return user
	   }else{

	     userDispatcher({
	     	type:"AUTHENTICATION_ERROR",
	     	user:null
	     });
	     
	   }
   
  }	catch(error){
  	console.log(error)
	  kickOut()
  }
   
 }
 let mounted =true; //to cancel async request
 let redirect =false;
 let isLoginPage = (window.location.origin + "/login" == window.location.href); 
    
 if(!isLoginPage){
    redirect =true
 }
 useEffect(()=>{
 	getUserCredentials();
 	return () => mounted =false
 },[])

  
  console.log(user)
  if(!user.hasOwnProperty("token")) {
  	clearStaleToken();
  	let display = redirect== true? (
          <BrowserRouter>
             <Switch>
             <Suspense fallback={()=><div>Loading...</div>}>
                <Redirect  to="/login" />
              </Suspense>
             </Switch>
          </BrowserRouter>

  		): children
  	return display
  }
  return children

}

export default AuthenticateGateway