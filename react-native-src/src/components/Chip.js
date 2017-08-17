import React from 'react'
import {StyleSheet, View, Text, Image} from 'react-native'

class App extends React.Component {
  constructor(){
    super();
    this.state = {
    "2c9dc061": "Default text"
}
  }
  
  render() {
    return (
        <View style={styles["_rootNode"]}   >
            
        <View style={styles["109d6f7a"]}   >
            <Image style={styles["c37bbe88"]}  src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Felis_silvestris_silvestris.jpg/208px-Felis_silvestris_silvestris.jpg"  source={require(".https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Felis_silvestris_silvestris.jpg/208px-Felis_silvestris_silvestris.jpg")} />
            <Text style={styles["5e455282"]}   >
            {this.state['2c9dc061']}
        </Text>
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
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row"
    },
    "109d6f7a": {
        "flex": 0,
        "display": "flex",
        "position": "relative",
        "alignItems": "center",
        "justifyContent": "flex-start",
        "flexDirection": "row",
        "borderRadius": 16,
        "backgroundColor": "#e4e4e4"
    },
    "c37bbe88": {
        "flex": 0,
        "display": "flex",
        "height": 32,
        "width": 32,
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row",
        "borderRadius": 16,
        "backgroundColor": "#00BCD4"
    },
    "5e455282": {
        "flex": 1,
        "display": "flex",
        "padding": 10,
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexDirection": "row",
        "flexWrap": "nowrap",
        "fontSize": 12
    }
}
);

export default App;
    