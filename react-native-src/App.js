import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Appbar from './src/components/App Bar'

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
    paddingTop: 22
  },
});
