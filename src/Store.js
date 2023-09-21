import React, { Component } from 'react';
import Orientation from 'react-native-orientation-locker';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TextInput,
    waitFor,
    TouchableHighlight,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class Store extends Component {
    constructor(props) {
        super(props)
        // put dummy value in for score
        this.state = {last: 'Home', score: '', lastTransaction: '', Check_unlocked: false, Chess_unlocked: false, updated: false};
        // read in the actual score, page will re-render when it finishes
        this._retrieveScore();
    }
    _retrieveScore = async () => {
        try {
            const s = await AsyncStorage.getItem("@Score");
            this.setState({score: s});
        } catch (error) {
            console.log("Error retrieving data:"+error);
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

    _unlockCheckers = async () => {
        try {
          AsyncStorage.setItem('@Check_unlocked', 'true');
          this.forceUpdate();
        } catch (error) {
          console.log(error);
        }
      }

      _unlockChess = async () => {
        try {
          AsyncStorage.setItem('@Chess_unlocked', 'true');
          this.forceUpdate();
        } catch (error) {
          console.log(error);
        }
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
      }
    

      componentDidMount() {
        Orientation.lockToPortrait();
        this._correctCheck();
        this._correctChess();
        this._last();
    }
    

     componentDidUpdate(prevProps, prevState) {
        if (prevState.score !== this.state.score) {
          this._correctCheck();
          this._correctChess();
          this.forceUpdate();
        }
      }

    _spendPoints = async (points, type) => {
        try {
            const oldPoints = await AsyncStorage.getItem("@Score");
            newPoints = oldPoints - points;
            // bad transaction filter
            if (newPoints < 0) {
                this.setState({lastTransaction: "You can't afford that!"});
                console.log("Unable to process a transaction.");
            } else {
                // process transaction
                
                if(type === "MG") {
                     AsyncStorage.setItem("@Score", newPoints.toString());
                    this.setState({
                        score: newPoints.toString(),
                        lastTransaction: "You are amazing!"
                    });
                } 
                if(type === "checkers") {
                    this._unlockCheckers();
                    AsyncStorage.setItem("@Score", newPoints.toString());
                    this.setState({
                        score: newPoints.toString(),
                        lastTransaction: "Enjoy your purchase!"
                    });
                }
                if(type === "chess") {
                   this._unlockChess();
                   AsyncStorage.setItem("@Score", newPoints.toString());
                this.setState({
                    score: newPoints.toString(),
                    lastTransaction: "Enjoy your purchase!"
                });
                }
                console.log("Processed a transaction.");
            }
        } catch (error) {
            console.log("couldn't spend points: ",error);
        }
    }

    renderCheck() {
        const score = this.state.score;
        if(!this.state.Check_unlocked) {
            return(
            <TouchableHighlight onPress={() => this._spendPoints(250, "checkers")}>
                    <View style={score<250 ? styles.gameContainer : styles.unlockableContainer}>
                        <Text style={styles.gameButtonText}>{"Checkers (250)"}</Text>
                    </View>
            </TouchableHighlight>
            );
        }
        return null;
    }

    renderChess() {
        const score = this.state.score;
        if(!this.state.Chess_unlocked) {
            return(
            <TouchableHighlight onPress={() => this._spendPoints(250, "chess")}>
                    <View style={score<250 ? styles.gameContainer : styles.unlockableContainer}>
                        <Text style={styles.gameButtonText}>{"Chess (250)"}</Text>
                    </View>
                </TouchableHighlight>
                );
        }
            return null;
    }
    render () {
        const score = this.state.score;
        const transaction = this.state.lastTransaction;
        return (
            <View style={styles.menuView}>
                <Text style={styles.titleText}>Store</Text>
                <Text style={styles.titleText}>{transaction}</Text>
                    <Text style={styles.titleText}>Score: {score}</Text>
                <TouchableHighlight onPress={() => this._spendPoints(5, "MG")}>
                    <View style={score<5 ? styles.gameContainer : styles.unlockableContainer}>
                        <Text style={styles.gameButtonText}>Momentary Gratification (5)</Text>
                    </View>
                </TouchableHighlight>
                {this.renderCheck()}
                {this.renderChess()}
                <TouchableHighlight onPress={() => {this.props.navigation.replace('Home', {
                name: 'Home',
                params: {updated: this.state.updated},
                merge: true}); this._newLast("Store")}}>
                    <View style={styles.unlockableContainer}>
                        <Text style={styles.gameButtonText}>Home</Text>
                    </View>
                </TouchableHighlight>
            </View>
        );
    }

}

const styles = StyleSheet.create(
    {
        menuView: {
            backgroundColor: 'black',
            height: '100%',
            width: '100%',
            justifyContent: 'center',
        },
        gameButton: {
            margin: 10,
            padding: 25,
            borderwidth: 5,
            borderRadius: 20,
        },
        gameContainer: {
            marginLeft: '25%',
            backgroundColor: 'gray',
            borderTopRightRadius: 20,
            borderBottomRightRadius: 20,
            borderBottomLeftRadius: 20,
            width: '50%',
            marginTop: 10,
            alignItems: 'center',
            flexDirection: 'row',
        },
        unlockableContainer: {
            marginLeft: '25%',
            backgroundColor: 'cyan',
            borderTopRightRadius: 20,
            borderBottomRightRadius: 20,
            borderBottomLeftRadius: 20,
            width: '50%',
            marginTop: 10,
            alignItems: 'center',
            flexDirection: 'row',
        },
        titleText: {
            fontSize: 30,
            margin: 10,
            fontWeight: '600',
            textAlign: 'center',
            color: 'cyan',
        },
        gameButtonText: {
            textAlign: 'center',
            width: '100%',
            color: 'black',
            fontWeight: 'bold',
            fontSize: 20,
        },
    });
