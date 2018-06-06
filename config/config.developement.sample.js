module.exports = {
  server: {
    port: 8086,
    simulate: true
  },
  controller: {
    channels: 16
  },
  timing: {
    durationSelectButton: 200,
    durationRadioButton: 1000,
    sleepDuration: 200,
    realtime: {
      open: 5000,
      close: 5000,
      stop: 500
    }
  }
};
