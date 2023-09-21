import React, { Component } from 'react';
import { Dimensions, View, StyleSheet, Text, TouchableHighlight, Modal } from 'react-native';
import { PropTypes } from 'prop-types';

import { Checkers_Rules, KING } from '../checkers.ts';
var Sound = require('react-native-sound');
Sound.setCategory('Playback');

import Square from './Square';
import Piece from './Piece';

import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;
const DIMENSION = 8;
const COLUMN_NAMES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

const moveSound = new Sound('../../../android/app/src/res/raw/move.mp3', Sound.MAIN_BUNDLE);
const captureSound = new Sound('../../../android/app/src/res/raw/capture.mp3', Sound.MAIN_BUNDLE);

export default class BoardView extends Component {

  _correctVolume = async () => {
    try {
      const oldValue = await AsyncStorage.getItem('@Volume');
      if (oldValue == 'false') {
        this.setState({ curValue: false });
      } else {
        this.setState({ curValue: true });
      }
    } catch (error) {
      console.log("Couldn't retrieve Volume: ", error);
    }
  }

  componentDidMount() {
    this._correctVolume();
  }

  static propTypes = {
    lastfen: PropTypes.string,
    fen: PropTypes.string,
    size: PropTypes.number,
    showNotation: PropTypes.bool,
    color: PropTypes.oneOf(['w', 'b']),
    shouldSelectPiece: PropTypes.func,
    onMove: PropTypes.func,
  };

  static defaultProps = {
    size: screenWidth - 32,
    showNotation: true,
    color: 'w',
    shouldSelectPiece: () => true,
    onMove: () => { },
  };

