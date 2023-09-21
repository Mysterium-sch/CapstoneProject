//A class representing a deck of playing cards

export default class Deck {

    constructor() {
        this.full_deck = [] //All of the cards that exist
        this.current_deck = [] //All of the cards that have not been drawn yet
        this.suites = ['h', 'd', 's', 'c'];
        this.faces = { 1: 'a', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10', 11: 'j', 12: 'q', 13: 'k' };
        this.red_suites = ['h', 'd'];
        this.black_suites = ['s', 'c'];

        for (let i = 0; i < this.suites.length; i++) {
            for (var key in this.faces) {
                this.full_deck.push(this.faces[key] + this.suites[i]) //Fetch value from dictionary based on key. Loops through all keys so first assign is 'A' and last is 'K'
            }
        }
        this.current_deck = this.full_deck;
    }

    Shuffle()   //implementation of the optimized Fisher-Yates shuffle
    {
        for(let i = 0; i < 50; i++) //decks have 52 cards, therefore I can use the constant 50
        {
            let j = Math.floor((Math.random() * (52-i))) + i;   //should get a number i <= j < n
            let temp = this.full_deck[i];
            console.log(temp + ", j =" + j + ", " + this.full_deck[j]);
            this.full_deck[i] = this.full_deck[j];
            this.full_deck[j] = temp;
        }
    }

    Draw() {
        if (this.current_deck.length === 0) {
            throw new Error('No more cards are left in the deck to draw from');
        }
        return this.current_deck.pop(); //Return the card as a string representation, e.g. "ah" for the ace of hearts
    }

    FaceValueDifference(card1, card2) {
        //Programmer's note: Function does not guard against illegal input and can return invalid math operation errors (null minus null)
        //card1 will look like 'ah' and then card2 is '2h'
        let face1 = card1.slice(0, -1); //Remove the suite character from both cards
        let face2 = card2.slice(0, -1);

        let value1 = null;
        let value2 = null;

        for (const [key, value] of Object.entries(this.faces)) {
            if (face1 === value) {
                value1 = key; //The integer that tells us what face value this card has
            }
            if (face2 === value) {
                value2 = key;
            }
        }
        return value1 - value2; //Get the point difference between the two cards
    }

    ColorMatch(card1, card2) {
        //card1 will look like 'ah' and then card2 is '2h'
        let suite1 = card1.slice(-1) //Slice from one character away from the end up to the last character. This slices off the 'H' from the example data
        let suite2 = card2.slice(-1)
        if (this.red_suites.includes(suite1) && this.red_suites.includes(suite2))
            return true;
        else if (this.black_suites.includes(suite1) && this.black_suites.includes(suite2))
            return true;
        else
            return false
    }

    HasSameSuite(card1, card2) {
        let suite1 = card1.slice(-1)
        let suite2 = card2.slice(-1)
        if (suite1 === suite2)
            return true;
        else
            return false
    }

}
