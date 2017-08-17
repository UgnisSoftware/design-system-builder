import React from 'react'
import {StyleSheet, View, Text, Image} from 'react-native'

class App extends React.Component {
  constructor(){
    super();
    this.state = {
    "3520f41f": 20,
    "edc8e3d7": 500
}
  }
  
  render() {
    return (
        <View style={styles["_rootNode"]}   >
            
        <View style={styles["b66c8694"]}   >
            
        <View style={styles["302f2cfa"]}   >
            
        <View style={styles["5828cfb6"]}   >
            
        </View>
        </View>
        </View>
            
        <View style={styles["206ae9e4"]}   >
            
        </View>
            <Text style={styles["cbcb1c5d"]}   >
            {(this.state['3520f41f']).concat(%)}
        </Text>
        </View>
    );
  }
}

const styles = StyleSheet.create(
    {
    "_rootNode": {
        "flex": 1,
        "display": "flex",
        "padding": 10,
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row"
    },
    "b66c8694": {
        "flex": 0,
        "display": "flex",
        "margin": "0 10px",
        "padding": 10,
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row"
    },
    "302f2cfa": {
        "flex": 0,
        "display": "flex",
        "height": 2,
        "width": "{(this.state['edc8e3d7']).concat(px)}",
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row",
        "backgroundColor": "#ccc"
    },
    "5828cfb6": {
        "flex": 0,
        "display": "flex",
        "height": 2,
        "width": "{({this.state['edc8e3d7'] * this.state['3520f41f'] / 100}).concat(px)}",
        "position": "absolute",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row",
        "backgroundColor": "#00BCD4"
    },
    "206ae9e4": {
        "flex": 0,
        "display": "flex",
        "height": 10,
        "width": 10,
        "position": "absolute",
        "top": 16,
        "left": "{({this.state['edc8e3d7'] * this.state['3520f41f'] / 100 + 15}).concat(px)}",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row",
        "borderRadius": 10,
        "backgroundColor": "#00BCD4"
    },
    "cbcb1c5d": {
        "flex": 0,
        "display": "flex",
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row"
    }
}
);

export default App;
    