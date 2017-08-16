import React from 'react'

class App extends React.Component {
  constructor(){
    super();
    this.state = {
    "53f63c08": "Button"
}
  }
  
  render() {
    return (
        <div style={styles["_rootNode"]}  >
            <span style={styles["303708f4"]}  >{this.state['53f63c08']}</span>
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
    "303708f4": {
        "flex": "0 0 auto",
        "display": "flex",
        "padding": "8px 16px",
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "background": "#00BCD4",
        "boxShadow": "rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px",
        "color": "#fff",
        "fontSize": ""
    }
};

export default App;
    