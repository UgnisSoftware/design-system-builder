import React from 'react'
import {StyleSheet, View, Text, Image} from 'react-native'

class App extends React.Component {
  constructor(){
    super();
    this.state = {
    "a3fcfeb9": 0,
    "a1a0bf21": "Tables are still wonky, that's why",
    "03dd908b": "the example has hardcoded 5 items"
}
  }
  
  render() {
    return (
        <View style={styles["_rootNode"]}   >
            <Text style={styles["ad87b71c"]}   >
            Example
        </Text>
            <Text style={styles["232dffbb"]}   >
            News
        </Text>
            <Text style={styles["67f8dc4c"]}   >
            Weather
        </Text>
            <Text style={styles["e52527b0"]}   >
            About
        </Text>
            <Text style={styles["917438b5"]}   >
            Download
        </Text>
            
        <View style={styles["c4e2775d"]}   >
            
        </View>
        </View>
    );
  }
}

const styles = StyleSheet.create(
    {
    "_rootNode": {
        "flex": 1,
        "display": "flex",
        "height": 68,
        "position": "relative",
        "alignItems": "center",
        "justifyContent": "center",
        "flexDirection": "row",
        "backgroundColor": "#00BCD4"
    },
    "ad87b71c": {
        "flex": 1,
        "display": "flex",
        "padding": 22,
        "position": "relative",
        "alignItems": "stretch",
        "justifyContent": "center",
        "flexDirection": "row",
        "color": "#fff",
        "fontSize": 20
    },
    "232dffbb": {
        "flex": 1,
        "display": "flex",
        "padding": 22,
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "center",
        "flexDirection": "row",
        "color": "#fff",
        "fontSize": 20
    },
    "67f8dc4c": {
        "flex": 1,
        "display": "flex",
        "padding": 22,
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "center",
        "flexDirection": "row",
        "color": "#fff",
        "fontSize": 20
    },
    "e52527b0": {
        "flex": 1,
        "display": "flex",
        "padding": 22,
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "center",
        "flexDirection": "row",
        "color": "#fff",
        "fontSize": 20
    },
    "917438b5": {
        "flex": 1,
        "display": "flex",
        "padding": 22,
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "center",
        "flexDirection": "row",
        "color": "#fff",
        "fontSize": 20
    },
    "c4e2775d": {
        "flex": 0,
        "display": "flex",
        "height": 3,
        "width": 20,
        "position": "absolute",
        "top": 65,
        "left": "{({this.state['a3fcfeb9'] * 20}).concat(%)}",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row",
        "backgroundColor": "#FF9F57",
        "transition": "all 500ms cubic-bezier(0.165, 0.84, 0.44, 1)"
    }
}
);

export default App;
    