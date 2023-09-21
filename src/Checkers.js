// Checkers and it's respective componets are a modification of https://github.com/halilb/react-native-chess
// Permission to use this code can be located in Licenses 

import React, { Component } from 'react';
import { View, StyleSheet, Text, TouchableHighlight, Modal, Image } from 'react-native';
import { Checkers_Rules } from './CheckersComponents/checkers.ts';
import { Board } from './CheckersComponents';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Orientation from 'react-native-orientation-locker';


export default class CheckersDriver extends Component {
  static navigationOptions = {
    title: 'Checkers',
  };

  constructor(props) {
    super(props);


    this.state = {
      game: new Checkers_Rules(props.fen),
      initialized: false,
      userColor: 'w',
      victor: '',
      resigned: false,
      whiteScore: 0,
      blackScore: 0,
      w_name: "Guest",
      b_name: "Opponent",
      curPlayer: "White",
      modalVisible1: false,
      modalVisible2: false,
      modalVisible3: false,
      modalVisible4: false,
      result: ' ',
      modalVisible: false,
      last: "Home",
    };
  }

  onMove = (moveResult) => {
    //console.log("Move made: ", moveResult)
    if (moveResult.captured.find(e => e > 0)) { // someone needs to get points
      points = moveResult.captured.length // TODO: different points for piece type
      if (moveResult.color === 'w') {
        this.setState({ whiteScore: this.state.whiteScore + points });
      } else {
        this.setState({ blackScore: this.state.blackScore + points });
      }
    }
    const { userColor } = this.state;
    if (userColor === 'w') {
      this.setState({ userColor: 'b' });
    } else {
      this.setState({ userColor: 'w' });
    }
    this.correctValues();
  };

  shouldSelectPiece = piece => {
    this.correctValues();
    const { game, userColor } = this.state;
    const turn = game.turn();
    if (
      game.isGameOver() === true ||
      game.isStalemate() === true ||
      piece.color !== userColor 
    ) {
      return false;
    }
    return true;
  };

  _Name = async () => {
    try {
      const oldValue = await AsyncStorage.getItem('@Name');
      this.setState({ w_name: oldValue });
    } catch (error) {
      console.log(error);
    }
  }

  _correctResults = async () => {
    try {
      const oldValue = await AsyncStorage.getItem('@result');
      this.setState({ result: oldValue });
    } catch (error) {
      console.log(error);
    }
  }

  _correctActivate = async () => {
    try {
      const oldValue = await AsyncStorage.getItem('@activate');
      if(oldValue === 'no') {
        this.setState({ modalVisible: false });
      } else {
        this.setState({ modalVisible: true });
      }
    } catch (error) {
      console.log(error);
    }
  }

  correctValues() {

    const { game, userColor } = this.state;
    this._Name();
    this._Turn();
    if (userColor === 'w') {
      this.setState({ curPlayer: this.state.w_name });
    } else {
      this.setState({ curPlayer: this.state.b_name });
    }
    this._correctResults();
    this._correctActivate();
    
  }

  _Turn = async () => {
    try {
      AsyncStorage.setItem('@Check_turn', this.state.game.turn())
    } catch (error) {
      console.log(error);
    }
  }

  _correctActivate = async () => {
    try {
      const oldValue = await AsyncStorage.getItem('@activate');
      if(oldValue === 'no') {
        this.setState({ modalVisible: false });
      } else {
        this.setState({ modalVisible: true });
      }
    } catch (error) {
      console.log(error);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.userColor !== this.state.userColor) {
      this.correctValues();
      this.forceUpdate();
    }
  }

  _last = async () => {
    try {
      const oldValue = await AsyncStorage.getItem('@last');
      this.setState({ last: oldValue });
    } catch (error) {
      console.log(error);
    }
  }

  _newLast = async (lasty) => {
    try {
      AsyncStorage.setItem('@last', lasty)
    } catch (error) {
      console.log(error);
    }
  }

  componentDidMount() {
    Orientation.lockToPortrait();
    this.correctValues();
    this.forceUpdate();
    this._last();
  }

