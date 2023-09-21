import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    Image,
    View,
    Button,
    Modal,
    TouchableHighlight,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Orientation from 'react-native-orientation-locker';
import { useRoute } from '@react-navigation/native';
// import { waitFor } from '@testing-library/react-native';

export default class Home extends Component {

    constructor(props) {
        super(props);
    
        this.state = {
        Chess_unlocked: false,
        Check_unlocked: false,
        modalVisible: false,
        last: 'Home',
        };
      }

      _correctChess = async () => {
        try {
          const oldValue = await AsyncStorage.getItem('@Chess_unlocked');
          if(oldValue === 'false') {
            this.setState({ Chess_unlocked: false });
          } else {
          this.setState({ Chess_unlocked: true });
          }
        } catch (error) {
          console.log(error);
        }
        await this.forceUpdate();
      }

      componentDidUpdate(prevProps, prevState) {
        if (prevState.Check_unlocked !== this.state.Check_unlocked || prevState.Chess_unlocked !== this.state.Chess_unlocked) {
          this._correctCheck();
          this._correctChess();
          this.forceUpdate();
        }
      }

      
    
      _correctCheck = async () => {
        try {
          const oldValue = await AsyncStorage.getItem('@Check_unlocked');
          if(oldValue === 'false') {
            this.setState({ Check_unlocked: false });
          } else {
          this.setState({ Check_unlocked: true });
          }
        } catch (error) {
          console.log(error);
        }
        await this.forceUpdate();
      }
    

    componentDidMount() {
        this._correctCheck();
        this._correctChess();
        Orientation.lockToPortrait();
        this._last();
    }

    timeout(delay) {
        return new Promise(res => setTimeout(res, delay));
     }

    goToChess() {
        this._correctChess();
        if(this.state.Chess_unlocked) {
            this._newLast("Home");
            this.props.navigation.replace('ChessDriver');
        } else {
            this.setState({ modalVisible: true });
        }
    }

    goToCheckers() {
        this._correctCheck();
        if(this.state.Check_unlocked) {
           this._newLast("Home");
            this.props.navigation.replace('Checkers');
        } else {
            this.setState({ modalVisible: true });
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
    
    render() {
        return (
            <View style={styles.menuView}>
        <Modal
          visible={this.state.modalVisible}
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
                <Text style={{ fontSize: 25, marginTop: 5, textAlign: 'center', color:'white' }}>{"This game is not available, please purchase in store."}</Text>
                <TouchableHighlight onPress={() =>  this.setState({ modalVisible: false })}>
                  <Text style={styles.backText}>Back</Text>
                </TouchableHighlight>
              
              </View>
            </View>
          </View>
        </Modal>

                <Text style={styles.titleText}>Ye Olde Games</Text>
                <TouchableHighlight onPress={() => this.props.navigation.replace('Solitaire')}>
                    <View style={styles.gameContainer}>
                        <Image style={styles.gameButton} source={require('./assets/solitairelogo.png')} />
                        <Text style={styles.gameButtonText}>Solitaire</Text>
                    </View>
                </TouchableHighlight>

                <TouchableHighlight onPress={() => this.goToChess()}>
                    <View style={this.state.Chess_unlocked ? styles.gameContainer : styles.lockedContainer}>
                        <Image style={styles.gameButton} source={require('./assets/chesslogo.png')} />
                        <Text style={styles.gameButtonText}>Chess</Text>
                    </View>
                </TouchableHighlight>

                <TouchableHighlight onPress={() => this.goToCheckers()}>
                    <View style={this.state.Check_unlocked ? styles.gameContainer : styles.lockedContainer}>
                        <Image style={styles.gameButton} source={require('./assets/checkerslogo.png')} />
                        <Text style={styles.gameButtonText}>Checkers</Text>
                    </View>
                </TouchableHighlight>

                <TouchableHighlight onPress={() => {this.props.navigation.replace('Settings'); this._newLast("Home")}}>
                    <View style={styles.gameContainer}>
                        <Image style={styles.gameButton} source={require('./assets/Settings_Icon.png')} />
                        <Text style={styles.gameButtonText}>Settings</Text>
                    </View>
                </TouchableHighlight>
                <TouchableHighlight onPress={() => {this.props.navigation.replace('Store'); this._newLast("Home")}}>
                    <View style={styles.gameContainer}>
                        <Text style={styles.storeText}>Store</Text>
                    </View>
                </TouchableHighlight>
            </View>
        );
    }

}

const styles = StyleSheet.create(
    {
        menuView: {
            flex: 1,
            backgroundColor: 'black',
            height: '100%',
            width: '100%',
            justifyContent: 'center',
        },
        gameButton: {
            aspectRatio: 1,
            width: '30%',
            margin: '4%',
            borderwidth: 5,
            borderRadius: 20,
        },
        gameContainer: {
            backgroundColor: 'cyan',
            borderTopRightRadius: 20,
            borderBottomRightRadius: 20,
            borderBottomLeftRadius: 20,
            width: '50%',
            marginLeft: '25%',
            marginTop: 10,
            alignItems: 'center',
            flexDirection: 'row',
        },
        lockedContainer: {
            backgroundColor: 'gray',
            borderTopRightRadius: 20,
            borderBottomRightRadius: 20,
            borderBottomLeftRadius: 20,
            width: '50%',
            marginLeft: '25%',
            marginTop: 10,
            alignItems: 'center',
            flexDirection: 'row',
        },
        gameButtonText: {
            width: '50%',
            color: 'black',
            fontWeight: 'bold',
            fontSize: 20,
        },
        storeText: {
            textAlign: 'center',
            width: '100%',
            color: 'black',
            fontWeight: 'bold',
            fontSize: 20,
        },
        titleText: {
            fontSize: 30,
            margin: 10,
            color: 'cyan',
            fontWeight: '600',
            textAlign: 'center',
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
    });
