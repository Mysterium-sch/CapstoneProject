import React, { Component } from 'react';
import SolitaireRules from './solitaireRules';
import Card from './card';
import {
    StyleSheet,
    Text,
    View,
    TouchableHighlight,
} from 'react-native';

export default class TableColumn extends Component {
    constructor(props) {
        super(props)

        //Pass in the backing list from solitaireRules so this column knows which cards are dealt into it and track the card component at the end of the stack
        this.state = { tableList: props.tableList }
        this.solitaireRef = props.solitaireRef //Store a reference to the solitaire.js class for passing to its child cards
    }

    showCards() {
        if (this.state.tableList !== undefined || null) { //Don't try to check index of a list that doesn't exist
            if (this.state.tableList.length !== 0) { //Guard against checking an empty list. If the column is empty no cards need to be flipped
                if (this.state.tableList[this.state.tableList.length - 1].faceup === false) {
                    //The bottom-most element of the table is facedown and we should flip it over before rendering
                    this.state.tableList[this.state.tableList.length - 1].faceup = true
                }
            }
        }

        return this.state.tableList.map((card, i) => {
            return (
                //Need to see about overwriting only the 'position' property of the style sheet so cards can be stacked on each other
                <Card key={i} absolutePositionStyle={{ position: 'absolute', top: 15 * i, left: -30 }} cardString={card.value} solitaireRef={this.solitaireRef} faceup={card.faceup} selectedCard={this.props.selectedCard} tableList={this.state.tableList}></Card>
            )
        }
        )
    }

    addToTableWhenEmpty() {
        if (this.state.tableList.length === 0) {
            //If there are no cards in the table we should call solitaire's tryAddToTable
            console.log("Column is empty when clicked, attempting to add card from tableColumn")
            this.solitaireRef.tryAddToTable(this.props.selectedCard, this.state.tableList)
        }
    }

    render() {
        return (
            <View>
                <TouchableHighlight style={styles.tableColumn} onPress={() => this.addToTableWhenEmpty()}>
                    <View>
                        {this.showCards()}
                    </View>
                </TouchableHighlight>
            </View>
        )
    }
}
const styles = StyleSheet.create(
    {
        tableColumn: {
            height: '95%',
            width: 70,
            flexDirection: 'column',
            alignItems: 'center',
            //backgroundColor: 'lime', //Removing background color and swapping to a border instead
            margin: 2,
            borderWidth: 1.5,
            borderColor: 'white',
        },
    })