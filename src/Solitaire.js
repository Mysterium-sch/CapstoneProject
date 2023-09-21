/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import SolitaireRules from './solitaireRules';
import TableColumn from './tableColumn';
import { imageMap } from './card';
import Orientation from 'react-native-orientation-locker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Sound from 'react-native-sound';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableHighlight,
    ScrollView,
    Modal,
} from 'react-native';


const clickSound = new Sound('click.mp3', Sound.MAIN_BUNDLE);
const autoCompleteSound = new Sound('shuffle.mp3', Sound.MAIN_BUNDLE);

export default class Solitaire extends Component {

    //Want to add an undo button that goes back one or two moves
    //Want to do an autocomplete that moves all cards to the foundations if you already have them sorted on the board
    //Try to animate the cards moving to the foundation
    //Add a card button to the table columns for adding to the empty row instead of clicking on the background color
    //Create a deck of test cards that is easily won for quicker test iteration

    constructor(props) {
        super(props)
        this.rules = new SolitaireRules(); //Create new SolitaireRules and check if a game has been started
        this.rules.createBoard(); //TODO: Consider making a this.rules.createTestBoard() function for quicker testing

        this.numMoves = 0;
        //for timer
        //this.date = new Date();
        //this.startTime = (this.date.getTime() - this.date.getTime()%1000)/1000;    //sets the starting time
        this.numSecs = 0;

        this.state = { last: "Home", curValue: false, drawnCard: '', selectedCard: '', timer: 'Timer: ', moveCount: 'Moves: ' + this.numMoves, stockList: [], modalVisible: false, gameWon: false, helpVisible: false, modalVisible1: false, modalVisible2: false, modalVisible3: false, modalVisible4: false, playerName: 'Guest',};
        this.lastFoundations = { 'h': '', 'd': '', 's': '', 'c': '' }
        this.passedCard = ''
        this.playAgain = false
        this.lastMove = {
            lastCard: '', source: '', destination: '', sourceTableIndex: null, destinationTableIndex: null,
            foundationSuite: null, multi: false, flippedCard: null, undoUsed: false
        }
    }

    _correctName = async () => {
        try
        {
            const name = await AsyncStorage.getItem('@Name');
            this.setState({playerName: name});
        }
        catch(error)
        {
            console.log(error);
        }
    }

    _correctVolume = async () => {
        try {
            const oldValue = await AsyncStorage.getItem('@Volume');
            if (oldValue == 'false') {
                this.setState({ curValue: false });
            } else {
                this.setState({ curValue: true });
            }
        } catch (error) {
            console.log(error);
        }
    }


    _addPoints = async (points) => {
        try {
            console.log("reading lifetime points score");
            // read lifetime points score
            const oldTotal = await AsyncStorage.getItem('@Score');
            console.log("old score: ", oldTotal);
            // calculate new score
            newTotal = parseInt(oldTotal) + points;
            console.log("new score: ", newTotal);
            AsyncStorage.setItem('@Score', newTotal.toString());
        } catch (error) {
            console.log(error);
        }
    }


    componentDidMount() {
        // this locks the view to Portrait Mode
        // Orientation.lockToPortrait();

        // this locks the view to Landscape Mode
        Orientation.unlockAllOrientations() //Clear any previous locks before setting to portrait
        Orientation.lockToLandscapeLeft();
        // this unlocks any previous locks to all Orientations
        // Orientation.unlockAllOrientations();
        this.startTimer()
        this._correctName();
        this._correctVolume();
        this._last();
        if (this.state.curValue)
            Sound.setCategory('Playback')
    }

    componentWillUnmount() {
        if (!this.playAgain) {
            Orientation.unlockAllOrientations()
            Orientation.lockToPortrait()
            clearInterval(this.state.timeInter)
        }
    }

    startTimer() {
        //used for the timer
        var timeInter = setInterval(() => {
            this.numSecs++;
            let a = (this.numSecs % 60).toString();
            let b = (((this.numSecs - a) / 60) % 60).toString();
            let c = (((this.numSecs - (b * 60) - a) / 3600)).toString();
            if (a < 10) {
                a = '0' + a;
            }
            if (b < 10) {
                b = '0' + b;
            }
            if (c < 10) {
                c = '0' + c;
            }
            this.setState({ timer: 'Timer: ' + c + ':' + b + ':' + a })
        }, 1000);
        this.setState({ timeInter: timeInter });
    }
    
