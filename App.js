import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
 

import Home from './src/Home';
import Solitaire from './src/Solitaire';
import ChessDriver from './src/ChessDriver';
import Checkers from './src/Checkers';
import Settings from './src/Settings';
import Startup from './src/Startup';
import Store from './src/Store';
import { Board } from './src/ChessComponents';
import BoardView from './src/CheckersComponents/board/Board';

export default class App extends React.Component {
    render() {
      return <AppContainer />;
    }
  }

const game = createStackNavigator(
  {
    Home: { screen: Home },
    Solitaire: { screen: Solitaire },
    ChessDriver: { screen: ChessDriver },
    Checkers: { screen: Checkers },
    Settings: { screen: Settings },
    Startup: { screen: Startup },
    Store: { screen: Store },
},{
    initialRouteName: "Startup",
    headerMode: 'none',
});

const AppContainer = createAppContainer(game);


const styles = StyleSheet.create(
    {
        menuView: {
            justifyContent: 'center',
            margin: 10,
            padding: 25,
        },
        gameButton: {
            margin: 10,
            padding: 25,
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
    });
