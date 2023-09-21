import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { PropTypes } from 'prop-types';

export default class Squares extends Component {
  static propTypes = {
    size: PropTypes.number.isRequired,
    showNotation: PropTypes.bool,
    xIndex: PropTypes.number.isRequired,
    position: PropTypes.string.isRequired,
    yName: PropTypes.string.isRequired,
    yIndex: PropTypes.number.isRequired,
    dimension: PropTypes.number.isRequired,
    chosen: PropTypes.bool,
    moveable: PropTypes.bool,
    prevMove: PropTypes.bool,
    inCheck: PropTypes.bool,
    reverseBoard: PropTypes.bool,
    onchosen: PropTypes.func.isRequired,
  };

  onchosen = () => {
    const { position, onchosen } = this.props;
    onchosen(position);
    console.log(position);
  };

  renderNotations(isPink) {
    const {
      showNotation,
      xIndex,
      yIndex,
      yName,
      dimension,
      reverseBoard,
    } = this.props;
    const notations = [];
    const transform = [
      {
        rotate: reverseBoard ? '180deg' : '0deg',
      },
    ];

    if (showNotation) {
      if (yIndex + 1 === dimension) {
        notations.push(
          <Text
            key={'row_notations'}
            style={[
              styles.notation,
              {
                color: isPink ? '#e20ced' : '#2aed0c',
                top: 0,
                right: 0,
                transform,
              },
            ]}
          >
            {dimension - xIndex}
          </Text>,
        );
      }

      if (xIndex + 1 === dimension) {
        notations.push(
          <Text
            key={'column_notation'}
            style={[
              styles.notation,
              {
                color: isPink ? '#e20ced' : '#2aed0c',
                bottom: 0,
                left: 0,
                transform,
              },
            ]}
          >
            {yName}
          </Text>,
        );
      }
    }

    return notations;
  }

  renderMoveIndicator() {
    const { moveable } = this.props;

    if (moveable) {
      return <View style={styles.moveIndicator} />;
    }
    return null;
  }

  // verify if square is update before authorize new renderer
  shouldComponentUpdate(nextProps, nextState) {

    // check props dependencies square renderer
    const {chosen, prevMove, moveable, inCheck, reverseBoard} = nextProps;

    return (
      prevMove !== this.props.prevMove ||
      moveable !== this.props.moveable ||
      inCheck !== this.props.inCheck ||
      chosen !== this.props.chosen ||
      reverseBoard !== this.props.reverseBoard
    );

  }

  render() {
    const {
      size,
      xIndex,
      yIndex,
      chosen,
      prevMove,
      inCheck,
      moveable,
    } = this.props;
    const isPink = (xIndex + yIndex) % 2 === 0;
    let backgroundColor = isPink ? '#e20ced' : '#2aed0c';

    if (chosen) {
      backgroundColor = '#09e6ed';
    } else if (prevMove) {
      backgroundColor = '#7e04db';
    } else if (inCheck) {
      backgroundColor = '#0c4ced';
    }

    return (
      <TouchableWithoutFeedback
        onPress={this.onchosen}
        disabled={!moveable}
      >
        <View
          style={[
            styles.container,
            {
              backgroundColor,
              width: size,
              height: size,
            },
          ]}
        >
          {this.renderMoveIndicator()}
          {this.renderNotations(isPink)}
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  notation: {
    position: 'absolute',
    fontSize: 11,
    fontWeight: 'bold',
  },
  moveIndicator: {
    width: 24,
    height: 24,
    opacity: 0.3,
    backgroundColor: '#208530',
    borderRadius: 12,
  },
});