
    
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
      <View style={styles["_rootNode"]}><View style={styles["9712b8be-eb07-455d-846c-b6de3e093f11"]}><Image style={styles["4558840d-9d72-499b-81b2-1023c79ff663"]} source={require("./images/avatar2.jpg")} /><Text style={styles["6870eb05-e861-41c1-8590-c29272b0a9cd"]} >Image Avatar</Text></View></View>
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
    "9712b8be-eb07-455d-846c-b6de3e093f11": {
        "flex": 1,
        "display": "flex",
        "paddingTop": 8,
        "paddingBottom": 8,
        "paddingLeft": "0px",
        "paddingRight": "0px",
        "alignItems": "center",
        "justifyContent": "flex-start",
        "flexDirection": "row",
        "flexWrap": "wrap",
        "overflow": "visible"
    },
    "4558840d-9d72-499b-81b2-1023c79ff663": {
        "flex": 0,
        "display": "flex",
        "height": 60,
        "width": 60,
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row",
        "flexWrap": "wrap",
        "borderRadius": 100,
        "overflow": "visible"
    },
    "6870eb05-e861-41c1-8590-c29272b0a9cd": {
        "flex": 1,
        "display": "flex",
        "marginLeft": 5,
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row",
        "flexWrap": "wrap",
        "overflow": "visible",
        "color": "rgba(0, 0, 0, 0.87)",
        "fontStyle": "normal",
        "fontSize": 18,
        "fontWeight": "normal",
        "lineHeight": 18
    }
}
);

export default App;
    