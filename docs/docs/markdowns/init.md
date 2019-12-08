## Initialize {docsify-ignore}

The gamepad needs to be initialized, these are the `options`.

```javascript
Blockly.Gamepad.init({
  toolbox,
  blocks,
  wrap,
  inputs
});
```

## Toolbox

The xml of the `Blockly` toolbox.

```javascript
Blockly.Gamepad.init({
  toolbox: document.getElementById("toolbox")
});
```

## Inputs

Some `Inputs` that the blocks can use. Inputs are stored in `Blockly.Gamepad['INPUTS']`.

```javascript
Blockly.Gamepad.init({
  inputs: {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3
  }
});
```

## Blocks

The list of all the Blockly `blocks`. See [here](blocks) the full options.

```javascript
Blockly.Gamepad.init({
    blocks: {
        'move_up': {
            method: 'MOVE',
            args: [{
                value: 'UP'
            }],
            json: {
                "message0": "Move up",
                ...
            }
        },
        'move_down': { ...
    }
})
```

## Wrap

Wrap a list of default blocks and allow them to generate requests. See more [here](https://paol-imi.github.io/blockly-gamepad/#/requests?id=wrap-the-default-blocks).

```javascript
Blockly.Gamepad.init({
  wrap: [
    // procedures
    'procedures_defnoreturn',
    'procedures_defreturn',
    'procedures_callreturn',
    'procedures_callnoreturn',
    // controls
    'controls_if',
    'controls_whileUntil',
    // logic
    'logic_boolean'
    ...
  ]
})
```
