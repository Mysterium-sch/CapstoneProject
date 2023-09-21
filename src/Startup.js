import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    Image,
    View,
    Button,
    TouchableHighlight,
    ImageBackground,
    Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Orientation from 'react-native-orientation-locker';
export default class Startup extends Component {
    _storeData = async () => {
        try {
            // start initializing variables

            // Only set default vals if not in storage (on first boot)
            // Special debug behavior for score: give the user 1000 points
            let score = await AsyncStorage.getItem('@Score');
            if (!score) {
                await AsyncStorage.setItem('@Score', '1000');
            }
            else if (score < 1000) {
                await AsyncStorage.setItem('@Score', '1000');
            }
            console.log('Value of score: ',await AsyncStorage.getItem('@Score'));
            // volume
            if (!await AsyncStorage.getItem('@Volume'))
                await AsyncStorage.setItem('@Volume', 'false');
            console.log('Value of Volume: ',await AsyncStorage.getItem('@Volume'));
            // name
            if (!await AsyncStorage.getItem('@Name'))
                await AsyncStorage.setItem('@Name', 'GUEST');
            console.log('Value of Name: ',await AsyncStorage.getItem('@Name'));
            // Checkers Score
            if (!await AsyncStorage.getItem('@bScore_check'))
                await AsyncStorage.setItem('@bScore_check', '0');
            console.log('Value of bScore_check: ',await AsyncStorage.getItem('@bScore_check'));
            if (!await AsyncStorage.getItem('@wScore_check'))
                await AsyncStorage.setItem('@wScore_check', '0');
            console.log('Value of wScore_check: ',await AsyncStorage.getItem('@wScore_check'));
            // Turn
            if (!await AsyncStorage.getItem('@Check_turn'))
                await AsyncStorage.setItem('@Check_turn', 'w');
            console.log('Value of check_turn: ',await AsyncStorage.getItem('@Check_turn'));
            if (!await AsyncStorage.getItem('@Chess_turn'))
                await AsyncStorage.setItem('@Chess_turn', 'w');
            console.log('Value of chess_turm: ',await AsyncStorage.getItem('@Chess_turn'));
            // Store
            if (!await AsyncStorage.getItem('@Check_unlocked'))
                await AsyncStorage.setItem('@Check_unlocked', 'false');
            console.log('Value of check_unlocked: ',await AsyncStorage.getItem('@Check_unlocked'));
            if (!await AsyncStorage.getItem('@Chess_unlocked'))
                await AsyncStorage.setItem('@Chess_unlocked', 'false');
            console.log('Value of chess_unlocked: ',await AsyncStorage.getItem('@Chess_unlocked'));
            if (!await AsyncStorage.getItem('@last'))
                await AsyncStorage.setItem('@last', "home");
            console.log('Value of last: ',await AsyncStorage.getItem('@last'));
            // Pop-up help
            // Turn
            if (!await AsyncStorage.getItem('@activate'))
                await AsyncStorage.setItem('@activate', 'no');
            if (!await AsyncStorage.getItem('@result'))
                await AsyncStorage.setItem('@result', ' ');
            
            
            
        } catch (error) {
            console.log("Failed to initalize global vars: "+error);
        }
    }
    componentDidMount () {    //changes screen after 5 seconds
        this._storeData();
        this.timeoutHandle = setTimeout(()=>{
            this.props.navigation.navigate('Home');
        }, 5000);
        Orientation.lockToPortrait();
    }

    componentWillUnmount(){  //exception handling
        clearTimeout(this.timeoutHandle);
    }

    render() {
        return (
            <View style={styles.menuView} onTouchEnd={() => this.props.navigation.navigate('Home')}>
                <Image style={styles.image} source={require('./assets/Loading.png')}>
                </Image>
            </View>
        )
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
            margin: 10,
            padding: 25,
            height: 20,
            width: 20,
            borderwidth: 5,
            borderRadius: 20,
        },
        titleText: {
            fontSize: 30,
            fontWeight: '600',
            textAlign: 'center',
        },
        regularText: {
            fontSize: 12,
            textAlign: 'center',
        },
        settingsHeader: {
            textAlign: 'center',
            fontSize: 35,
            fontWeight: 'bold',
        },
        image: {
            flex: 1,
            width: '100%',
            length: '100%',
            resizeMode: 'cover',
            opacity: 0.85,
          },
    });
