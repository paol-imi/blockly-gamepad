## Initialize

Include all the `Blockly` libraries and the `gamepad` library. Make sure to include the [javascript](https://developers.google.com/blockly/guides/configure/web/code-generators) code generator.

```html
<script src="js/blockly/blockly_compressed.js"></script>
<script src="js/blockly/blocks_compressed.js"></script>
<script src="js/blockly/javascript_compressed.js"></script>
<script src="js/blockly/en.js"></script>

<script src="js/gamepad.min.js"></script>
```

Also avaible via CDN.

```html
<!-- ...blockly libraries -->
<script src="https://unpkg.com/blockly-gamepad"></script>
```

### CommonJS

The package is also avaible on npm.

```
mpn install blockly blockly-gamepad
```

Make sure to include the [javascript](https://developers.google.com/blockly/guides/configure/web/code-generators) code generator.

```javascript
const Blockly = require('blockly')
require('blockly/blocks')
require('blockly/javascript')

const Gamepad = require('blockly-gamepad')
```

## Create the Gamepad

Once the libraries are included you can initialize the gamepad and the workspace, then you can create a `Blockly.Gamepad` instance. For the injection see the Blockly [documentation](https://developers.google.com/blockly/guides/get-started/web#injecting_blockly).


```javascript
let toolbox = document.getElementById('toolbox')

// init the Gamepad
Blockly.Gamepad.init({
    toolbox,
    blocks
})

// create the workspace
Blockly.inject('blocklyDiv', {
    toolbox
})

// the gamepad is ready to use
let gamepad = new Blockly.Gamepad()
```

## Link your game

Once the `gamepad` is created it can be linked with the `game`.

```javascript
let gamepad = new Blockly.Gamepad(),
    myGame = new MyGame()

// set the link
gamepad.setGame(myGame, myGame.manageRequets)

// play the game
gamepad.load()
gamepad.play()
```