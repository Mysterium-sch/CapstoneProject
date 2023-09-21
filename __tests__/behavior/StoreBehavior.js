import React from 'react';
import {render} from '@testing-library/react-native';
import Store from '../../src/Store';

jest.mock('react-native-orientation-locker', () => {
    return { lockToPortrait: () => {} }
});

jest.mock('@react-native-async-storage/async-storage', () => {
    return { AsyncStorage: () => {}, getItem: () => {} }
});

jest.mock('@react-navigation/native', () => {
    return { useRoute: () => {} }
});

describe("Behavior Testing for Store Screen", () => {
    const { queryByText } = render(<Store />);
    const homeButton = queryByText("Home");
    test("There should be a button labeled \"Home\"", () => {
        expect(homeButton).toBeTruthy();
    });
    const chessButton = queryByText("Chess (250)");
    test("There should be a button labeled \"Chess (250)\"", () => {
        expect(chessButton).toBeTruthy();
    });
    const checkersButton = queryByText("Checkers (250)");
    test("There should be a button labeled \"Checkers (250)\"", () => {
        expect(checkersButton).toBeTruthy();
    });
    const settingsButton = queryByText("Settings");
    test("There should not be a button labeled \"Settings\"", () => {
        expect(settingsButton).not.toBeTruthy();
    });
});
