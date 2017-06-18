import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Appbar from './components/App Bar';
import Avatar from './components/Avatar';
import Button from './components/Button';
import Paper from './components/Paper';

class App extends Component {
  render() {
    return (
      <div className="App">

        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
          <Appbar />

      </div>
    );
  }
}

export default App;
