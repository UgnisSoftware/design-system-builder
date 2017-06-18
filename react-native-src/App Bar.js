
    
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
      <View style={styles["_rootNode"]}><View style={styles["be65cb8a-f8f1-479c-8fac-f526e39c8d36"]}><Image style={styles["c5757142-8d89-443c-8a27-2dc24b24c86e"]} source={require("./images/list_icon.png")} /><Text style={styles["25461dab-9484-4762-8f53-0676d01bca31"]} >Title</Text><Image style={styles["cb513100-42d5-427a-8ee6-57fccbed4e84"]} source={require("./images/ic_expand_more_white_24dp.png")} /></View></View>
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
        "overflow": "visible"
    },
    "be65cb8a-f8f1-479c-8fac-f526e39c8d36": {
        "flex": 1,
        "display": "flex",
        "height": 68,
        "position": "relative",
        "alignItems": "center",
        "justifyContent": "flex-start",
        "flexDirection": "row",
        "flexWrap": "wrap",
        "backgroundColor": "rgb(0, 188, 212)",
        "overflow": "visible"
    },
    "c5757142-8d89-443c-8a27-2dc24b24c86e": {
        "flex": 0,
        "display": "flex",
        "marginTop": 8,
        "marginBottom": 8,
        "marginLeft": 8,
        "marginRight": 8,
        "paddingTop": 12,
        "paddingBottom": 12,
        "paddingLeft": 12,
        "paddingRight": 12,
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row",
        "flexWrap": "wrap",
        "overflow": "visible"
    },
    "25461dab-9484-4762-8f53-0676d01bca31": {
        "flex": 1,
        "display": "flex",
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row",
        "flexWrap": "wrap",
        "overflow": "visible",
        "color": "rgb(255, 255, 255)",
        "fontStyle": "normal",
        "fontSize": 24,
        "fontWeight": "400"
    },
    "cb513100-42d5-427a-8ee6-57fccbed4e84": {
        "flex": 0,
        "display": "flex",
        "marginTop": 8,
        "marginBottom": 8,
        "marginLeft": 8,
        "marginRight": 8,
        "paddingTop": 12,
        "paddingBottom": 12,
        "paddingLeft": 12,
        "paddingRight": 12,
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row",
        "flexWrap": "wrap",
        "overflow": "visible"
    }
}
);

export default App;
    