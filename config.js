module.exports = {
  server: {
    port: 8086
  },
  // Set input
  gpio: {
    simulate: true, // For dev not a pi
    prev: 19,
    next: 26,
    open: 16,
    stop: 20,
    close: 21,
  },
  controller: {
    channels: 8,
    allowDec: true // Allow research of channel to the "left", to the "right"
  },
  // Time a button is pressed, sleep between each call
  timing: {
    durationSelectButton: 50,
    durationRadioButton: 200,
    sleepDuration: 100
  }
};
