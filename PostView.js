import {Dimensions,Text,FlatList,View,StyleSheet,SafeAreaView } from 'react-native';
  const numColumns = 3;
  const size = Dimensions.get('window').width/numColumns;
  const styles = StyleSheet.create({
    itemContainer: {
      width: size,
      height: size,
    },
    item: {
      flex: 1,
      margin: 3,
      backgroundColor: 'lightblue',
      textAlign:'center',
      alignItems:'center'
    }
  });
  const renderItem = ({ item }) => (
    item._data.story_posted!=""?
    <View style={styles.itemContainer}>
      <Text style={styles.item}>{item._data.name}</Text>
    </View>:null
  );
  export default function Grid(props) {
    console.log("propsssss  ",props.postsData);
    return (
      <SafeAreaView style={{flex: 1}}>
      <FlatList
        data={props.postsData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={numColumns} />
      </SafeAreaView>
    );
  }