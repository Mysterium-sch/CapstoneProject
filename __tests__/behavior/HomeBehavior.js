import React from 'react';
import {render} from '@testing-library/react-native';
import Home from '../../src/Home';

jest.mock('react-native-orientation-locker', () => {
    return { lockToPortrait: () => {} }
});

jest.mock('@react-native-async-storage/async-storage', () => {
    return { AsyncStorage: () => {}, getItem: () => {} }
});

jest.mock('@react-navigation/native', () => {
    return { useRoute: () => {} }
});

describe("Behavior Testing for Home Screen", () => {
    const { getByText } = render(<Home />);
    const solitaireButton = getByText("Solitaire");
    test("There should be a button labeled \"Solitaire\"", () => {
        expect(solitaireButton).toBeTruthy();
    });
    const chessButton = getByText("Chess");
    test("There should be a button labeled \"Chess\"", () => {
        expect(chessButton).toBeTruthy();
    });
    const checkersButton = getByText("Checkers");
    test("There should be a button labeled \"Checkers\"", () => {
        expect(checkersButton).toBeTruthy();
    });
    const storeButton = getByText("Store");
    test("There should be a button labeled \"Store\"", () => {
        expect(storeButton).toBeTruthy();
    });
    const settingsButton = getByText("Settings");
    test("There should be a button labeled \"Settings\"", () => {
        expect(settingsButton).toBeTruthy();
    });
});
