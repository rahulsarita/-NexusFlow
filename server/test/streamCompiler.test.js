const test = require('node:test');
const assert = require('node:assert/strict');

const { matchesThreshold, renderTemplate } = require('../src/services/streamCompiler');

test('matchesThreshold supports the configured comparison operators', () => {
  assert.equal(matchesThreshold(90, 80, '>'), true);
  assert.equal(matchesThreshold(80, 80, '>='), true);
  assert.equal(matchesThreshold(70, 80, '<'), true);
  assert.equal(matchesThreshold(80, 80, '=='), true);
  assert.equal(matchesThreshold(90, 80, '!='), true);
  assert.equal(matchesThreshold(90, 80, '<'), false);
  assert.equal(matchesThreshold(70, 80, '>'), false);
});

test('renderTemplate fills alert placeholders with runtime values', () => {
  const message = renderTemplate('Alert: {deviceId} value {value} exceeded {threshold}', {
    deviceId: 'turbine-1',
    value: 82.5,
    threshold: 80,
  });

  assert.equal(message, 'Alert: turbine-1 value 82.5 exceeded 80');
});
