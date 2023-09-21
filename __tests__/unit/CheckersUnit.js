import 'react-native';
import React from 'react';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

import { Checkers_Rules } from '../../src/CheckersComponents/checkers.ts'


// block of tests
describe("Testing for Checkers", () => {
    // initialize new checkers board
    const checkers = new Checkers_Rules();
    test("Game should not be over at the start", () => {
        expect(checkers.isGameOver()).toBe(false);
    });
});
