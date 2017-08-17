import React from 'react'

class App extends React.Component {
  constructor(){
    super();
    this.state = {
    "d2588376": "Title"
}
  }
  
  render() {
    return (
        <div style={styles["_rootNode"]}  >
            <span style={styles["9e935993"]}  className="material-icons" >menu</span>
            <span style={styles["e2efaae1"]}  >{this.state['d2588376']}</span>
            <span style={styles["b77dcff2"]}  className="material-icons" >more_vert</span>
        </div>
    );
  }
}

const styles = {
    "_rootNode": {
        "flex": "1",
        "display": "flex",
        "height": "68px",
        "position": "relative",
        "alignItems": "center",
        "justifyContent": "flex-start",
        "background": "#00BCD4",
        "boxShadow": "rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px",
        "fontSize": ""
    },
    "9e935993": {
        "display": "flex",
        "padding": "20px",
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "color": "#fff",
        "fontSize": "24px"
    },
    "e2efaae1": {
        "flex": "1",
        "display": "flex",
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "color": "#fff",
        "fontSize": "24px"
    },
    "b77dcff2": {
        "display": "flex",
        "padding": "20px",
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "color": "#fff",
        "fontSize": "24px"
    }
};

export default App;
    