  constructor(props) {
    super(props);

    const game = new Checkers_Rules(props.fen);
    this.state = {
      game,
      board: this.createBoardData(game, props.fen),
      modalVisible: false,
      curValue: false,
      result: '',
    };
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
      console.log("problem adding points: ",error);
    }
  }

  _setResult = async (points) => {
    try {
      AsyncStorage.setItem('@result', points);
    } catch (error) {
      console.log("Problem setting result: ",error);
    }
  }
  
  _setActivate = async (points) => {
    try {
      AsyncStorage.setItem('@activate', points);
    } catch (error) {
      console.log("problem with activate: ",error);
    }
  }

  correctValues() {
    this._correctVolume();
    }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.curValue !== this.state.curValue) {
      this. correctValues();
      this.forceUpdate();
    }
  }

  movePiece = (to) => {
    const { onMove } = this.props;
    const { game, board } = this.state;
    const chosenPiece = board.find(item => item.chosen);
    //console.log("chosenPiece: ", chosenPiece)
    const moveConfig = {
      to: to,
      from: chosenPiece.position,
      promotion: KING,
    };
    const legalMoves = game._moves({legal: true, verbose: true}); // check if the move is legal
    //console.log("Legal Moves: ",legalMoves);
    //console.log("move attempted: ", moveConfig)
    if (!legalMoves.find(element => element.to == to && element.from == chosenPiece.position)) {
      // warn the player that they must take a capturing move
      this.setState({ modalVisible: true })
      return
    }
    const moveResult = game.move(moveConfig);

    if (moveResult && moveResult.captured) {
      this._correctVolume();
      // game.move(doitAgain);
      if (this.state.curValue) {
        captureSound.stop();
        captureSound.play();
        captureSound.stop();
      }

    } else {
      if (this.state.curValue)
        moveSound.play();
    }
    // detect end of game condition
    if (this.state.game.isGameOver()) {
      // give the player 50 points for completing a game
      this._addPoints(50);
      if (chosenPiece.color === 'w') {
        this._setActivate('yes');
        this._setResult("Player 1 won")
      }
      else if (chosenPiece.color === 'b') {
        this._setActivate('yes');
        this._setResult("Player 2 won")
      }
    }

    if(this.state.game.isStalemate()) {
      this._setActivate('yes');
      this._setResult("Draw")
    }

    onMove(moveResult);

    this.setState({
      board: this.createBoardData(game,undefined,moveResult),
    });
  };

  selectPiece = position => {
    const { shouldSelectPiece } = this.props;
    const { board, game } = this.state;
    const piece = board.find(b => b.position === position);

    // do nothing if piece shouldn't be chosen
    if (!shouldSelectPiece(piece)) {
      return;
    }

    const possibleMoves = game
      .moves({
        square: piece.position,
        verbose: true,
      })
      .map(item => item.to);

    const newBoard = board.map(square => {
      // unselect everything
      if (piece.chosen) {
        return {
          ...square,
          chosen: false,
          moveable: false,
        };
      }

      const ischosen = square.position === position;
      const moveable = possibleMoves.indexOf(square.position) > -1;

      return {
        ...square,
        chosen: ischosen,
        moveable,
      };
    });

    this.setState({
      board: newBoard,
    });
  };

  createBoardData(game, newFen, prevMove = {}) {
    if (newFen) {
      game.load(newFen);
    }

    const board = game.board();
    const squares = [];
    //const history = game.history({ verbose: true });
    //console.log("History: ",history)
    //const prevMove = history[history.length - 1] || {};
    // console.log("Previous move: ",prevMove)
    const turn = game.turn();

    board.forEach((row, xIndex) => {
      row.forEach((square, yIndex) => {
        const yName = COLUMN_NAMES[yIndex];
        const position = `${yName}${DIMENSION - xIndex}`;
        const type = square ? square.type : '';
        const color = square ? square.color : '';

        squares.push({
          ...square,
          position,
          yName,
          xIndex,
          yIndex,
          chosen: false,
          moveable: false,
          prevMove: position === prevMove.to || position === prevMove.from,
        });
      });
    });

    return squares;
  }

  renderSquares(reverseBoard) {
    const { size, showNotation } = this.props;
    const { board } = this.state;
    const squareSize = size / DIMENSION;
    const rowSquares = [];

    board.forEach(square => {
      const {
        xIndex,
        yIndex,
        yName,
        position,
        chosen,
        moveable,
        prevMove,
      } = square;

      const squareView = (
        <Square
          key={`square_${xIndex}_${yIndex}`}
          size={squareSize}
          showNotation={showNotation}
          xIndex={xIndex}
          yIndex={yIndex}
          yName={yName}
          dimension={DIMENSION}
          chosen={chosen}
          moveable={moveable}
          position={position}
          prevMove={prevMove}
          reverseBoard={reverseBoard}
          onchosen={this.movePiece}
        />
      );

      if (!rowSquares[xIndex]) {
        rowSquares[xIndex] = [];
      }
      rowSquares[xIndex].push(squareView);
    });

    return rowSquares.map((r, index) => {
      return (
        <View key={`row_${index}`} style={styles.row}>
          {r}
        </View>
      );
    });
  }

  renderPieces(reverseBoard) {
    const { size } = this.props;
    const { board } = this.state;

    return board.map(square => {
      const {
        type,
        color,
        xIndex,
        yIndex,
        position,
      } = square;
      if (type) {
        return (
          <Piece
            key={`piece_${xIndex}_${yIndex}`}
            color={color}
            type={type}
            xIndex={xIndex}
            yIndex={yIndex}
            genSize={size / DIMENSION}
            position={position}
            reverseBoard={reverseBoard}
            onchosen={this.selectPiece}
          />
        );
      }
      return null;
    });
  }

  componentWillUnmount() {
    this._setResult(" ");
    this._setActivate("no");
  }


  render() {
    const modalVisible = this.state.modalVisible;
    const result = this.state.result;
    const { color, style } = this.props;
    const reverseBoard = color === 'b';

    return (
      <View style={[styles.container, style]}>
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
                marginVertical: 60, 
                width: '90%',
                borderWidth: 1,
                borderColor: '#fff',
                borderRadius: 7,
                elevation: 10, 
              }}>
              <View style={{ alignItems: 'center', margin: 10 }}> 
                <TouchableHighlight onPress={() => this.setState({modalVisible: false})}>
                  <Text style={{ fontSize: 25, marginTop: 5, textAlign: 'center', color:'white' }}>Please choose a capturing move. Click anywhere to continue.</Text>
                </TouchableHighlight>
              </View>
            </View>
          </View>
        </Modal>
        <View
          style={{
            transform: [
              {
                rotate: reverseBoard ? '180deg' : '0deg',
              },
            ],
          }}
        >
          {this.renderSquares(reverseBoard)}
          {this.renderPieces(reverseBoard)}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
});
