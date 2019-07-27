# Blockly.Gamepad

- `Class`
- `Static`

> new Blockly.Gamepad ( options: `Object` )

## options

| Name | Description |
| --- | --- |
| `workspace` | Type: `Blockly.Workspace`<br>Default: `Blockly.getMainWorkspace()`<br><br>The workspace of the game |
| `start` | Type: `Boolean`<br>Default: `false`<br><br>If true the workspace is managed with a start block<br>The start block will be automatically generated, its Type is `Blockly.Gamepad['BLOCKS']['START']` |
| `magicJson` | Type: `Boolean`<br>Default: `false`<br><br>If the gamepad manage a magic json, see the [documentation](magicjson) |
| `customHighlights` | Type: `Boolean`<br>Default: `null`<br><br> Use standard or custom block highlight|


## Methods

| Mathod | Description |
| --- | --- |
| [setGame](gamepad?id=setGame) | Set the method to manage the **requests** |
| - | - |
| [setToolbox](gamepad?id=setToolbox) | Update the **toolbox** |
| - | - |
| [load](gamepad?id=load) | Load and run the **code** |
| [reset](gamepad?id=reset) | Reset the **workspace** and end the **code** |
| - | - |
| [play](gamepad?id=play) | Start the flow of **requests** |
| [pause](gamepad?id=pause) | Pause the flow of **requests** |
| [togglePlay](gamepad?id=togglePlay) | Start/Pause the flow of **requests** |
| [debug](gamepad?id=debug) | Set a **breakpoint** and load the requests until the breakpoint is reached. |
| - | - |
| [forward](gamepad?id=forward) | Generate a forward **request** |
| [backward](gamepad?id=backward) | Generate a backward **request** |
| - | - |
| [save](gamepad?id=save) | Save the workspace in the **localStorage** |
| [restore](gamepad?id=restore) | Restore the workspace in the **localStorage** |
| - | - |
| [version](gamepad?id=version) | Get the gamepad version |

### setGame

> setGame ( thisArg: `Object`, method: `Function` ): `null`

Set the method to manage the requests.

| Name | Description |
| --- | --- |
| `thisArg` | Type: `Object`<br>Default: `null`<br><br>The value of **this** provided for the call to **method** |
| `method` | Type: `Function`<br>must be: `not null`<br><br>The function to manage the **requests**|

```javascript
class Game{
    menageRequests(request, back){
        //do something
    }
}

let game = new Game()
let gamepad = new Blockly.Gamepad()

gamepad.setGame(game, game.manageRequests)
```

### setToolbox

> setToolbox ( options: `Object` ): `null`

Update the toolbox, you can choose the blocks to visualize. Categories with no block to visualize will be hidden.

#### options

| Name | Description |
| --- | --- |
| `all` | Type: `Boolean`<br>Default: `false`<br><br>If **true** load the full toolbox |
| `blocks` | Type: `Array`<br>Default: `null`<br><br>Array of the **blocks** to show in the toolbox<br>The array must contain the Type of each block |
| `procedure` | Type: `Boolean`<br>Default: `true`<br><br>If **false** hide the `PROCEDURE` category |
| `variable` | Type: `Boolean`<br>Default: `true`<br><br>If **false** hide the `VARIABLE` category |

```javascript
gamepad.setToolbox({
    blocks: [
        'move_up',
        'move_down'
        ...
    ]
})
```

### load

> load ( levels: `Integer` ): `null`

Load and run the code. After loading the code you can play the game. The **old code** is ended and the **gamepad.levels** resetted. 

| Name | Description |
| --- | --- |
| `levels` | Type: `Integer`<br>Default: `1`<br><br>The number of levels of your game |

```javascript
game.nLevels = 3; //number of levels

gamepad.load(game.nLevels);
```

### reset

> reset (): `null`

Reset the workspace, the code and the gamepad.levels.

### play

> play (back: `Boolean`): `null`

| Name | Description |
| --- | --- |
| `back` | Type: `Boolean`<br><br>If true the game is played in reverse |

Start the flow of requests, all the requests setted manually with the `forward` / `backward` methods are deleted.

### pause

> pause (): `null`

Pause the flow of requests, all the requests setted manually with the `forward` / `backward` methods are deleted.

### togglePlay

> togglePlay (): `null`

Start / pause the flow of requests, all the requests setted manually with the `forward` / `backward` methods are deleted.

### debug

> debug (id: `String`, back: `Boolean`): `Promise`

| Name | Description |
| --- | --- |
| `id` | Type: `Boolean`<br><br>The id of the block used as **breakpoint** |
| `back` | Type: `Boolean`<br>Default: `false`<br><br>If true the debug is played in reverse |
| `return` | Type: `Promise`<br><br>Return a Promise that is solved with **true** if the breakpoint is reached or **false** if it is not reached or the game is paused |

Set a **breakpoint** and load the requests until the breakpoint is reached, the breakpoint is the block with the **id** passed in the args.

```javascript
// when a block is clicked it is used as a breakpoint for the debug
workspace.addChangeListener(event => {
    // click event?
    if(event.type == Blockly.Events.UI && event.element == 'click')
        gamepad.debug(event.blockId).then(
            reached => console.log('breakpoint has been reached? ' + reached)
        )
})
```

### forward

> forward (): `Promise`

Generate a forward **request**. The game is paused.

| Name | Description |
| --- | --- |
| `return` | Type: `Promise`<br><br>A promise that is solved when the generated **request** has been managed |

```javascript
async function(){
    await gamepad.forward()
}
```

### backward

> backward (): `Promise`

Generate a backward **request**. The game is paused.

| Name | Description |
| --- | --- |
| `return` | Type: `Promise`<br><br>A promise that is solved when the 

```javascript
async function(){
    await gamepad.backward()
}
```

### save

> save ( keyName: `String` ): `null`

Save the workspace in the **localStorage** with the given keyName.

| Name | Description |
| --- | --- |
| `keyName` | Type: `String`<br><br>The name of the key you want to create/update |

### restore

> restore ( keyName: `String` ): `null`

Restore the workspace frome the **localStorage** with the given keyName.

| Name | Description |
| --- | --- |
| `keyName` | Type: `String`<br><br>The name of the key you want to restore |

### version

> `static` version ( ): `String`

Return the gamepad version.

## Properties

| Property | Description |
| --- | --- |
| `level` | Type: `Object`|
| `levels` | Type: `Array`|
|  |  |
| `worker` | Type: `Blockly.Gamepad.Worker` |
| `blocklyManager` | Type: `Blockly.Gamepad.BlocklyManager` |
| `jsonManager` | Type: `Blockly.Gamepad.JsonManager` |