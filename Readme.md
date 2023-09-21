# Ye Old Games

Our app will be a multi game app.

The game will consists of checkers, chess, and solitaire. Users can play Solitaire indivdiually and play checkers and chess using local multiplayer. Users can earn points from playing to purchase other games. The game will have a retro neon color scheme and have a similar style to 8-bit. This game is for all users who enjoy the classics and want a short quick and easy game.

## External Requirements

In order to build this project you first have to install:

* [Node.js](https://nodejs.org/en/) (npm is included when node.js is installed)
* [Android Studio Dolphin (2021.3.1) ](https://developer.android.com/studio)
* [WatchMan](https://facebook.github.io/watchman)
* [Java Development Kit (JDK) < 19](https://www.oracle.com/java/technologies/downloads/archive/)

## Setup

To get build files:
Once code is cloned, run `npm install` in the repo directory and that will create the build files. Then the user should be able to run the commands in the running section to build the app.

1. Clone the repo
2. Run `npm install --legacy-peer-deps` in the repo root directory
3. Run `npm install chess.js --legacy-peer-deps` and `npm install prop-types --save --legacy-peer-deps`

## Running

After launching the Android Studio emulator run these commands in a terminal window with elevated permissions.
1. npx react-native start
2. npx react-native run-android

# Testing

The unit tests are in `__tests__/unit/`.

The behavioral tests are in `__tests__/behavior/`.

## Testing Technology

The unit testing uses the Jest framework, which is very lightweight and included by default in the React-Native installation. The behavior testing uses Jest, but it also uses the React Native Testing Library and the package to support Jest with RNTL.

1. `npm install --save-dev --legacy-peer-deps @testing-library/react-native`
2. `npm install --save-dev --legacy-peer-deps @testing-library/jest-native`

See guide: https://testing-library.com/docs/react-native-testing-library/intro

## Running Tests

Run `npm test` from the project's root directory.

Optionally, add the verbose flag `npm test -- --verbose=true` for more information.

# Authors

* Jenna Kramer: jennakramer9@gmail.com
* Lilian Lamb: lamblily90@gmail.com
* Vijay Tripathi: email@vijaytripathi.com
* Max Strickland: mcs30@email.sc.edu
* Ross Vicario: rossvicario@gmail.com
