import 'react-native';
import React from 'react';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

import { Chess } from '../../node_modules/chess.js/src/chess.ts'

// block of tests
describe("Testing for Chess", () => {
    // initialize new chess board
    const chess = new Chess();
    // test isGameOver
    test("Game should not be over at the beginning", () => {
        expect(chess.isGameOver()).toBe(false);
    });
});
