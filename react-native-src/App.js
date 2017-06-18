import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Appbar from './App Bar'

export default class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Appbar/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