  setModalVisible1() {
    holder = this.state.modalVisible1;
    this.setState({ modalVisible1: !holder });
  }

  setModalVisible2() {
    holder = this.state.modalVisible2;
    this.setState({ modalVisible2: !holder });
  }

  setModalVisible3() {
    holder = this.state.modalVisible3;
    this.setState({ modalVisible3: !holder });
  }
  
    setModalVisible4() {
    holder = this.state.modalVisible4;
    this.setState({ modalVisible4: !holder });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.w_name !== this.state.w_name ) {
      this.correctValues();
      this.forceUpdate();
    }
  }

  render() {
    const {
      game,
      result,
      modalVisible,
      modalVisible1,
      modalVisible3,
      modalVisible2,
      modalVisible4,
      last,
    } = this.state;

    const turn = game.turn();
    return (

      <View style={styles.ChessGameScreen}>
        <Modal
          visible={modalVisible}
          animationType={'fade'}
          transparent={true}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(52, 52, 52, 0.8)',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: 'black',
                marginVertical: 60,
                width: '90%',
                borderWidth: 1,
                borderColor: '#fff',
                borderRadius: 7,
                elevation: 10,
              }}>
              <View style={{ alignItems: 'center', margin: 10 }}>
                <Text style={{ fontSize: 25, marginTop: 5, textAlign: 'center', color:'white' }}>{result}</Text>
                <TouchableHighlight onPress={() => {this.props.navigation.replace('Home'); this._newLast("Checkers")}}>
                  <Text style={styles.backText}>Home</Text>
                </TouchableHighlight>
              </View>

            </View>
          </View>
        </Modal>

        <Modal
          visible={modalVisible1}
          animationType={'fade'}
          transparent={true}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(52, 52, 52, 0.8)',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: 'black',
                marginVertical: 60,
                width: '90%',
                borderWidth: 1,
                borderColor: '#fff',
                borderRadius: 7,
                elevation: 10,
              }}>
              <View style={{ alignContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 25, marginTop: 5, textAlign: 'center', color: 'white' }}>{"Are you sure you want to Surrender?"}</Text>
                <View style={{ alignContent: 'center', flexDirection: 'row', height: 'auto', alignItems: 'center' }}>
                  <TouchableHighlight onPress={() => { this.setModalVisible3(); this.setModalVisible1() }}>
                    <Text style={styles.backText}>Yes</Text>
                  </TouchableHighlight>
                  <TouchableHighlight onPress={() => this.setModalVisible1()}>
                    <Text style={styles.backText}>No</Text>
                  </TouchableHighlight>
                </View>
              </View>

            </View>
          </View>
        </Modal>

        <Modal
          visible={modalVisible2}
          animationType={'fade'}
          transparent={true}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(52, 52, 52, 0.8)',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: 'black',
                marginVertical: 60,
                width: '90%',
                borderWidth: 1,
                borderColor: '#fff',
                borderRadius: 7,
                elevation: 10,
              }}>
              <View style={{ alignContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 25, marginTop: 5, textAlign: 'center', color: 'white' }}>{"Are you sure you want to leave the game. Your progress will not be saved?"}</Text>

                <View style={{ alignContent: 'center', flexDirection: 'row', height: 'auto', alignItems: 'center' }}>
                  <TouchableHighlight onPress={() => {this.props.navigation.replace('Home'); this._newLast("Checkers")}}>
                    <Text style={styles.backText}>Yes</Text>
                  </TouchableHighlight>
                  <TouchableHighlight onPress={() => this.setModalVisible2()}>
                    <Text style={styles.backText}>No</Text>
                  </TouchableHighlight>
                </View>
              </View>

            </View>
          </View>
        </Modal>


        <Modal
          visible={modalVisible3}
          animationType={'fade'}
          transparent={true}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(52, 52, 52, 0.8)',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: 'black',
                marginVertical: 60,
                width: '90%',
                borderWidth: 1,
                borderColor: '#fff',
                borderRadius: 7,
                elevation: 10,
              }}>
              <View style={{ alignItems: 'center', margin: 10 }}>
                <Text style={{ fontSize: 25, marginTop: 5, textAlign: 'center', color: 'white' }}>{this.state.curPlayer + " surrenders!"}</Text>
                <TouchableHighlight onPress={() => {this.props.navigation.replace('Home'); this._newLast("Checkers")}}>
                  <Text style={styles.backText}>Home</Text>
                </TouchableHighlight>
              </View>

            </View>
          </View>
        </Modal>

     <Modal
          visible={modalVisible4}
          animationType={'fade'}
          transparent={true}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(52, 52, 52, 0.8)',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: 'black',
                marginVertical: 60,
                width: '90%',
                borderWidth: 1,
                borderColor: '#fff',
                borderRadius: 7,
                elevation: 10,
              }}>
              <View style={{ alignContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 25, marginTop: 5, textAlign: 'center', color: 'white' }}>{"Are you sure you want to go to Settings. Your progress will not be saved?"}</Text>

                <View style={{ alignContent: 'center', flexDirection: 'row', height: 'auto', alignItems: 'center' }}>
                  <TouchableHighlight onPress={() => {this.props.navigation.replace('Settings'); this._newLast("Checkers")}}>
                    <Text style={styles.backText}>Yes</Text>
                  </TouchableHighlight>
                  <TouchableHighlight onPress={() => this.setModalVisible4()}>
                    <Text style={styles.backText}>No</Text>
                  </TouchableHighlight>
                </View>
              </View>

            </View>
          </View>
        </Modal>


        <View style={styles.textView}>
        <Text style={styles.instruct}>
            {" " + this.state.w_name + "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t" + this.state.b_name}
          </Text>
        </View>
        <View style={styles.containerScore}>
          <Text style={styles.leftBoard}>
            <Text style={styles.leftScore}>
              {this.state.whiteScore}
            </Text>
          </Text>
          <Text style={styles.rightBoard}>
            <Text style={styles.rightScore}>
              {this.state.blackScore}
            </Text>
          </Text>
        </View>

        <View style={styles.instruct}>
          <Text style={styles.instruct}>{"Welcome to Checkers, you will trade the game back and forth to play. " + this.state.curPlayer + " it is your turn."} </Text>
        </View>


        <View style={styles.container}>
          <Board
            ref={this.b}
            shouldSelectPiece={this.shouldSelectPiece}
            onMove={this.onMove}
          />
        </View>

        <View>
          <Text style={styles.instruct}> {"You earn 1 point for every piece that is taken."} </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableHighlight onPress={() => this.setModalVisible2()}>
            <Text style={styles.backText}>Back</Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={() => this.setModalVisible1()}>
            <Text style={styles.backText}>{this.state.curPlayer + " Surrender"}</Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={() => this.setModalVisible4()}>
            <Image style={styles.gameButton} source={require('./assets/Settings_Icon.png')} />
          </TouchableHighlight>
        </View>
      </View>
    );

  }
}

