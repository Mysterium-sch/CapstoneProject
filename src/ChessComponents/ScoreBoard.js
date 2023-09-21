import React, { Component } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { PropTypes } from 'prop-types';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default class ScoreBoard extends Component {
    constructor(props) {
        super(props);
    
        this.state = {
            whiteScore : "0",
            blackScore : "0",
            w_name : "Guest",
            b_name : "Opponent",
          };
      }
    
      _Name = async () => {
        try {
            const oldValue = await AsyncStorage.getItem('@Name');
            this.setState({w_name : oldValue});
        } catch (error) {
          console.log(error);
        }
    }

  _correctB = async () => {
    try {
        const oldValue = await AsyncStorage.getItem('@bScore_chess');
        this.setState({blackScore : oldValue});
    } catch (error) {
      console.log(error);
    }
}

_correctW = async () => {
    try {
    const oldValue = await AsyncStorage.getItem('@wScore_chess');
    this.setState({whiteScore : oldValue});
} catch (error) {
    console.log(error);
  }
}

correctValues() {
this._correctW();
this._correctB();
this._Name();
}

render() {
    return (
        <View style={styles.container}>
            <Text style={styles.leftBoard}>
                <Text style={styles.leftName}>
                    {this.state.w_name}
                </Text>
                <Text style={styles.leftScore}>
                    {this.state.w_score}
                </Text>
            </Text>
            <Text style={styles.rightBoard}>
                <Text style={styles.rightName}>
                    {this.state.b_name}
                </Text>
                <Text style={styles.rightScore}>
                    {this.state.b_score}
                </Text>
            </Text>
        </View>
    );
}

}

const styles = StyleSheet.create({
container: {
    alignContent: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row'
},
leftBoard: {
    alignItems: 'center',

},
rightBoard: {
    alignItems: 'center',
},
leftName: {
    fontFamily: 'Courier',
    color: 'cyan',
    fontSize: 15
},
leftScore:{
    fontFamily: 'Courier',
    color: 'cyan',
    fontSize: 100
},
rightName: {
    fontFamily: 'Courier',
    color: 'magenta',
    fontSize: 15
},
rightScore:{
    fontFamily: 'Courier',
    color: 'magenta',
    fontSize: 100
}
})
