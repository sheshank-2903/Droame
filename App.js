
import React,{Component } from 'react';
import {DevSettings,Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Profile from './profile';
import firestore from '@react-native-firebase/firestore';
// var config = {
//     databaseURL: "https://droame-b5299.firebaseio.com",
//     projectId: "droame-b5299",
// };

import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

export default class App extends Component  {
  constructor(props) {
    super(props);
    this.state = {
      firstLaunch: true,
    }
    GoogleSignin.configure({
      androidClientId: '10608570089-1d60cug932bdarsmbbt034sknj9uscjs.apps.googleusercontent.com',
      offlineAccess: true,
      webClientId: '10608570089-k02sj23mj5s49iljic716oo1tilqs122.apps.googleusercontent.com',
  });
}

componentDidMount() {
  this.firstLaunchCheck();
}

firstLaunchCheck = () => {
AsyncStorage.getItem("@_WhoPee_FirstLaunch").then(value => {
  console.log(" run  "+value)
  if (value === null) {
      console.log(" run  if "+value)
      //AsyncStorage.setItem("@_WhoPee_FirstLaunch","true");
      GoogleSignin.hasPlayServices().then((hasPlayService) => {
        if (hasPlayService) {
          GoogleSignin.signIn().then( async (userInfo) => {
                    firestore().collection('user').doc(userInfo.user.id)
                    .get().then((data) => {
                      if(data._exists!=false){
                        firestore()
                        .collection('user').doc(userInfo.user.id)
                        .update({
                          name: userInfo.user.givenName,
                          profile_pic: userInfo.user.photo,
                        })
                        .then(() => {
                            console.log('User updated!');
                        });
                        console.log("welcome back")
                      }
                      else{
                        firestore()
                          .collection('user').doc(userInfo.user.id)
                          .set({
                            name: userInfo.user.givenName,
                            profile_pic: userInfo.user.photo,
                            story_posted:"",
                            time:""
                          })
                          .then(() => {
                            console.log('User added!');
                          }).catch((e)=>{console.log(e)});
                      }
                    })
                    await AsyncStorage.setItem("@_WhoPee_name",userInfo.user.givenName);
                    await AsyncStorage.setItem("@_WhoPee_photo",userInfo.user.photo);
                    await AsyncStorage.setItem("@_WhoPee_id",userInfo.user.id);
                    await  AsyncStorage.setItem("@_WhoPee_FirstLaunch",'false');
                    this.setState({firstLaunch:true})
                    DevSettings.reload();
          }).catch((e) => {console.log("ERROR IS: " + JSON.stringify(e));})
        }}).catch((e) => {console.log("ERROR IS: " + JSON.stringify(e));});
      
    }
  else {
    console.log(" run else  "+value)
    this.setState({firstLaunch:false})
  }
  });
}

  render(){
      if(!this.state.firstLaunch){
        return(<Profile/>);
      }

  }
}