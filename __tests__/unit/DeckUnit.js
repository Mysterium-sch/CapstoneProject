/**
 * @format
 */

import 'react-native';
import React from 'react';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

import Deck from '../../src/deck'


// block of tests
describe("Testing for Deck", () => {
    const deck = new Deck();
    // tests for FaceValueDifference
    test("FaceValueDifference of ah and 3h should be -2", () => {
        expect(deck.FaceValueDifference("ah","3h")).toBe(-2);
    });
    test("FaceValueDifference of ah and ad should be 0", () => {
        expect(deck.FaceValueDifference("ah","ad")).toBe(0);
    });
    // tests for ColorMatch
    test("ColorMatch of ah and ad should be true", () => {
        expect(deck.ColorMatch("ah","ad")).toBe(true);
    });
    test("ColorMatch of ah and 10c should be false", () => {
        expect(deck.ColorMatch("ah","10c")).toBe(false);
    });
    // tests for HasSameSuite
    test("HasSameSuite of ad and kd should be true", () => {
        expect(deck.HasSameSuite("ad","kd")).toBe(true);
    });
    test("HasSameSuite of 2h and 2c should be false", () => {
        expect(deck.HasSameSuite("2h","2c")).toBe(false);
    });
});
