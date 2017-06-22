
    
import React from 'react'
import {StyleSheet, View, Text, Image} from 'react-native'

class App extends React.Component {
  constructor(){
    super();
    this.state = {
       
    }
  }
  
  

  render() {
    return (
      <View style={styles["_rootNode"]}><Text style={styles["520e6e31-1627-496c-8f46-af4b3d746cad"]} >Button</Text></View>
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
        "flexDirection": "row",
        "flexWrap": "wrap",
        "overflow": "visible",
        "color": "#000000",
        "fontStyle": "normal",
        "fontWeight": "normal"
    },
    "520e6e31-1627-496c-8f46-af4b3d746cad": {
        "flex": 0,
        "display": "flex",
        "paddingTop": 8,
        "paddingBottom": 8,
        "paddingLeft": 16,
        "paddingRight": 16,
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row",
        "flexWrap": "wrap",
        "backgroundColor": "rgb(0, 188, 212)",
        "overflow": "visible",
        "color": "#fff",
        "fontStyle": "normal",
        "fontWeight": "normal"
    }
}
);

export default App;
    