import React, { useEffect , Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TextInput,
    Button,
    Switch,
    TouchableHighlight,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Orientation from 'react-native-orientation-locker';

export default class Settings extends Component {
    state = {
        curValue: false,
        name: "Guest",
        last: "home",
    };

    _correctVolume = async () => {
        try {
        const oldValue = await AsyncStorage.getItem('@Volume');
        if(oldValue == 'false') {
            this.setState({curValue : false});
        } else {
            this.setState({curValue : true});
        }
        } catch (error) {
          console.log(error);
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

    _correctName = async () => {
        try {
        const oldValue = await AsyncStorage.getItem('@Name');
        this.setState({name : oldValue});
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
    this._correctName();
    this._correctVolume();
     Orientation.lockToPortrait();
    this._last();
  }

  _changeVolume = async () => {
    try {
    const oldValue = await AsyncStorage.getItem('@Volume');
    newValue = 'false';
    if(oldValue == 'false') {
        newValue = 'true';
    }
    console.log(newValue);
    AsyncStorage.setItem('@Volume', newValue);
    } catch (error) {
      console.log(error);
    }
}
_changeName = async (text) => {
    try {
    AsyncStorage.setItem('@Name', text);
    } catch (error) {
      console.log(error);
    }
}
    changeNameHelper(text) {
        this._changeName(text);
        this.setState({name : text});
    }

    changeVolumeHelper = () => {
        console.log("Changing volume");
        this.setState({curValue : !this.state.curValue});
        this._changeVolume()
    }


    render() {
        return (
            <View style={styles.menuView}>
                <Text style={styles.titleText}>Settings</Text>
                <View style={styles.gameContainer}>
                    <Text style={styles.gameButtonText}>Enable Audio</Text>
                    <Switch onValueChange={this.changeVolumeHelper} value={this.state.curValue}/>
                </View>
                <View style={styles.gameContainer}>
                    <TextInput
                        placeholder='Enter Your Name'
                        marginLeft='25%'
                        onChangeText={text => this.changeNameHelper(text)} value={this.state.name} />
                </View>

                <TouchableHighlight onPress={() => {this.props.navigation.replace('Home'); this._newLast("Settings")}}>
                    <View style={styles.gameContainer}>
                        <Text style={styles.gameButtonText}>Home</Text>
                    </View>
                </TouchableHighlight>
                <TouchableHighlight onPress={() =>  {this.props.navigation.replace(this.state.last); this._newLast("Settings")}}>
                    <View style={styles.gameContainer}>
                        <Text style={styles.gameButtonText}>Back</Text>
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
            backgroundColor: 'cyan',
            borderTopRightRadius: 20,
            borderBottomRightRadius: 20,
            borderBottomLeftRadius: 20,
            height: 50,
            width: '50%',
            marginLeft: '25%',
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
            marginLeft: '25%',
            textAlign: 'center',
            width: '50%',
            color: 'black',
            fontWeight: 'bold',
            fontSize: 20,
        },
    });
