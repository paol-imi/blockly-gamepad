# Link the game

Each Blockly block generte a request, to manage these requests the game has to be linked with the gamepad. In this example the `requests` are passed to the `manageRequests` method.

```javascript
class Game{
    menageRequests(request, back, old){
        // request are passed here
        // do something
        return result
    }
}

let game = new Game(),
    gamepad = new Blockly.Gamepad()

gamepad.setGame(game, game.manageRequests)
```

`Promises` are supported.

```javascript
class Game{
    async menageRequests(request, back, old){
        // do something
        return result
    }
}

// or

class Game{
    menageRequests(request, back, old){
        return new Promise(resolve => {
            // do something
            resolve(result)
        })
    }
}
```