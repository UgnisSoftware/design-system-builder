import React from 'react'
import {StyleSheet, View, Text, Image} from 'react-native'

class App extends React.Component {
  constructor(){
    super();
    this.state = {
    "6bbf6dc5": 120,
    "c935e320": 85,
    "5d2b8aa2": 39,
    "09e53aba": 1
}
  }
  
  render() {
    return (
        <View style={styles["_rootNode"]}   >
            
        <View style={styles["c115cf33"]}   >
            
        <View style={styles["6db9fd4c"]}   >
            
        <View style={styles["f22be8ec"]}   >
            
        <View style={styles["3589ea97"]}   >
            
        <View style={styles["e3b56982"]}   >
            
        <View style={styles["108a2374"]}   >
            
        </View>
        </View>
        </View>
        </View>
        </View>
            
        <View style={styles["c9460b57"]}   >
            
        <View style={styles["6171c466"]}   >
            
        </View>
            
        <View style={styles["4e5febd4"]}   >
            
        <View style={styles["30436ae1"]}   >
            
        </View>
            
        <View style={styles["60962e82"]}   >
            
        </View>
            
        <View style={styles["24e68bc7"]}   >
            
        <View style={styles["047a1dd4"]}   >
            
        </View>
            
        <View style={styles["ce36dfe7"]}   >
            
        </View>
        </View>
        </View>
        </View>
        </View>
            <Text style={styles["50ce2491"]}   >
            You might want to click the play button in the top right corner :) (ctrl+space works too)
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
        "padding": 20,
        "paddingLeft": 20,
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row",
        "backgroundColor": "{((hsl( ).concat(this.state['6bbf6dc5'])).concat({((,).concat(this.state['c935e320'])).concat({((%,).concat(this.state['5d2b8aa2'])).concat(%))})})}"
    },
    "c115cf33": {
        "flex": 0,
        "display": "flex",
        "width": 225,
        "minWidth": 225,
        "position": "relative",
        "alignItems": "stretch",
        "justifyContent": "stretch",
        "flexDirection": "column",
        "backgroundColor": "white"
    },
    "6db9fd4c": {
        "flex": 1,
        "display": "flex",
        "height": 125,
        "minHeight": 125,
        "position": "relative",
        "alignItems": "stretch",
        "justifyContent": "stretch",
        "flexDirection": "row"
    },
    "f22be8ec": {
        "flex": 1,
        "display": "flex",
        "position": "relative",
        "alignItems": "stretch",
        "justifyContent": "stretch",
        "flexDirection": "row",
        "backgroundColor": "{((hsl().concat(this.state['6bbf6dc5'])).concat(,100%,50%))}"
    },
    "3589ea97": {
        "flex": 1,
        "display": "flex",
        "position": "relative",
        "alignItems": "stretch",
        "justifyContent": "stretch",
        "flexDirection": "row",
        "backgroundColor": "linear-gradient(to right, rgb(255, 255, 255), rgba(255, 255, 255, 0))"
    },
    "e3b56982": {
        "flex": 1,
        "display": "flex",
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row",
        "backgroundColor": "linear-gradient(to top, rgb(0, 0, 0), rgba(0, 0, 0, 0))"
    },
    "108a2374": {
        "flex": 0,
        "display": "flex",
        "height": 10,
        "minHeight": 10,
        "width": 10,
        "minWidth": 10,
        "padding": "0",
        "position": "absolute",
        "top": "{({this.state['5d2b8aa2'] / {this.state['c935e320'] * -0.01 + 2} - 50 / -0.4 - 5}).concat(px)}",
        "left": "{({this.state['c935e320'] * 2.25 - 5}).concat(px)}",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row",
        "border": 1,
        "borderBottom": 1,
        "borderLeft": 1,
        "borderRight": 1,
        "borderRadius": 5
    },
    "c9460b57": {
        "flex": 0,
        "display": "flex",
        "padding": 12,
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row"
    },
    "6171c466": {
        "flex": 0,
        "display": "flex",
        "margin": 8,
        "padding": 8,
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row",
        "borderRadius": 8,
        "backgroundColor": "{((hsl().concat(this.state['6bbf6dc5'])).concat({((,).concat(this.state['c935e320'])).concat({((%,).concat(this.state['5d2b8aa2'])).concat(%))})})}"
    },
    "4e5febd4": {
        "flex": 1,
        "display": "flex",
        "position": "relative",
        "alignItems": "stretch",
        "justifyContent": "flex-start",
        "flexDirection": "column"
    },
    "30436ae1": {
        "flex": 1,
        "display": "flex",
        "height": 10,
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row",
        "backgroundColor": "linear-gradient(to right, rgb(255, 0, 0) 0%, rgb(255, 255, 0) 17%, rgb(0, 255, 0) 33%, rgb(0, 255, 255) 50%, rgb(0, 0, 255) 67%, rgb(255, 0, 255) 83%, rgb(255, 0, 0) 100%)"
    },
    "60962e82": {
        "flex": 0,
        "display": "flex",
        "height": 10,
        "width": 10,
        "position": "absolute",
        "left": "{({this.state['6bbf6dc5'] * 169 / 360 - 5}).concat(px)}",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row",
        "borderRadius": 10,
        "backgroundColor": "rgb(248, 248, 248)"
    },
    "24e68bc7": {
        "flex": 1,
        "display": "flex",
        "height": 10,
        "margin": 10,
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row",
        "backgroundColor": "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==) left center"
    },
    "047a1dd4": {
        "flex": 1,
        "display": "flex",
        "height": 10,
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row",
        "backgroundColor": "linear-gradient(to right, rgba(25, 77, 51, 0) 0%, rgb(25, 77, 51) 100%)"
    },
    "ce36dfe7": {
        "flex": 0,
        "display": "flex",
        "height": 10,
        "width": 10,
        "position": "absolute",
        "left": "{({this.state['09e53aba'] * 169 - 5}).concat(px)}",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row",
        "borderRadius": 10,
        "backgroundColor": "rgb(248, 248, 248)"
    },
    "50ce2491": {
        "flex": 0,
        "display": "flex",
        "margin": 20,
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row",
        "color": "#fff"
    }
}
);

export default App;
    