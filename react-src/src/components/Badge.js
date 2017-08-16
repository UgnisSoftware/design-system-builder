import React from 'react'

class App extends React.Component {
  constructor(){
    super();
    this.state = {
    "951ac584": 1
}
  }
  
  render() {
    return (
        <div style={styles["_rootNode"]}  >
            <span style={styles["fcec390d"]}  className="material-icons" >notifications</span>
            <span style={styles["218a8e38"]}  >{this.state['951ac584']}</span>
        </div>
    );
  }
}

const styles = {
    "_rootNode": {
        "flex": "1",
        "display": "flex",
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "fontSize": ""
    },
    "fcec390d": {
        "display": "flex",
        "position": "absolute",
        "top": "16px",
        "left": "8px",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "fontSize": "24px"
    },
    "218a8e38": {
        "display": "flex",
        "height": "24px",
        "width": "24px",
        "position": "absolute",
        "left": "24px",
        "alignItems": "center",
        "justifyContent": "center",
        "borderRadius": "20px",
        "background": "#00BCD4",
        "color": "#fff",
        "fontSize": "12px"
    }
};

export default App;
    