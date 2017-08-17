import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Appbar from './components/App Bar';
// import Badge from './components/Badge';
// import Button from './components/Button';
// import Chip from './components/Chip';
// import ColorPicker from './components/Color picker';
// import Slider from './components/Slider';
// import Tabs from './components/Tabs';

class App extends Component {
  render() {
    return (
      <div className="App">

        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React Web</h2>
        </div>
          <Appbar />
      </div>
    );
  }
}
// <Badge />
// <Button />
// <Chip />
// <ColorPicker />
// <Slider />

export default App;
