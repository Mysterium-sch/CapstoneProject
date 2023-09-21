import Deck from './deck';

export default class SolitaireRules {
    constructor() {
        this.discard = []; //List of all cards that exist in the discard/talon pile, cards you already have gone through in the stock
        this.stock = []; //All of the cards not yet in play on the board
        //When the stock pile is depleted all cards from the discard pile are taken and placed back in order
        this.table = [[], [], [], [], [], [], []]; //Seven empty lists contain all the cards for play, with element N having N+1 cards in it at start of play
        this.foundations = [[], [], [], []]; //List of four lists, each only taking one suit of cards in ascending order (ace, 2, ..., king)
        this.foundationMapping = {'h' : 0, 'd' : 1, 's' : 2, 'c' : 3}; //Maps the suite character to the index of this.foundations for fetching correct inner list
        this.myDeck = new Deck();
    }
    
    createBoard() {
        this.myDeck.Shuffle();//shuffle the deck
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < i + 1; j++) {
                this.table[i].push({value: this.myDeck.Draw(), faceup: false}); //Draw all of the cards out of the deck and into the tableau
            }
        }
        this.stock = [...this.myDeck.current_deck]; //Make a copy of the remaining deck into the stock pile
        this.myDeck.current_deck = []; //All of the deck has been drawn into the stock pile, any further .Draw() calls should raise errors
        console.log("Stock: " + this.stock);
        console.log("Table: " + this.table);
    }

    
    StockDraw() {
        if (this.stock.length === 0){
            this.RecycleDiscardPile(); //There are no cards left in the stock pile, so we should grab the cards from the waste pile in the same order for the user to start going through the stock again
            return
        }
        let cardDrawn = this.stock.pop();
        console.log("You drew " + cardDrawn);
        return cardDrawn;
    }

    Discard(card){
        this.discard.push(card);
        console.log("You discarded card labelled " + card)
    }
    
    // want discarded cards to be used again once the stock reaches 0 cards left
    // if you  pass through a card in the stock its going to be discarded and still able to select from the stock
    RecycleDiscardPile() {
        //Microsoft reduces a player's score by 100 if you recycle the waste pile, like below
        // we might not want to even have score be calculated like that and just use the timer instead of points
        /*if (score < 100)
                score = 0
            else
                score -= 100*/
        console.assert(this.stock.length === 0); // only ever recycle discard piles when there are zero elements in the stock list
        this.stock = [...this.discard]; //Transfer all elements from the discard pile to the stock pile
        this.stock.reverse(); //Flip the stock pile so the cards are in the proper order
        this.discard = []; //Clear the discard pile once all cards have been moved
        console.log("Recycling discard pile");
    }
}

