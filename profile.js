import React, { useEffect,useState } from "react";
import { StyleSheet, Text, View, SafeAreaView, Image, ScrollView, Button,DevSettings,  Alert, } from "react-native";
// import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import firebase from "@react-native-firebase/app";
import {
    GoogleSignin,
    statusCodes,
  } from '@react-native-google-signin/google-signin';

import {launchImageLibrary} from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import * as Progress from 'react-native-progress';
import PostView from './PostView';

signOut = async () => {
    try {
      await GoogleSignin.signOut();
      AsyncStorage.getAllKeys()
        .then(keys => AsyncStorage.multiRemove(keys))
        .then(() => DevSettings.reload());
    } catch (error) {
      console.error(error);
    }
  };


export default function App() {
    const [profile, setProfile] = useState("https://www.google.com/search?q=google+default+profile&source=lnms&tbm=isch&sa=X&ved=2ahUKEwijwPmH2_v9AhX5wjgGHTjsARoQ_AUoAXoECAEQAw&biw=1536&bih=714&dpr=1.25#imgrc=5ucjAVy0-StheM");
    const [name, setName] = useState("");
    const [id, setId] = useState("");
    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [transferred, setTransferred] = useState(0);
    const [posts,setPosts]=useState([]);

    const  selectImage = async () => {
        const options = {
          maxWidth: 2000,
          maxHeight: 2000,
          storageOptions: {
            skipBackup: false,
            path: 'images'
          }
        };
     
        await launchImageLibrary(options, response => {
          if (response.didCancel) {
            console.log('User cancelled image picker');
          } else if (response.error) {
            console.log('ImagePicker Error: ', response.error);
          } else if (response.customButton) {
            console.log('User tapped custom button: ', response.customButton);
          } else {
            const source = { uri: response.assets[0].uri };
            console.log("url",response.assets[0].uri);
            setImage(source);

            //image upload code

            const filename = response.assets[0].uri.substring(response.assets[0].uri.lastIndexOf('/') + 1);
            console.log("filename ",filename);
            setUploading(true);
            setTransferred(0);
            const task = storage()
              .ref(id)
              .putFile(response.assets[0].uri);
            // set progress state
            task.on('state_changed', snapshot => {
              setTransferred(
                Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 10000
              );
            });
            
            try {
               task;
            } catch (e) {
              console.error(e);
            }
            setUploading(false);
            Alert.alert(
              'Photo uploaded!',
              'Your photo has been uploaded to Firebase Cloud Storage!'
            );
            setImage(null);
            console.log("id",id);
            firestore().collection('user').doc(id)
                .update({
                story_posted:id,
                time:firebase.firestore.FieldValue.serverTimestamp()
                }).then(() => { console.log('User added!');}).catch((e)=>{console.log(e)});
          }
        });
    }
    const getMarker=async ()=> {
            let d=[];
          const response=firebase.firestore().collection('user');
            const data=await response.get();
            data.docs.forEach(item=>{
                d.push(item);
            })
            setPosts(d);
            console.lof(posts)
      }
    useEffect(()=>{
        getMarker();
        AsyncStorage.getItem('@_WhoPee_photo',(err,item) => {
            if (item) {
              setProfile(item)
            }
        });
        AsyncStorage.getItem('@_WhoPee_name',(err,item) => {
            if (item) {
              setName(item)
            }
        });
        AsyncStorage.getItem('@_WhoPee_id',(err,item) => {
            if (item) {
              setId(item)
            }
        });
    },[])
    
    return (
        <SafeAreaView style={styles.container}>
                {uploading ? (
            <View style={styles.progressBarContainer}>
                <Progress.Bar progress={transferred} width={300} />
            </View>
            ) : null}
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.titleBar}/>
                <View style={{ alignSelf: "center" }}>
                    <View style={styles.profileImage}>
                        <Image source={{uri:profile}} style={styles.image} resizeMode="contain"></Image>
                    </View>
                    <View style={styles.dm}/>
                    <View style={styles.active}></View>
                    <View style={styles.add}/>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={[styles.text, { fontWeight: "200", fontSize: 36 }]}>{name}</Text>
                    <Text style={[styles.text, { color: "#AEB5BC", fontSize: 14 }]}>Photographer</Text>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statsBox}>
                        <Text style={[styles.text, { fontSize: 24 }]}>483</Text>
                        <Text style={[styles.text, styles.subText]}>Story Shared</Text>
                    </View>
                    <View style={[styles.statsBox, { borderColor: "#DFD8C8", borderLeftWidth: 1, borderRightWidth: 1 }]}>
                        <Text style={[styles.text, { fontSize: 24 }]}>45,844</Text>
                        <Text style={[styles.text, styles.subText]}>Followers</Text>
                    </View>
                    <View style={styles.statsBox}>
                        <Text style={[styles.text, { fontSize: 24 }]}>302</Text>
                        <Text style={[styles.text, styles.subText]}>Following</Text>
                    </View>
                </View>
                <Text style={[styles.subText, styles.recent ,styles.Center]}>Stories</Text>
                <View style={{ marginLeft:15,marginRight:15 }}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <PostView postsData={posts}/>
                </ScrollView>
                </View>
                
            </ScrollView>
            <Button
                    onPress={selectImage}
                    title="Add Post"
                    color="#41444B"
                    style={styles.addFile}
                    accessibilityLabel="Learn more about this purple button"/>
            <Button
                    onPress={signOut}
                    title="Logout"
                    color="#41444B"
                    style={styles.logOut}
                    accessibilityLabel="Learn more about this purple button"/>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    Center:{
        alignSelf:"center",
        marginLeft:0,
        marginBottom:15
    },
    addFile: {
        bottom:60,
        height:100
    },
    container: {
        flex: 1,
        backgroundColor: "#FFF"
    },
    text: {
        fontFamily: "HelveticaNeue",
        color: "#52575D"
    },
    image: {
        flex: 1,
        height: undefined,
        width: undefined
    },
    titleBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 24,
        marginHorizontal: 16
    },
    subText: {
        fontSize: 12,
        color: "#AEB5BC",
        textTransform: "uppercase",
        fontWeight: "500"
    },
    profileImage: {
        width: 200,
        height: 200,
        borderRadius: 100,
        overflow: "hidden"
    },
    dm: {
        backgroundColor: "#41444B",
        position: "absolute",
        top: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center"
    },
    active: {
        backgroundColor: "#34FFB9",
        position: "absolute",
        bottom: 28,
        left: 10,
        padding: 4,
        height: 20,
        width: 20,
        borderRadius: 10
    },
    add: {
        backgroundColor: "#41444B",
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center"
    },
    infoContainer: {
        alignSelf: "center",
        alignItems: "center",
        marginTop: 16
    },
    statsContainer: {
        flexDirection: "row",
        alignSelf: "center",
        marginTop: 32
    },
    statsBox: {
        alignItems: "center",
        flex: 1
    },
    mediaImageContainer: {
        width: 180,
        height: 200,
        borderRadius: 12,
        overflow: "hidden",
        marginHorizontal: 10
    },
    mediaCount: {
        backgroundColor: "#41444B",
        position: "absolute",
        top: "50%",
        marginTop: -50,
        marginLeft: 30,
        width: 100,
        height: 100,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        shadowColor: "rgba(0, 0, 0, 0.38)",
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 20,
        shadowOpacity: 1
    },
    recent: {
        marginLeft: 78,
        marginTop: 32,
        marginBottom: 6,
        fontSize: 10
    },
    recentItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 16
    },
    activityIndicator: {
        backgroundColor: "#CABFAB",
        padding: 4,
        height: 12,
        width: 12,
        borderRadius: 6,
        marginTop: 3,
        marginRight: 20
    },
    logOut:{
       bottom:20,
       height:100
    },
    progressBarContainer: {
        marginTop: 20
    },
});