import React from 'react'
import {StyleSheet, View, Text, Image} from 'react-native'

class App extends React.Component {
  constructor(){
    super();
    this.state = {
    "53f63c08": "Button"
}
  }
  
  render() {
    return (
        <View style={styles["_rootNode"]}   >
            <Text style={styles["303708f4"]}   >
            {this.state['53f63c08']}
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
    "303708f4": {
        "flex": 0,
        "display": "flex",
        "padding": 8,
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row",
        "backgroundColor": "#00BCD4",
        "color": "#fff"
    }
}
);

export default App;
    