const styles = StyleSheet.create({
  instruct: {
    color: 'lawngreen',
    textAlign: 'center',
  },
  textView: {
    height: '5%'
  },
  menuView: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    padding: 25,
  },
  buttonContainer: {
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  gameButton: {
    height: 40,
    width: 40,
  },
  backText: {
    color: 'white',
    textAlign: 'center',
    borderColor: 'white',
    padding: 5,
    marginEnd: 10,
    borderWidth: 2,
    fontWeight: 'bold',
    fontSize: 18,
  },
  ChessGameScreen: {
    flex: 1,
    backgroundColor: 'black',
  },
  container: {
    flex: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'black',
  },
  statusText: {
    color: 'red',
    fontSize: 16,
    margin: 4,
  },
  buttonContainer: {
    flex: 3,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  containerScore: {
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
    textAlign: 'left',
    fontFamily: 'Courier',
    color: 'lawngreen',
    fontSize: 15
  },
  leftScore: {
    fontFamily: 'Courier',
    color: 'cyan',
    fontSize: 100
  },
  rightName: {
    textAlign: 'right',
    fontFamily: 'Courier',
    color: 'magenta',
    fontSize: 15
  },
  rightScore: {
    fontFamily: 'Courier',
    color: 'magenta',
    fontSize: 100
  }
});
