// This is the config file I used for my Jarolift TDRC-08W remote controller
module.exports = {
  server: {
    simulate: false
  },
  gpio: {
    prev: 26,
    next: 16,
    open: 19,
    stop: 21,
    close: 20
  },
  controller: {
    channels: 8,
    allowNext: false
  },
  // Pretty fast select button selection
  // I had to set a long durationRadioButton because the PI is far from my shutters
  timing: {
    durationSelectButton: 60,
    durationRadioButton: 600,
    sleepDuration: 30,
    realtime: {
      open: 27000,
      close: 27000,
      stop: 500
    }
  }
};
