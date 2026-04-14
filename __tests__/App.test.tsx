/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('../src/navigation/AppNavigator', () => {
  const { createElement } = require('react');
  const { View } = require('react-native');

  const MockAppNavigator = () => createElement(View);

  return MockAppNavigator;
});

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
