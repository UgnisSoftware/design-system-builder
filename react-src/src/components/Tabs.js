import React from 'react'

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
        <div style={styles["_rootNode"]}  >
            <span style={styles["ad87b71c"]}  >Example</span>
            <span style={styles["232dffbb"]}  >News</span>
            <span style={styles["67f8dc4c"]}  >Weather</span>
            <span style={styles["e52527b0"]}  >About</span>
            <span style={styles["917438b5"]}  >Download</span>
            
        <div style={styles["c4e2775d"]}  >
            
        </div>
        </div>
    );
  }
}

const styles = {
    "_rootNode": {
        "flex": "1",
        "display": "flex",
        "height": "68px",
        "maxHeight": "",
        "minHeight": "",
        "position": "relative",
        "alignItems": "center",
        "justifyContent": "center",
        "background": "#00BCD4",
        "fontSize": ""
    },
    "ad87b71c": {
        "flex": "1",
        "display": "flex",
        "padding": "22px 0",
        "position": "relative",
        "alignItems": "stretch",
        "justifyContent": "center",
        "cursor": "pointer",
        "color": "#fff",
        "fontSize": "20px"
    },
    "232dffbb": {
        "flex": "1",
        "display": "flex",
        "padding": "22px 0",
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "center",
        "cursor": "pointer",
        "color": "#fff",
        "fontSize": "20px"
    },
    "67f8dc4c": {
        "flex": "1",
        "display": "flex",
        "padding": "22px 0",
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "center",
        "cursor": "pointer",
        "color": "#fff",
        "fontSize": "20px"
    },
    "e52527b0": {
        "flex": "1",
        "display": "flex",
        "padding": "22px 0",
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "center",
        "cursor": "pointer",
        "color": "#fff",
        "fontSize": "20px"
    },
    "917438b5": {
        "flex": "1",
        "display": "flex",
        "padding": "22px 0",
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "center",
        "cursor": "pointer",
        "color": "#fff",
        "fontSize": "20px"
    },
    "c4e2775d": {
        "display": "flex",
        "height": "3px",
        "width": "20%",
        "position": "absolute",
        "top": "65px",
        "left": "{({this.state['a3fcfeb9'] * 20}).concat(%)}",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "background": "#FF9F57",
        "transition": "all 500ms cubic-bezier(0.165, 0.84, 0.44, 1)"
    }
};

export default App;
    