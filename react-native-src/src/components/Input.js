import React from 'react'
import {StyleSheet, View, Text, Image} from 'react-native'

class App extends React.Component {
  constructor(){
    super();
    this.state = {
    "fb2f46a7": "",
    "0b41f82d": false,
    "cd45f9fd": "Title",
    "f5c5b9e9": "#e8e8e8",
    "1751b86a": "#adadad",
    "7d1e0433": "16px",
    "b913c956": "21px",
    "01a29e2d": "bc we are missing branching ",
    "8ce6b05f": "we put color, size, position in state",
    "8966b5c6": "in fact they def shouldn't be here",
    "625c5339": "but it's the only way for now",
    "a047ba19": "That's why title doesn't return to place",
    "6572c28f": "- we can't check if input is empty",
    "856b96e3": "Branching is the first item in our TODO "
}
  }
  
  render() {
    return (
        <View style={styles["_rootNode"]}   >
            <Text style={styles["93a303fd"]}   >
            {this.state['cd45f9fd']}
        </Text>
            <TextInput style={styles["a7e57d78"]}   value="this.state['fb2f46a7']" />
        </View>
    );
  }
}

const styles = StyleSheet.create(
    {
    "_rootNode": {
        "flex": 0,
        "display": "flex",
        "padding": 20,
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row"
    },
    "93a303fd": {
        "flex": 0,
        "display": "flex",
        "position": "absolute",
        "top": "{this.state['b913c956']}",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row",
        "transition": "all 500ms cubic-bezier(0.165, 0.84, 0.44, 1)",
        "color": "{this.state['1751b86a']}",
        "fontSize": "{this.state['7d1e0433']}",
        "fontWeight": "300",
        "lineHeight": 24
    },
    "a7e57d78": {
        "flex": 0,
        "display": "flex",
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "transition": "all 500ms cubic-bezier(0.165, 0.84, 0.44, 1)",
        "fontSize": 16,
        "fontWeight": "300",
        "lineHeight": 24
    }
}
);

export default App;
    