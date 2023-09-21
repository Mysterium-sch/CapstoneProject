import React, { Component } from 'react';
import { Dimensions, View, StyleSheet, Modal, Text, TouchableHighlight } from 'react-native';
import { PropTypes } from 'prop-types';

import { Chess, QUEEN } from 'chess.js';
import Sound from 'react-native-sound';

import Square from './Square';
import Piece from './Piece';

import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;
const DIMENSION = 8;
const COLUMN_NAMES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

const moveSound = new Sound('move.mp3', Sound.MAIN_BUNDLE);
const captureSound = new Sound('capture.mp3', Sound.MAIN_BUNDLE);

export default class BoardView extends Component {
  static navigationOptions = {
    title: 'ChessBoard',
  };

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

  _correctName = async () => {
    try {
      const oldValue = await AsyncStorage.getItem('@Name');
      this.setState({ name: oldValue });
    } catch (error) {
      console.log(error);
    }
  }

  componentDidMount() {
    this._correctName();
    this._correctVolume();
  }

  componentWillUnmount() {
    this._setResult(" ");
    this._setActivate("no");
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

  constructor(props, v) {
    super(props);

    const game = new Chess(props.fen);

    this.state = {
      game,
      board: this.createBoardData(game, props.fen),
      result: '',
      modalVisible: false,
      curValue: false,
      name: "Guest",
      curPlayer: '',
    };
  }


  // adds points to user's lifetime points score
  // should be called upon game end
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

  _Name = async () => {
    try {
        const oldValue = await AsyncStorage.getItem('@Name');
        this.setState({name : oldValue});
    } catch (error) {
      console.log(error);
    }
}

_setResult = async (points) => {
  try {
    AsyncStorage.setItem('@result', points);
  } catch (error) {
    console.log(error);
  }
}

_setActivate = async (points) => {
  try {
    AsyncStorage.setItem('@activate', points);
  } catch (error) {
    console.log(error);
  }
}
  correctValues() {
    const { game } = this.state;
    if(game.turn() === 'w') {
      this.setState ({curPlayer: this.state.name});
    } else {
      this.setState ({curPlayer: "Opponent"});
    }
    this._correctVolume();
    this._correctName();
    }

     componentDidUpdate(prevProps, prevState) {
    if (prevState.curValue !== this.state.curValue) {
      console.log('changes');
      this.correctValues();
      this.forceUpdate();
    }
  }

  movePiece = (to, from) => {
    const { onMove } = this.props;
    const { game, board } = this.state;
    const chosenPiece = board.find(item => item.chosen);
    oldPiecie = game.get(to).type;
    // console.log("Taking: " + oldPiecie);
    const moveConfig = {
      to: to,
      from: from || chosenPiece.position,
      promotion: QUEEN,
    };
    const moveResult = game.move(moveConfig);
    // console.log(to, " From:", chosenPiece.position, " ", chosenPiece.type);
    this._correctVolume();

    if (moveResult && moveResult.captured && this.state.curValue) {
      captureSound.play();
    } else if (this.state.curValue) {
      moveSound.play();
    }
    // Game end detection
    // give player 50 points for win/loss, 25 otherwise
    this.correctValues();
    if (this.state.game.isCheckmate()) {
      console.log("Checkmate");
      this._addPoints(50);
      this._setActivate('yes');
      this._setResult(this.state.curPlayer + " won")
    } else if (this.state.game.isStalemate()) {
      console.log("Stalemate");
      this._addPoints(25);
      this._setActivate('yes');
      this._setResult("stalemate")
    } else if (this.state.game.isDraw()) {
      console.log("Draw");
      this._addPoints(25);
      this._setActivate('yes');
      this._setResult("Draw")
    }

    onMove(moveConfig);

    this.setState({
      board: this.createBoardData(game),
    });
  };

  selectPiece = position => {
    const { shouldSelectPiece } = this.props;
    const { board, game } = this.state;
    const piece = board.find(b => b.position === position);

    // capture the piece
    if (piece.moveable) {
      this.movePiece(position);
      return;
    }

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

  createBoardData(game, newFen) {
    if (newFen) {
      game.load(newFen);
    }

    const board = game.board();
    const squares = [];
    const history = game.history({ verbose: true });
    const prevMove = history[history.length - 1] || {};
    const inCheck = game.inCheck();
    const turn = game.turn();
    const gameOver = game.isGameOver();

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
          inCheck: inCheck && turn === color && type === game.KING,
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

  render() {
    const { color, style } = this.props;
    const modalVisible = this.state.modalVisible;
    const result = this.state.result;
    const reverseBoard = color === 'b';

    return (
      <View style={[styles.container, style]}>
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
  backText: {
    color: 'white',
    textAlign: 'center',
    borderColor: 'white',
    padding: 5,
    borderWidth: 2,
    fontWeight: 'bold',
    fontSize: 18,
  },
  container: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
});
