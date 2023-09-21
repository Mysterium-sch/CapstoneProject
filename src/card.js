import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    Image,
    TouchableHighlight,
} from 'react-native';

export const imageMap = { //Manual mapping of card strings to card images
    '': require('./assets/solitaire/downfacing.png'),
    'ah': require('./assets/solitaire/ah.png'),
    'ac': require('./assets/solitaire/ac.png'),
    'as': require('./assets/solitaire/as.png'),
    'ad': require('./assets/solitaire/ad.png'),
    '2h': require('./assets/solitaire/2h.png'),
    '2c': require('./assets/solitaire/2c.png'),
    '2s': require('./assets/solitaire/2s.png'),
    '2d': require('./assets/solitaire/2d.png'),
    '3h': require('./assets/solitaire/3h.png'),
    '3c': require('./assets/solitaire/3c.png'),
    '3s': require('./assets/solitaire/3s.png'),
    '3d': require('./assets/solitaire/3d.png'),
    '4h': require('./assets/solitaire/4h.png'),
    '4c': require('./assets/solitaire/4c.png'),
    '4s': require('./assets/solitaire/4s.png'),
    '4d': require('./assets/solitaire/4d.png'),
    '5h': require('./assets/solitaire/5h.png'),
    '5c': require('./assets/solitaire/5c.png'),
    '5s': require('./assets/solitaire/5s.png'),
    '5d': require('./assets/solitaire/5d.png'),
    '6h': require('./assets/solitaire/6h.png'),
    '6c': require('./assets/solitaire/6c.png'),
    '6s': require('./assets/solitaire/6s.png'),
    '6d': require('./assets/solitaire/6d.png'),
    '7h': require('./assets/solitaire/7h.png'),
    '7c': require('./assets/solitaire/7c.png'),
    '7s': require('./assets/solitaire/7s.png'),
    '7d': require('./assets/solitaire/7d.png'),
    '8h': require('./assets/solitaire/8h.png'),
    '8c': require('./assets/solitaire/8c.png'),
    '8s': require('./assets/solitaire/8s.png'),
    '8d': require('./assets/solitaire/8d.png'),
    '9h': require('./assets/solitaire/9h.png'),
    '9c': require('./assets/solitaire/9c.png'),
    '9s': require('./assets/solitaire/9s.png'),
    '9d': require('./assets/solitaire/9d.png'),
    '10h': require('./assets/solitaire/10h.png'),
    '10c': require('./assets/solitaire/10c.png'),
    '10s': require('./assets/solitaire/10s.png'),
    '10d': require('./assets/solitaire/10d.png'),
    'jh': require('./assets/solitaire/jh.png'),
    'jc': require('./assets/solitaire/jc.png'),
    'js': require('./assets/solitaire/js.png'),
    'jd': require('./assets/solitaire/jd.png'),
    'qh': require('./assets/solitaire/qh.png'),
    'qc': require('./assets/solitaire/qc.png'),
    'qs': require('./assets/solitaire/qs.png'),
    'qd': require('./assets/solitaire/qd.png'),
    'kh': require('./assets/solitaire/kh.png'),
    'kc': require('./assets/solitaire/kc.png'),
    'ks': require('./assets/solitaire/ks.png'),
    'kd': require('./assets/solitaire/kd.png'),
    'fh': require('./assets/solitaire/foundation_hearts.png'),
    'fd': require('./assets/solitaire/foundation_diamonds.png'),
    'fc': require('./assets/solitaire/foundation_clubs.png'),
    'fs': require('./assets/solitaire/foundation_spades.png'),
}

export default class Card extends Component {
    constructor(props) {
        super(props)
        this.solitaireRef = props.solitaireRef //Holds a reference to the solitaire.js class for calling selectCard
        this.state = { selected: false }
    }

    tryCardInteract() {
        if (!this.props.faceup)
            return //If the card is not flipped face up we shouldn't be able to interact with it at all
        else {
            console.log("Clicked on card with value " + this.props.cardString)

            if (this.props.selectedCard === '') { //If there is no card selected at all, we should do our regular selection code
                let status = this.solitaireRef.selectCard(this.props.cardString)
                if (status.result === 'Select')
                    this.setState({ selected: true })
                else if (status.result === 'Deselect')
                    this.setState({ selected: false })
            }
            else if (this.props.selectedCard === this.props.cardString) { // If you click on the same card again, we run the same select code but for deselecting 
                let status = this.solitaireRef.selectCard(this.props.cardString)
                if (status.result === 'Select')
                    this.setState({ selected: true })
                else if (status.result === 'Deselect')
                    this.setState({ selected: false })
            }
            else {
                //Otherwise we assume the player is attempting to move a selected card into a tableColumn
                console.log("Attempting to move card to new table with contents " + this.props.tableList)
                this.solitaireRef.tryAddToTable(this.props.selectedCard, this.props.tableList)
            }
        }
    }

    render() {
        return (
            <TouchableHighlight style={[styles.gameCard, this.props.absolutePositionStyle]} onPress={() => this.tryCardInteract()}>
                <Image style={[styles.cardImage, this.props.faceup === true ? {borderColor: this.props.cardString === this.props.selectedCard ? 'magenta' : 'white'} : styles.facedownBorder]} source={this.props.faceup === true ? imageMap[this.props.cardString] : imageMap['']} />
            </TouchableHighlight>
        )
    }
}

const styles = StyleSheet.create(
    {
        cardText: {
            fontSize: 8,
        },
        gameCard: {
            height: 90,
            width: 60,
            margin: 0,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 3,
        },
        facedownBorder: {
            borderColor: 'black',
        },
        cardImage: {
            resizeMode: 'contain',
            height: 90,
            width: 60,
            borderWidth: 1,
            padding: 1,
            borderRadius: 3,
            margin: 1,
        },
    }
)