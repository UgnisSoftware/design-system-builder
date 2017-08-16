import React from 'react'
import {StyleSheet, View, Text, Image} from 'react-native'

class App extends React.Component {
  constructor(){
    super();
    this.state = {
    "d2588376": "Title"
}
  }
  
  render() {
    return (
        <View style={styles["_rootNode"]}>
            <Image
                style={styles["9e935993"]}
                source={{uri:'http://localhost:3000/images/menu.png'}}
            />
            <Text style={styles["e2efaae1"]}   >
            {this.state['d2588376']}
        </Text>
            <Image
                style={styles["b77dcff2"]}
                source={{uri:'http://localhost:3000/images/more_vert.png'}}
            />
        </View>
    );
  }
}

const styles = StyleSheet.create(
    {
    "_rootNode": {
        "flex": 0,
        "display": "flex",
        "height": 68,
        "position": "relative",
        "alignItems": "center",
        "justifyContent": "flex-start",
        "flexDirection": "row",
        "backgroundColor": "#FFC107"
    },
    "9e935993": {
        "flex": 0,
        "display": "flex",
        "margin": 20,
        width: 24,
        height: 24,
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row",
    },
    "e2efaae1": {
        "flex": 1,
        "display": "flex",
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row",
        "color": "#fff",
        "fontSize": 24
    },
    "b77dcff2": {
        "flex": 0,
        "display": "flex",
        "margin": 20,
        width: 24,
        height: 24,
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row",
    }
}
);

export default App;
    
    
    