    componentDidUpdate(prevProps, prevState) {
    if (prevState.curValue !== this.state.curValue) {
      console.log('changes');
      this._correctVolume();
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

    undoMove() {
        //If card came from the draw pile, we need to remove it from its destination and put it back into the talon
        //Also need to reorder the discard pile and ensure proper ordering

        //If card went to foundations, we need to update the lastFoundations array and remove it from there
        //If card went to a table, we need to check if it was a multi move or not
        //If it isn't a multi move, we delete the card from the table and place it back in the source location
        //If it was a multi move we need to put the cards back in their source pile with the same method used in tryAddToTable

        if (this.lastMove.undoUsed === true || this.lastMove.source === "Recycle") {
            console.log("You cannot use your undo!")
            return //If you've used up your undo this function should not do anything
        }


        if (this.lastMove.source === 'Draw') {
            //The only valid destination for a draw source is the talon pile. We need to undo the draw and place the card back in the stock
            this.rules.stock.push(this.lastMove.lastCard) //Place the card on top of the deck
            lastDiscarded = this.rules.discard.pop()
            console.log("Undoing a card draw move and lastDiscarded returns as " + lastDiscarded)
            this.state.stockList[0] = this.rules.discard[this.rules.discard.length - 1]
            this.state.stockList[1] = this.rules.discard[this.rules.discard.length - 2]
            this.numMoves = this.numMoves - 1
            this.setState({ moveCount: "Moves: " + this.numMoves, selectedCard: '' })
            this.lastMove.undoUsed = true
            if (lastDiscarded !== undefined) {
                this.setState({ drawnCard: lastDiscarded })
            }
            else {
                this.setState({ drawnCard: '' })
            }
        }

        if (this.lastMove.source === 'Talon') {
            console.log("Undoing a move from the draw pile")
            if (this.lastMove.destination === 'Foundation') {
                console.log("Destination was foundation and attempted undo")
                foundationCard = String(this.rules.foundations[this.rules.foundationMapping[this.lastMove.foundationSuite]].pop()) //Remove the top card from the foundation pile
                lastFoundation = String(this.rules.foundations[this.rules.foundationMapping[this.lastMove.foundationSuite]].slice(-1))
                console.log("Card added back to talon pile has a value of " + foundationCard)
                console.log("Last card in the foundation has a value of " + lastFoundation)
                if (this.rules.foundations[this.rules.foundationMapping[this.lastMove.foundationSuite]].length === 0) {
                    this.lastFoundations[this.lastMove.foundationSuite] = ''
                }
                else {
                    this.lastFoundations[this.lastMove.foundationSuite] = lastFoundation
                }
                if (this.state.drawnCard !== '') {
                    this.rules.Discard(this.state.drawnCard)
                }
                this.state.stockList[0] = this.rules.discard[this.rules.discard.length - 1]
                this.state.stockList[1] = this.rules.discard[this.rules.discard.length - 2]
                this.setState({ drawnCard: foundationCard })
                this.numMoves = this.numMoves - 1
                this.setState({ moveCount: "Moves: " + this.numMoves })
            }
            if (this.lastMove.destination === 'Table') {
                console.log("Destination was the table and attempted undo")
                if (this.state.drawnCard !== '') { //If there is already a drawn card we should move it into the discard pile to make room for the undo
                    this.rules.Discard(this.state.drawnCard)
                }
                this.rules.table[this.lastMove.destinationTableIndex].pop()
                this.setState({ drawnCard: this.lastMove.lastCard })
                this.state.stockList[0] = this.rules.discard[this.rules.discard.length - 1]
                this.state.stockList[1] = this.rules.discard[this.rules.discard.length - 2]
                this.numMoves = this.numMoves - 1
                this.setState({ moveCount: "Moves: " + this.numMoves })
            }
            this.lastMove.undoUsed = true
            this.setState({ selectedCard: '' })
        }
        else if (this.lastMove.destination === 'Table') {
            console.log("Undoing a move targetting the table")
            if (this.lastMove.source === 'Foundation') {
                console.log("Source was the foundation. Attempting undo")
                this.rules.table[this.lastMove.destinationTableIndex].pop()
                this.rules.foundations[this.rules.foundationMapping[this.lastMove.foundationSuite]].push(this.lastMove.lastCard)
                if (this.rules.foundations[this.rules.foundationMapping[this.lastMove.foundationSuite]].length !== 0) {
                    this.lastFoundations[this.lastMove.foundationSuite] = String(this.rules.foundations[this.rules.foundationMapping[this.lastMove.foundationSuite]].slice(-1))
                }
                else {
                    this.lastFoundations[this.rules.foundationMapping[this.lastMove.foundationSuite]] = ''
                }
                if (this.lastMove.flippedCard === true && this.rules.table[this.lastMove.sourceTableIndex].length !== 0) {
                    this.rules.table[this.lastMove.sourceTableIndex][this.rules.table[this.lastMove.sourceTableIndex].length - 1].faceup = true
                }
            }
            if (this.lastMove.source === 'Table') {
                console.log("Source was from the table. Attempting undo")
                if (this.lastMove.destination === 'Table') {
                    if (this.lastMove.multi === true) {
                        console.log("Move included multiple cards")
                        cardIndex = null
                        for (i = 0; i < this.rules.table[this.lastMove.destinationTableIndex].length; i++) {
                            if (this.rules.table[this.lastMove.destinationTableIndex][i].value === this.lastMove.lastCard) {
                                cardIndex = i
                                break
                            }
                        }
                        multiList = this.rules.table[this.lastMove.destinationTableIndex].splice(cardIndex)
                        if (this.lastMove.flippedCard === true && this.rules.table[this.lastMove.sourceTableIndex].length !== 0) {
                            this.rules.table[this.lastMove.sourceTableIndex][this.rules.table[this.lastMove.sourceTableIndex].length - 1].faceup = false
                        }
                        this.rules.table[this.lastMove.sourceTableIndex].push(...multiList)
                    }
                    else {
                        console.log("Move only included a single card")
                        if (this.lastMove.flippedCard === true && this.rules.table[this.lastMove.sourceTableIndex].length !== 0) {
                            this.rules.table[this.lastMove.sourceTableIndex][this.rules.table[this.lastMove.sourceTableIndex].length - 1].faceup = false
                        }
                        this.rules.table[this.lastMove.destinationTableIndex].pop()
                        this.rules.table[this.lastMove.sourceTableIndex].push({ value: this.lastMove.lastCard, faceup: true })
                    }
                }
            }
            this.numMoves = this.numMoves - 1
            this.lastMove.undoUsed = true
            this.setState({ moveCount: "Moves: " + this.numMoves, selectedCard: '' })
        }
        if (this.lastMove.source === 'Table') {
            if (this.lastMove.destination === 'Foundation') {
                this.rules.foundations[this.rules.foundationMapping[this.lastMove.foundationSuite]].pop()
                console.log("Undoing move from foundation to table with length of foundation after pop being " + this.rules.foundations[this.rules.foundationMapping[this.lastMove.foundationSuite]].length)
                if (this.rules.foundations[this.rules.foundationMapping[this.lastMove.foundationSuite]].length !== 0) {
                    this.lastFoundations[this.lastMove.foundationSuite] = String(this.rules.foundations[this.rules.foundationMapping[this.lastMove.foundationSuite]].slice(-1))
                }
                else {
                    this.lastFoundations[this.lastMove.foundationSuite] = ''
                }
                if (this.lastMove.flippedCard === true && this.rules.table[this.lastMove.sourceTableIndex].length !== 0) {
                    this.rules.table[this.lastMove.sourceTableIndex][this.rules.table[this.lastMove.sourceTableIndex].length - 1].faceup = false
                }
                this.rules.table[this.lastMove.sourceTableIndex].push({ value: this.lastMove.lastCard, faceup: true })
                this.numMoves = this.numMoves - 1
                this.lastMove.undoUsed = true
                this.setState({ moveCount: "Moves: " + this.numMoves, selectedCard: '' })
            }
        }
    }

    drawCard = () => {
        if (this.state.drawnCard !== '' && this.state.drawnCard !== undefined)
            this.rules.Discard(this.state.drawnCard) //If there is a card left in the draw pile we should move it to the discard

        //Set this.state.stockList to the first two element of the this.rules.discard backing array
        //If either of these are not objects found in the backing array they will return as 'undefined'
        this.state.stockList[0] = this.rules.discard[this.rules.discard.length - 1]
        this.state.stockList[1] = this.rules.discard[this.rules.discard.length - 2]

        if (this.rules.stock.length === 0) {
            this.setState({ stockList: [] }) //If there are no more cards to be drawn we should clear our stockList before we move the discard pile back into the draw pile
            this.lastMove.source = "Recycle"
            this.setState({ selectedCard: '', drawnCard: '' })
            this.rules.StockDraw() //Call the StockDraw function so it will recycle the discard pile
            //Probably need to add a recycling sound in here
            return
        }

        newCard = this.rules.StockDraw();
        this.setState({ drawnCard: newCard });
        this.setState({ selectedCard: '' }) //Drawing a card should clear any selected card
        //Record the move in the lastMove object for undo functionality
        this.lastMove.lastCard = newCard;
        this.lastMove.source = 'Draw'
        this.lastMove.destination = 'Talon'
        this.lastMove.undoUsed = false
        this._correctVolume();
        if (this.state.curValue)
            clickSound.play(); //Play a sound when a card is drawn, but not when the deck is recycled
        this.addMove();
    }

    addMove = () => {
        this.numMoves = this.numMoves + 1
        this.setState({ moveCount: 'Moves: ' + this.numMoves })
    }

    tryAddToTable(card, table) {
        //Check if the card is legal to add to the bottom of the table
        //Need to check if the card already exists in any table AND that it is not a member of the table we are trying to add it to

        legal = false
        multi = false //Private flag for detecting if multiple cards are being moved to the table
        multiList = null //If multi is true then this is assigned all of the cards that are being moved

        console.log("Starting tryAddToTable with card as value " + card)

        if (table.length === 0) {
            console.log("Table is empty")
            legal = true //Skip the rest of the checks if the table is empty
        }
        else if (this.rules.myDeck.FaceValueDifference(table[table.length - 1].value, card) === 1 && !this.rules.myDeck.ColorMatch(card, table[table.length - 1].value)) {
            //Last card in the table must be one higher and it cannot have the same color, or the table is empty
            legal = true
        }

        if (legal === true) {
            console.log("Move to table is legal")
            console.log("Passed card has a value of " + card)

            for (let key in this.lastFoundations) {
                if (card === this.lastFoundations[key]) { //Check each key to see if it contains this card
                    //If it does, we know what key we need to update now. If card was a heart key will now be 'h'
                    this.rules.foundations[this.rules.foundationMapping[key]].pop()
                    let temp = this.rules.foundations[this.rules.foundationMapping[key]]
                    this.lastFoundations[key] = temp[Object.keys(temp).length - 1]
                    console.log("Moving card from foundation to table. foundations backing array contains " + temp)
                    if (this.lastFoundations[key] === undefined) {
                        this.lastFoundations[key] = '' //The foundation was emptied, so we represent no card as an empty string
                    }
                    console.log("Card detected in foundations pile")
                    this.lastMove.source = 'Foundation'
                    this.lastMove.foundationSuite = key
                }
            }

            if (card === this.state.drawnCard) {
                //If we are adding a card to the table from the draw pile we need to check the stockList to see if there is another card to slot there

                if (this.state.stockList[0] !== null) {
                    //The stockList is not empty and we should update the drawnCard with stockList[0]
                    this.setState({ drawnCard: this.state.stockList[0] })
                    this.rules.discard.pop() //Remove the card put into the drawnCard section, we want to clear it from the discard pile
                    this.state.stockList[0] = this.rules.discard[this.rules.discard.length - 1]
                    this.state.stockList[1] = this.rules.discard[this.rules.discard.length - 2] //If either of these objects do not exist in the discard array they will be inserted into stockList as 'undefined'
                }
                this.lastMove.source = 'Talon'
            }
            else { //If card is not from the draw pile, it must be in the table. We need to clean it up before moving it to the new column
                for (let i = 0; i < this.rules.table.length; i++) {
                    for (let j = 0; j < this.rules.table[i].length; j++) {
                        if (this.rules.table[i][j].value === card) {
                            if (j === this.rules.table[i].length - 1) {
                                console.log("Removing element " + this.rules.table[i][j] + " from table. Contents before splicing: " + this.rules.table[i])
                                this.rules.table[i].splice(j, 1) //If this is the last card in the table we only move it
                                console.log("Table contents after removing element: " + this.rules.table[i])
                                this.lastMove.source = 'Table'
                                this.lastMove.sourceTableIndex = i
                                this.lastMove.multi = false
                                if (this.rules.table[i][j - 1] !== undefined) {
                                    if (this.rules.table[i][j - 1].faceup === false) {
                                        this.lastMove.flippedCard = true //When we moved the card we flipped the one above it over and need to flip it back
                                    }
                                    else {
                                        this.lastMove.flippedCard = false
                                    }
                                }
                            }
                            else {
                                //This card isn't the last, so we must be moving it and all the cards beneath it
                                multi = true
                                multiList = this.rules.table[i].splice(j, this.rules.table[i].length - j)
                                console.log("Multi move detected. Spliced array contents are logged")
                                console.log(multiList)
                                this.lastMove.source = 'Table'
                                this.lastMove.sourceTableIndex = i
                                this.lastMove.multi = true
                                if (this.rules.table[i][j - 1] !== undefined) {
                                    if (this.rules.table[i][j - 1].faceup === false) {
                                        this.lastMove.flippedCard = true //When we moved the card we flipped the one above it over and need to flip it back
                                    }
                                    else {
                                        this.lastMove.flippedCard = false
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (multi === true) {
                for (let i = 0; i < multiList.length; i++) {
                    table.push({ value: multiList[i].value, faceup: true })
                }
            }
            else
                table.push({ value: card, faceup: true })
            this.setState({ selectedCard: '' })
            this.lastMove.destination = 'Table'
            this.lastMove.destinationTableIndex = this.rules.table.indexOf(table)
            this.lastMove.lastCard = card
            this.lastMove.undoUsed = false
            this._correctVolume();
            if (this.state.curValue)
                clickSound.play();
            this.addMove()
            this.checkAutoComplete()
        }
        else {
            console.log("Illegal move")
        }
    }

    tryAddToFoundation(card, foundation) {
        //Card should be in string form as in deck.js, e.g. 'ah' for ace of hearts
        //Foundation should be one of these characters: 'h', 'd', 's', 'c'. Matches to solitaireRules.foundationMapping
        //Function checks if a card has been selected by the user, otherwise it will attempt to add the card to the foundation
        //TODO: Function needs a way to return a status letting the caller know if the move was successful or not

        let legalMove = false

        console.log("Clicked on foundation with contents of " + this.rules.foundations[this.rules.foundationMapping[foundation]])

        if (this.rules.myDeck.HasSameSuite(card, foundation)) { //Verify selected card and the foundations' suite are the same before checking the face value
            console.log("Card has matching suite with this foundation")
            if (this.lastFoundations[foundation] === '') { //If the foundation equals an empty string then no cards have been added and only an ace can be accepted
                //Check face value of card is an ace, if so its legal to add to the foundation
                console.log("Foundation pile is empty")
                if (this.state.selectedCard[0] === 'a') {
                    legalMove = true
                    console.log("Card is an ace and move is now legal")
                }
            }
            else {
                //If the foundation is not empty and we are adding a card we must verify there are no cards underneath the selected card
                if (this.state.selectedCard === this.state.drawnCard) {
                    //If this card is the card from the draw pile we only need to check for value difference now and then it will be legal
                    console.log("Foundation contains a card labelled " + this.lastFoundations[foundation])
                    console.log("Face value difference is " + this.rules.myDeck.FaceValueDifference(card, this.lastFoundations[foundation]))
                    if (this.rules.myDeck.FaceValueDifference(card, this.lastFoundations[foundation]) === 1) {
                        legalMove = true
                        console.log("Card is one value above foundation and move is legal")
                    }
                }
                else {
                    //If the card isn't from the draw pile we need to make sure the selected card is at the end of a table for it to be legal
                    for (let i = 0; i < this.rules.table.length; i++) {
                        if (this.rules.table[i].length === 0) {
                            console.log("Found empty column on pass " + i) //Programmer note: Removing this .log causes this if statement to be ignored
                        }
                        else if (this.rules.table[i][this.rules.table[i].length - 1].value === card) { //Take a look at the last card in each table column and see if one of them is our card
                            //If the last foundation is not empty then we must check our card is one face value higher than the current to be legal
                            console.log("Foundation contains a card labelled " + this.lastFoundations[foundation])
                            if (this.rules.myDeck.FaceValueDifference(card, this.lastFoundations[foundation]) === 1) {
                                legalMove = true
                                console.log("Card is one value above foundation and move is legal")
                            }
                        }
                        if (legalMove)
                            break; //If we have found a legal move we can stop checking each table for the card
                    }
                }
            }
        }
        if (legalMove) {
            //Find the index of the correct inner list from foundationMapping and add the new card to the top of the list
            this.passedCard = card
            this.rules.foundations[this.rules.foundationMapping[foundation]].push(this.passedCard);
            this.lastFoundations[foundation] = this.passedCard; //Change the last foundation to the most recent card added
            if (this.state.drawnCard === this.state.selectedCard) {
                //If we are adding a card to the table from the draw pile we need to check the stockList to see if there is another card to slot there

                if (this.state.stockList[0] !== null) {
                    //The stockList is not empty and we should update the drawnCard with stockList[0]
                    this.setState({ drawnCard: this.state.stockList[0] })
                    this.rules.discard.pop() //Remove the card put into the drawnCard section, we want to clear it from the discard pile
                    this.state.stockList[0] = this.rules.discard[this.rules.discard.length - 1]
                    this.state.stockList[1] = this.rules.discard[this.rules.discard.length - 2] //If either of these objects do not exist in the discard array they will be inserted into stockList as 'undefined'
                }
                this.lastMove.source = 'Talon'
            }
            else { //If the move was legal and was not from the draw pile it must be from the table
                //Need to look through each sub list of the solitaireRules.table and find our card
                for (let i = 0; i < this.rules.table.length; i++) {
                    for (let j = 0; j < this.rules.table[i].length; j++) {
                        if (this.rules.table[i][j].value === card) {
                            //We found it and can remove it from the list
                            console.log("Removing element " + this.rules.table[i][j] + " from table. Contents before splicing: ", this.rules.table[i])
                            this.rules.table[i].splice(j, 1)
                            console.log("Table contents after removing element: " + this.rules.table[i])
                            if (this.rules.table[i][this.rules.table[i].length - 1] !== undefined) {
                                if (this.rules.table[i][this.rules.table[i].length - 1].faceup === false) {
                                    this.lastMove.flippedCard = true
                                }
                                else {
                                    this.lastMove.flippedCard = false
                                }
                            }
                            this.lastMove.source = 'Table'
                            this.lastMove.sourceTableIndex = i
                        }
                    }
                }
            }

            console.log("Value of selected card backing variable is: " + this.passedCard)
            this.setState({ selectedCard: '' }) //Clear state of selected card after its been added to a foundation
            //this.forceUpdate(); //Hacky attempt to make the tablecolumns update with the new array data
            //If card was pulled from the table we will need additional cleanup for that
            console.log("Legal move selected, adding card to foundation")
            console.log("Contents of whole table after legal move is: ", this.rules.table)
            this.lastMove.lastCard = card
            this.lastMove.destination = 'Foundation'
            this.lastMove.foundationSuite = foundation
            this.lastMove.undoUsed = false
            this.addMove()
            this._correctVolume();
            if (this.state.curValue)
                clickSound.play();
            this.checkAutoComplete()
        }

        //Win state check after moving a card into a foundation
        if (this.lastFoundations['h'] === 'kh' && this.lastFoundations['d'] === 'kd' && this.lastFoundations['c'] === 'kc' && this.lastFoundations['s'] === 'ks') {
            this.onWinGame(); //If you have all kings in the foundation you have won the game.
        }
    }

    autoComplete() {
        let numberOfCards = 0
        for (let i = 0; i < this.rules.table.length; i++) {
            numberOfCards += this.rules.table[i].length //If the column is empty, we add zero to the total. Otherwise it will be the number of cards contained in that row
            this.rules.table[i].length = 0 //Clear all of the elements out of the table after adding up the card totals
        }
        this.numMoves += numberOfCards
        this.setState({ moveCount: 'Moves: ' + this.numMoves }) //Update the total number of moves it would take to add the cards into the foundations
        this.lastFoundations['h'] = 'kh'; this.lastFoundations['d'] = 'kd'; this.lastFoundations['c'] = 'kc'; this.lastFoundations['s'] = 'ks';
        this._correctVolume();
        if (this.state.curValue)
            autoCompleteSound.play();
        this.onWinGame() //After moves are updated, all cards are counted as being in the foundation
    }

    checkAutoComplete() {
        if (this.rules.stock.length === 0 && (this.state.drawnCard === '' || this.state.drawnCard === undefined)) {
            console.log("Stock pile is empty and drawn card is blank, checking if board is auto solvable...")
            let hasFacedownCards = false
            for (let i = 0; i < this.rules.table.length; i++) {
                for (let j = 0; j < this.rules.table[i].length; j++) {
                    if (this.rules.table[i].length !== 0) {
                        if (this.rules.table[i][j].faceup === false) {
                            hasFacedownCards = true
                        }
                    }
                    if (hasFacedownCards)
                        break
                }
                if (hasFacedownCards)
                    break
            }
            if (hasFacedownCards === false) { //If we loop through the whole table and find no facedown cards we can autocomplete the board
                console.log("Table can be solved by autocomplete")
                this.autoComplete()
            }
            else
                console.log("hasFacedownCards returned true and the table cannot be autocompleted")
        }
        else
            console.log("Board not valid for autocomplete check")
    }

    foundationInteract(card, foundation) {
        //card parameter should be the selected card
        //If there is no selected card, we should try to select the last card in the foundation
        //If there are no cards in the foundation we should ignore the click
        if (card === '' && this.lastFoundations[foundation] !== '') { //This function was called with no card selected so we should attempt to select the last foundation card
            let temp = this.rules.foundations[this.rules.foundationMapping[foundation]]
            this.selectCard(temp[Object.keys(temp).length - 1])
            //Card should be selected, but clicking another card or the foundation again should deselect it
            //Should only remove the card from the foundation if you make a legal move to the table, so we need to update tryAddToTable to check for foundation cards
        }
        else if (card === this.lastFoundations[foundation]) {
            this.selectCard(card)
        }
        else if (card !== '') { //If there is a selected card, we should run our normal tryAddToFoundation function instead
            this.tryAddToFoundation(card, foundation)
        }
    }

    selectCard(card) {
        console.log("Attempting to de/select card with value " + card)
        let status = {
            result: null,
        }
        if (card === '') { //Programmer's note: This code has been unreachable during all of our tests, maybe we should remove this check
            //Handle case where no card has been drawn (this.state.drawnCard will be an empty string)
            //For now we'll just ignore the event entirely
            console.log("Error: Card selected has no assigned value!");
            status.result = "Error"
            return status
        }
        else if (this.state.selectedCard === card) {
            //Handle a case where you attempt to select the same card again
            this.setState({ selectedCard: '' })
            status.result = "Deselect"
            console.log("Deselecting card")
        }
        else {
            //Finally assign the card to the current selected for use in placement
            this.setState({ selectedCard: card })
            status.result = "Select"
            console.log("Assigned selected card to value " + this.state.selectedCard)
        }
        console.log("Set state of selected card to " + this.state.selectedCard)
        return status
    }

    onWinGame() {
        console.log("WINNER WINNER!");
        // win screen popup
        this.setState({ modalVisible: true, gameWon: true });
        // give player 50 points for completing a game
        this._addPoints(50);
        clearInterval(this.state.timeInter) //Stop the timer

        //For testing purposes we only print to the log to make sure our game can properly detect the win condition
    }

    restartBoard() {
        console.log("Resetting solitaire board")
        this.rules = new SolitaireRules(); //Create new SolitaireRules and check if a game has been started
        this.rules.createBoard();

        this.numMoves = 0;
        this.numSecs = 0;

        this.state = { drawnCard: '', selectedCard: '', timer: 'Timer: ', moveCount: 'Moves: ' + this.numMoves, stockList: [], modalVisible: false, gameWon: false };
        this.lastFoundations = { 'h': '', 'd': '', 's': '', 'c': '' }
        this.passedCard = ''
        this.lastMove = {
            lastCard: '', source: '', destination: '', sourceTableIndex: null, destinationTableIndex: null,
            foundationSuite: null, multi: false, flippedCard: null, undoUsed: false
        }
        this.playAgain = true;
        this.props.navigation.replace('Solitaire')
    }

    setHelpVisible() {
        holder = this.state.helpVisible;
        this.setState({ helpVisible: !holder });
        if (!holder === true)  //The modal is being displayed and we should stop the game timer
            clearInterval(this.state.timeInter)
        else
            this.startTimer();
    }

    setModalVisible1() {
        holder = this.state.modalVisible1;
        this.setState({ modalVisible1: !holder });
        if (!holder === true)  //The modal is being displayed and we should stop the game timer
            clearInterval(this.state.timeInter)
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

    render() {
        const {
            modalVisible,
            modalVisible1,
            modalVisible3,
            modalVisible2,
            modalVisible4,
            helpVisible,
            last,
        } = this.state;
        return (
            <View style={styles.solitaireGameScreen}>

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
                                <Text style={{ fontSize: 25, marginTop: 5, textAlign: 'center', color: 'white' }}>{"Are you sure you want to surrender?"}</Text>
                                <View style={{ alignContent: 'center', flexDirection: 'row', height: 'auto', alignItems: 'center' }}>
                                    <TouchableHighlight onPress={() => { this.setModalVisible3(); this.setModalVisible1() }}>
                                        <Text style={styles.backText}>Yes</Text>
                                    </TouchableHighlight>
                                    <TouchableHighlight onPress={() => {this.setModalVisible1(); this.startTimer()}}>
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
                                <Text style={{ fontSize: 25, marginTop: 5, textAlign: 'center', color: 'white' }}>{"Are you sure you want to leave the game? Your progress will not be saved."}</Text>

                                <View style={{ alignContent: 'center', flexDirection: 'row', height: 'auto', alignItems: 'center' }}>
                                    <TouchableHighlight onPress={() => {this.props.navigation.replace('Home'); this._newLast("Solitaire")}}>
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
                                <Text style={{ fontSize: 25, marginTop: 5, textAlign: 'center', color: 'white' }}>{"Are you sure you want to go to Settings? Your progress will not be saved."}</Text>

                                <View style={{ alignContent: 'center', flexDirection: 'row', height: 'auto', alignItems: 'center' }}>
                                    <TouchableHighlight onPress={() => {this.props.navigation.replace('Settings'); this._newLast("Solitaire")}}>
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
                                <Text style={{ fontSize: 25, marginTop: 5, textAlign: 'center', color: 'white' }}>{'You surrendered, ' + this.state.playerName + '...'}</Text>
                                <TouchableHighlight style={{margin:5}} onPress={() => { this.setModalVisible3(); this.restartBoard() }}>
                                    <Text style={styles.backText}>Play Again</Text>
                                </TouchableHighlight>
                                <TouchableHighlight style={{margin: 5}} onPress={() => { this.props.navigation.replace('Home'); this._newLast("Solitaire")}}>
                                    <Text style={styles.backText}>Home</Text>
                                </TouchableHighlight>
                            </View>

                        </View>
                    </View>
                </Modal>



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
                                width: '90%',
                                height: '50%',
                                borderWidth: 1,
                                borderColor: '#fff',
                                borderRadius: 7,
                                elevation: 10,
                            }}>

                            <View style={{ alignContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontSize: 25, marginTop: 5, textAlign: 'center', color: 'white' }}>{this.state.gameWon === true ? 'You Won, ' + this.state.playerName + '! \n' : 'You Surrendered, ' + this.state.playerName + '...'} {this.state.timer} {"\n"} {this.state.moveCount}</Text>

                                <View style={{ alignContent: 'center', flexDirection: 'row', height: 'auto', alignItems: 'center' }}>
                                    <TouchableHighlight style={{margin:5}} onPress={() => { this.props.navigation.replace('Home') }}>
                                        <Text style={styles.whiteButtonText}>Home</Text>
                                    </TouchableHighlight>
                                    <TouchableHighlight style={{margin:5}} onPress={() => { this.setState({ modalVisible: false }); this.restartBoard() }}>
                                        <Text style={styles.whiteButtonText}>Play Again</Text>
                                    </TouchableHighlight>
                                    <TouchableHighlight style={{margin:5}} onPress={() => { this.setState({ modalVisible: false }); this.startTimer() }}>
                                        <Text style={styles.whiteButtonText}>Close</Text>
                                    </TouchableHighlight>
                                </View>
                            </View>

                        </View>
                    </View>
                </Modal>

                <Modal
                    visible={helpVisible}
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
                                <Text style={{ fontSize: 25, marginTop: 5, textAlign: 'center', color: 'white' }}>{"Solitaire Rules"}</Text>
                                <Text style={{ fontSize: 15, marginTop: 5, textAlign: 'left', color: 'white' }}>{"- You may surrender at any time."}</Text>
                                <Text style={{ fontSize: 15, marginTop: 5, textAlign: 'left', color: 'white' }}>{"- You may only undo 1 move until you play another move."}</Text>
                                <Text style={{ fontSize: 20, marginTop: 5, textAlign: 'center', color: 'white' }}>{"All of the following are considered moves:"}</Text>
                                <Text style={{ fontSize: 15, marginTop: 5, textAlign: 'left', color: 'white' }}>{"- You may put a card into a foundation if the value is one greater than the card in that foundation and the suit is the same."}</Text>
                                <Text style={{ fontSize: 15, marginTop: 5, textAlign: 'left', color: 'white' }}>{"- You may draw cards from the stock pile."}</Text>
                                <Text style={{ fontSize: 15, marginTop: 5, textAlign: 'left', color: 'white' }}>{"- You may move a card or a stack of cards from one column to any other column, as long as the highest value card being moved is one lower and the opposite color as the card being moved to."}</Text>
                                <Text style={{ fontSize: 15, marginTop: 5, textAlign: 'left', color: 'white' }}>{"- You may move a card or a stack of cards from one column to an empty column."}</Text>
                                <View style={{ alignContent: 'center', flexDirection: 'row', height: 'auto', alignItems: 'center' }}>
                                    <TouchableHighlight onPress={() => { this.setHelpVisible(); }}>
                                        <Text style={styles.backText}>Back</Text>
                                    </TouchableHighlight>
                                </View>
                            </View>

                        </View>
                    </View>
                </Modal>

                <View>
                    <View style={styles.topSolitaireBar}>
                        <Text style={styles.commonText}>{this.state.timer}</Text>
                        <Text style={styles.commonText}>{this.state.moveCount}</Text>
                        <TouchableHighlight onPress={() => this.setModalVisible2()}>
                            <Text style={styles.buttonText}>Back</Text>
                        </TouchableHighlight>
                        <TouchableHighlight onPress={() => this.setModalVisible4()}>
                            <Image style={styles.gameButton} source={require('./assets/Settings_Icon.png')} />
                        </TouchableHighlight>
                        <TouchableHighlight onPress={() => this.undoMove()}>
                            <Text style={styles.buttonText}>Undo</Text>
                        </TouchableHighlight>
                        <TouchableHighlight onPress={() => this.setModalVisible1()}>
                            <Text style={styles.buttonText}>Surrender</Text>
                        </TouchableHighlight>

                        <TouchableHighlight onPress={() => this.setHelpVisible()}>
                            <Text style={styles.buttonText}>Help</Text>
                        </TouchableHighlight>
                    </View>

                    <View style={styles.solitaireGameArea}>
                        <View style={styles.stockDrawArea}>
                            <TouchableHighlight onPress={() => this.drawCard()}>
                                <View style={styles.gameCard}>
                                    <Text style={styles.whiteText}>{this.rules.stock.length === 0 ? "Recycle" : "Stock Draw"}</Text>
                                </View>
                            </TouchableHighlight>
                            <View style={styles.gameCard}>
                                <Image style={styles.cardImage} source={this.state.stockList[1] !== null ? imageMap[this.state.stockList[1]] : imageMap['']} />
                            </View>
                            <View style={styles.gameCard}>
                                <Image style={styles.cardImage} source={this.state.stockList[0] !== null ? imageMap[this.state.stockList[0]] : imageMap['']} />
                            </View>
                            <TouchableHighlight
                                onPress={() => this.selectCard(this.state.drawnCard)}>
                                <View style={styles.gameCard}>
                                    <Image style={[styles.cardImage, { borderColor: (this.state.drawnCard === this.state.selectedCard && this.state.selectedCard !== '' ? 'magenta' : 'white') }]} source={imageMap[this.state.drawnCard]} />
                                </View>
                            </TouchableHighlight>
                        </View>
                        <View style={styles.tableArea}>
                            <TableColumn tableList={this.rules.table[0]} solitaireRef={this} selectedCard={this.state.selectedCard} />
                            <TableColumn tableList={this.rules.table[1]} solitaireRef={this} selectedCard={this.state.selectedCard} />
                            <TableColumn tableList={this.rules.table[2]} solitaireRef={this} selectedCard={this.state.selectedCard} />
                            <TableColumn tableList={this.rules.table[3]} solitaireRef={this} selectedCard={this.state.selectedCard} />
                            <TableColumn tableList={this.rules.table[4]} solitaireRef={this} selectedCard={this.state.selectedCard} />
                            <TableColumn tableList={this.rules.table[5]} solitaireRef={this} selectedCard={this.state.selectedCard} />
                            <TableColumn tableList={this.rules.table[6]} solitaireRef={this} selectedCard={this.state.selectedCard} />
                        </View>
                        <View style={styles.foundationArea}>
                            <TouchableHighlight
                                onPress={() => this.foundationInteract(this.state.selectedCard, 'h')}>
                                <View style={styles.gameCard}>
                                    {this.lastFoundations['h'] === '' ? <Image style={styles.cardImage} source={imageMap['fh']}/> :
                                        <Image style={[styles.cardImage, { borderColor: (this.state.selectedCard === this.lastFoundations['h'] ? 'magenta' : 'white') }]} source={imageMap[this.lastFoundations['h']]} />
                                    }
                                </View>
                            </TouchableHighlight>

                            <TouchableHighlight
                                onPress={() => this.foundationInteract(this.state.selectedCard, 's')}>
                                <View style={styles.gameCard}>
                                    {this.lastFoundations['s'] === '' ? <Image style={styles.cardImage} source={imageMap['fs']}/> :
                                        <Image style={[styles.cardImage, { borderColor: (this.state.selectedCard === this.lastFoundations['s'] ? 'magenta' : 'white') }]} source={imageMap[this.lastFoundations['s']]} />
                                    }
                                </View>
                            </TouchableHighlight>

                            <TouchableHighlight
                                onPress={() => this.foundationInteract(this.state.selectedCard, 'd')}>
                                <View style={styles.gameCard}>
                                    {this.lastFoundations['d'] === '' ? <Image style={styles.cardImage} source={imageMap['fd']}/> :
                                        <Image style={[styles.cardImage, { borderColor: (this.state.selectedCard === this.lastFoundations['d'] ? 'magenta' : 'white') }]} source={imageMap[this.lastFoundations['d']]} />
                                    }
                                </View>
                            </TouchableHighlight>

                            <TouchableHighlight
                                onPress={() => this.foundationInteract(this.state.selectedCard, 'c')}>
                                <View style={styles.gameCard}>
                                    {this.lastFoundations['c'] === '' ? <Image style={styles.cardImage} source={imageMap['fc']}/> :
                                        <Image style={[styles.cardImage, { borderColor: (this.state.selectedCard === this.lastFoundations['c'] ? 'magenta' : 'white') }]} source={imageMap[this.lastFoundations['c']]} />
                                    }
                                </View>
                            </TouchableHighlight>
                        </View>
                    </View>
                </View>
            </View >
        );
    }
}

const styles = StyleSheet.create(
    {
        solitaireGameScreen: {
            flex: 1,
            backgroundColor: 'black',
        },
        cardText: {
            fontSize: 8,
            fontWeight: 'bold',
        },
        whiteText: {
            fontSize: 8,
            fontWeight: 'bold',
            color: 'white',
        },
        tableScroll: {
            height: '90%',
        },
        winScreen: {
            backgroundColor: 'cyan',
            height: '40%',
            width: '30%',
            justifyContent: 'center',
            alignItems: 'center',
            transparent: 'false',
            borderColor: 'black',
            borderWidth: 3,
        },
        modal: {
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
        },
        topSolitaireBar: {
            height: '6%',
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            backgroundColor: 'cyan',
            alignItems: 'center',
        },
        solitaireGameArea: {
            width: '100%',
            flexDirection: 'row',
        },
        stockDrawArea: {
            width: '10%',
            flexDirection: 'column',
        },
        tableArea: {
            width: '80%',
            height: '90%',
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            marginBottom: 50,
        },
        foundationArea: {
            width: '10%',
            flexDirection: 'column',
            alignItems: 'center',
        },
        gameCard: {
            height: 72,
            width: 50,
            margin: 3,
            borderWidth: 1,
            borderColor: 'white',
            borderRadius: 5,
            justifyContent: 'center',
            alignItems: 'center',
        },
        menuView: {
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 10,
            padding: 25,
        },
        buttonContainer: {
            height: '10%',
            justifyContent: 'center',
            flexDirection: 'row',
            alignItems: 'center',
        },
        gameButton: {
            height: 18,
            width: 18,
            padding: 2,
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
        titleText: {
            fontSize: 30,
            fontWeight: '600',
            textAlign: 'center',
        },
        buttonText: {
            color: 'black',
            textAlign: 'center',
            borderColor: 'black',
            padding: 1,
            borderWidth: 2,
            fontWeight: 'bold',
            fontSize: 12,
            margin: 1,
        },
        whiteButtonText: {
            color: 'white',
            textAlign: 'center',
            borderColor: 'white',
            padding: 2,
            borderWidth: 2,
            fontWeight: 'bold',
            fontSize: 12,
        },
        commonText: {
            color: 'black',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: 12,
        },
        settingsHeader: {
            textAlign: 'center',
            fontSize: 35,
            fontWeight: 'bold',
        },
        cardImage: {
            resizeMode: 'contain',
            height: 72,
            width: 50,
            borderWidth: 0.5,
            padding: 1,
            borderColor: 'white',
            borderRadius: 5,
        },
    });
