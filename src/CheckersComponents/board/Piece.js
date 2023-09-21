import React, { Component } from 'react';
import { TouchableWithoutFeedback, Image } from 'react-native';
import { PropTypes } from 'prop-types';

const PIECE_IMAGES = {
  p : {
    w: require('./pieces/Green_Piece.png'),
    b: require('./pieces/Magenta_Piece.png'),
  },
  k : {
    w: require('./pieces/Green_King.png'),
    b: require('./pieces/Magenta_King.png'),
  }
 };


export default class Piece extends Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    position: PropTypes.string.isRequired,
    xIndex: PropTypes.number.isRequired,
    yIndex: PropTypes.number.isRequired,
    genSize: PropTypes.number.isRequired,
    reverseBoard: PropTypes.bool,
    onchosen: PropTypes.func.isRequired,
  };

  onchosen = () => {
    const { position, onchosen } = this.props;
    onchosen(position);
  };

  // verify if piece has move before authorize new renderer
  shouldComponentUpdate(nextProps, nextState) {

    // check props dependencies of piece renderer
    const {xIndex, yIndex, reverseBoard, type, color} = nextProps;

    return (
      xIndex !== this.props.xIndex ||
      yIndex !== this.props.yIndex ||
      reverseBoard !== this.props.reverseBoard ||
      type !== this.props.type ||
      color !== this.props.color
    );

  }

  render() {
    const {
      type,
      color,
      xIndex,
      yIndex,
      genSize,
      reverseBoard,
    } = this.props;
    const pieceImageSource = PIECE_IMAGES[type][color];

    return (
      <TouchableWithoutFeedback onPress={this.onchosen}>
        <Image
          style={{
            position: 'absolute',
            top: genSize * xIndex,
            left: genSize * yIndex,
            width: genSize,
            height: genSize,
            transform: [
              {
                rotate: reverseBoard ? '180deg' : '0deg',
              },
            ],
          }}
          source={pieceImageSource}
        />
      </TouchableWithoutFeedback>
    );
  }
}
