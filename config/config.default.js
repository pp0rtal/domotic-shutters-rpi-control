// Don't edit this file directly, override what you need in config/config.js
module.exports = {
  server: {
    port: 8086,
    hostname: 'localhost', // Set false to allow any IP
    simulate: true, // For dev purpose if your env crashes
    gpioBCM: true, // true to user GPIO num, or false to user PI pins number
    idle: 30 // Seconds before reset on channel 1, false to disable
  },
  // Set input
  gpio: {
    prev: 19,
    next: 26,
    open: 21,
    stop: 20,
    close: 16
  },
  controller: {
    channels: 4,
    allowPrev: true,
    allowNext: true
  },
  // Press button duration
  timing: {
    durationSelectButton: 100,
    durationRadioButton: 500,
    sleepDuration: 50,
    // Average open / close duration of your shutters
    realtime: {
      open: 30000,
      close: 30000,
      stop: 500
    }
  }
};
