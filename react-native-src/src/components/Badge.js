import React from 'react'
import {StyleSheet, View, Text, Image} from 'react-native'

class App extends React.Component {
  constructor(){
    super();
    this.state = {
    "951ac584": 1
}
  }
  
  render() {
    return (
        <View style={styles["_rootNode"]}   >
            <Text style={styles["fcec390d"]}  className="material-icons"  >
            notifications
        </Text>
            <Text style={styles["218a8e38"]}   >
            {this.state['951ac584']}
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
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row"
    },
    "fcec390d": {
        "flex": 0,
        "display": "flex",
        "position": "absolute",
        "top": 16,
        "left": 8,
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row",
        "fontSize": 24
    },
    "218a8e38": {
        "flex": 0,
        "display": "flex",
        "height": 24,
        "width": 24,
        "position": "absolute",
        "left": 24,
        "alignItems": "center",
        "justifyContent": "center",
        "flexDirection": "row",
        "borderRadius": 20,
        "backgroundColor": "#00BCD4",
        "color": "#fff",
        "fontSize": 12
    }
}
);

export default App;
    