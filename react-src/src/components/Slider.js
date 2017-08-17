import React from 'react'

class App extends React.Component {
  constructor(){
    super();
    this.state = {
    "3520f41f": 20,
    "edc8e3d7": 500
}
  }
  
  render() {
    return (
        <div style={styles["_rootNode"]}  >
            
        <div style={styles["b66c8694"]}  >
            
        <div style={styles["302f2cfa"]}  >
            
        <div style={styles["5828cfb6"]}  >
            
        </div>
        </div>
        </div>
            
        <div style={styles["206ae9e4"]}  >
            
        </div>
            <span style={styles["cbcb1c5d"]}  >{(this.state['3520f41f']).concat(%)}</span>
        </div>
    );
  }
}

const styles = {
    "_rootNode": {
        "flex": "1",
        "display": "flex",
        "maxHeight": "",
        "minHeight": "",
        "padding": "10px",
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "fontSize": ""
    },
    "b66c8694": {
        "display": "flex",
        "margin": "0 10px",
        "padding": "10px 0",
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start"
    },
    "302f2cfa": {
        "flex": "0 0 auto",
        "display": "flex",
        "height": "2px",
        "width": "{(this.state['edc8e3d7']).concat(px)}",
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "background": "#ccc"
    },
    "5828cfb6": {
        "display": "flex",
        "height": "2px",
        "width": "{({this.state['edc8e3d7'] * this.state['3520f41f'] / 100}).concat(px)}",
        "position": "absolute",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "background": "#00BCD4"
    },
    "206ae9e4": {
        "display": "flex",
        "height": "10px",
        "width": "10px",
        "position": "absolute",
        "top": "16px",
        "left": "{({this.state['edc8e3d7'] * this.state['3520f41f'] / 100 + 15}).concat(px)}",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "borderRadius": "10px",
        "background": "#00BCD4",
        "pointerEvents": "none"
    },
    "cbcb1c5d": {
        "flex": "0 0 auto",
        "display": "flex",
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "fontSize": ""
    }
};

export default App;
    