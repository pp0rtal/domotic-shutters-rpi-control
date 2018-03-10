# Pi remote shutter controller interface
This NodeJS server is a hack to control your home shutters with a real remote controller, compatible with Raspberry GPIO outputs.
Some manufacturers does not allow you to control you shutters via your own RF antenna and a Raspberry.

If you are totally stuck when pairing your remote control because of an unkown hardware encryption, 
so you may be forced to emulate hardware buttons and transform your control as a dedicated antenna.

### How to run

- Install `nodejs` and `npm` on your Raspberry.

- Set up your configuation in `config.js`

- Run the program

```javascript
npm install
npm start
```

To set this program as a daemon you have to start it as a service, you can use `supervisord` for this.


## Open / close / stop one or several shutter
Use those function using the following url

To open rolling shutter on channel 1:
```javascript
http://localhost:8086/1/open
```

To stop the shutter on channel 1 and 2:
```javascript
http://localhost:8086/1,2/stop
```

To close half way all your shutters above 4:
```javascript
http://localhost:8086/1,2,3,4/-50%
```

To open a little bit more (10%) your shutter 1 
```javascript
http://localhost:8086/1/+10%
```



## Channel configuration
If you have a controller with multiple channels, it is necessary to link **at least one button** on the Raspberry:
- the next channel (`next` button) to increment channel pointer
- the previous channel (`prev` button) to decrement channel pointer

The prev button is optional and depends of your controller, set `config.gpio.prev: false` to disable to prev button.

If you have a simple remote command, set `config.controller.channels: 1` and always call the unique channel 1.


## Example of hacked remote controller
I fit this program to control a **Jarolift `TDRC-08W`** (8 channels), for which I solded wires and connected them to an easy breadboard, 
switch buttons are now also compatible with:

Every buttons need two wires, and are connected to an **optocoupler**.
The optocoupler is linked from the GPIO to the ground of the Raspberry

![breadbord](./docs/breadbord.jpg)

![assembly](./docs/assembly.jpg)

You can use the GPIO of the Raspberry you want:
![assembly](./docs/Raspberry-Pi-GPIO.png)
