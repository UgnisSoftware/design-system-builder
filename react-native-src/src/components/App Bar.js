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
        <View style={styles["_rootNode"]}   >
            <Text style={styles["9e935993"]}  className="material-icons"  >
            menu
        </Text>
            <Text style={styles["e2efaae1"]}   >
            {this.state['d2588376']}
        </Text>
            <Text style={styles["b77dcff2"]}  className="material-icons"  >
            more_vert
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
        "height": 68,
        "position": "relative",
        "alignItems": "center",
        "justifyContent": "flex-start",
        "flexDirection": "row",
        "backgroundColor": "#00BCD4"
    },
    "9e935993": {
        "flex": 0,
        "display": "flex",
        "padding": 20,
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row",
        "color": "#fff",
        "fontSize": 24
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
        "padding": 20,
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row",
        "color": "#fff",
        "fontSize": 24
    }
}
);

export default App;
    