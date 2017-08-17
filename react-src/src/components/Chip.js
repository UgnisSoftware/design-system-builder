import React from 'react'

class App extends React.Component {
  constructor(){
    super();
    this.state = {
    "2c9dc061": "Default text"
}
  }
  
  render() {
    return (
        <div style={styles["_rootNode"]}  >
            
        <div style={styles["109d6f7a"]}  >
            <img style={styles["c37bbe88"]}  src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Felis_silvestris_silvestris.jpg/208px-Felis_silvestris_silvestris.jpg"  />
            <span style={styles["5e455282"]}  >{this.state['2c9dc061']}</span>
        </div>
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
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "fontSize": ""
    },
    "109d6f7a": {
        "flex": "0 0 auto",
        "display": "flex",
        "position": "relative",
        "alignItems": "center",
        "justifyContent": "flex-start",
        "borderRadius": "16px",
        "background": "#e4e4e4"
    },
    "c37bbe88": {
        "flex": "0 0 auto",
        "display": "flex",
        "height": "32px",
        "width": "32px",
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "borderRadius": "16px",
        "background": "#00BCD4"
    },
    "5e455282": {
        "flex": "1 1 auto",
        "display": "flex",
        "padding": "10px",
        "position": "relative",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "flexWrap": "nowrap",
        "fontSize": "12px"
    }
};

export default App;
    