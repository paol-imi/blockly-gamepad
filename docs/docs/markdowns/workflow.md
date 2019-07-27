## Requests model

Each block generate a `request` like that.

```javascript
{ method: 'MOVE', args: ['UP'] }
```

Each time a request is generated it is passed to the game.

```javascript
class Game {
  manageRequests(request) {
    // requests are passed here
  }
}

let game = new Game(),
    gamepad = new Blockly.Gamepad();

gamepad.setGame(game, game.manageRequests);
```

?> A request is generated only when the previous one has been managed.

## Workflow concept

When the `load` method is called the blocks start to generate the requests.

```javascript
gamepad.load();
```

A `workflow` is a set of requests with a beginning and an end, that represent a `level` of your game. A game can have more workflows (levels).

## Workflow structure

The first request of each workflow has the `'STARTED'` state and the last one has the `'FINISHED'` state.

```javascript
{ method: Blockly.Gamepad['STATES']['STARTED'] }

    { method: 'MOVE', args: ['UP'] }
    { method: 'TURN', args: ['LEFT'] }
    // other requests from the blocks...

{ method: Blockly.Gamepad['STATES']['FINISHED'] }
```

If the game has more levels, the same `workflow` can be reused for each level. In this case a request with the `'COMPLETED'` state is passed in the end.

```javascript
let levels = 3; // number of levels

gamepad.load(levels);
```

```javascript
{ method: Blockly.Gamepad['STATES']['STARTED'] }
    ...
{ method: Blockly.Gamepad['STATES']['FINISHED'] }
// end of the first level, you can load the second one


{ method: Blockly.Gamepad['STATES']['STARTED'] }
    ...
{ method: Blockly.Gamepad['STATES']['FINISHED'] }
// end of the second level, you can load the third one


{ method: Blockly.Gamepad['STATES']['STARTED'] }
    ...
{ method: Blockly.Gamepad['STATES']['FINISHED'] }
// end of the game


{ method: Blockly.Gamepad['STATES']['COMPLETED'] }
// the 'COMPLETED' request is passed only if there are more levels
```
And in the game.

```javascript
class Game {
    manageRequests(request){
        if(request.method === Blockly.Gamepad['STATES']['STARTED'])
            load_next_level()
    }
}   
```

!> Note that each workflow will have different internal requests based on your management. See how you can interact with the workflow in the next [chapter](/workflow?id=interact-with-the-workflow)

## Moving through the workflow

If the `play()` method is called the requests will be automatically generated each time the last one has been managed, if the `forward()` or the `backward()` methods are called a single request will be generated.

```javascript
let gamepad = new Blockly.Gamepad()
gamepad.load()
...

gamepad.play()
gamepad.pause()
    // or
gamepad.forward()
gamepad.backward()
```
## Zoom-in 🔍

This is what happens in the `workflow`.

```javascript
...
// -- you are here
{ method: 'MOVE', args: ['UP'] }
{ method: 'TURN', args: ['LEFT'] }
...
```

```javascript
gamepad.forward()
```

```javascript
...
{ method: 'MOVE', args: ['UP'] }
// -- now you are here
{ method: 'TURN', args: ['LEFT'] }
...
```
```javascript
gamepad.backward()
```

```javascript
...
// -- now you are here
{ method: 'MOVE', args: ['UP'] }
{ method: 'TURN', args: ['LEFT'] }
...
```

If the `backward()` method is called an argument back is passed to the manager function with the value `true`.

```javascript
manageRequests(request, back){
    if (back){
        // this is a back request
    }
}
```

If the request has already been passed an argument `old` is passed to the manager function with the value `true` (the backward requests are old for definition).

```javascript
manageRequests(request, back, old){
    if(old){
        // the request is old
    }
}
```

!> the `backward()` and the `forward()` methods are asynchronous.

```javascript
async function(){
    await gamepad.forward()
    await gamepad.backward() 
}
```

## Interact with the workflow

It's possible to interact with the workflow through the `return` object of the manager function. These are all the `options`.

### Return

The `return` value of the block.

```javascript
manageRequests(request){
    return {
        return: true // "output": "Boolean"
    }
}
```

The block will be designed like this.

```javascript
'arrived': {
    method: 'ARRIVED',
    json: {
        "message0": "arrived at destination?",
        // this block will return the "return" value: true
        "output": "Boolean" 
    }
    ...
}
```

### Finished

If the level is `finished`.

```javascript
manageRequests(request){
    // request: { method: 'MOVE', args: ['UP'] }
    return {
        finished: true
    }
}
```

The requests are killed until the `'FINISHED'` state, the workflow is now terminated.

```javascript
{ method: Blockly.Gamepad['STATES']['STARTED'] }

    { method: 'MOVE', args: ['UP'] }
    /*
        the requests are killed 
        until the next finished state

    { method: 'TURN', args: ['LEFT'] }
    { method: 'MOVE', args: ['DOWN'] }
    ...
    */

{ method: Blockly.Gamepad['STATES']['FINISHED'] }
```
!> The current request is now the one with the `'FINISHED'` state and it is `NOT` passed to the game.

It's also possible to create a `block` that end the level.

```javascript
Blockly.Gamepad.init({
    blocks: {
        'finished': {
            // 'FINISHED' state
            method: Blockly.Gamepad['STATES']['FINISHED'], 
            json: {
                "message0": "End the level",
                ...
            }
        }
    }
})
```

### Completed

If the game is `completed` (all the levels are `finished`).

```javascript
manageRequests(request){
    // request: { method: 'MOVE', args: ['UP'] }
    return {
        completed: true
    }
}
```
All the requests are killed until the `'COMPLETED'` state, all the `workflows` are terminated.

```javascript
{ method: Blockly.Gamepad['STATES']['STARTED'] }

    { method: 'MOVE', args: ['UP'] }
/*
    all the other requests are killed

{ method: Blockly.Gamepad['STATES']['FINISHED'] }


{ method: Blockly.Gamepad['STATES']['STARTED'] }
    ...
{ method: Blockly.Gamepad['STATES']['FINISHED'] }
*/

{ method: Blockly.Gamepad['STATES']['COMPLETED'] }
```
!> The current request is now the one with the `'COMPLETED'` state and it is `NOT` passed to the game.

It's also possible to create a `block` that end all the levels.

```javascript
Blockly.Gamepad.init({
    blocks: {
        'completed': {
            // 'COMPLETED' state
            method: Blockly.Gamepad['STATES']['FINISHED'], 
            ...
        }
    }
})
```

!> You can interact with a request only if it's the `first time` that request is executed (if it's not old).

## Decorate the request

You can add `data` to the request.

```javascript
manageRequests(request, back){
    if(!request.data){
        request.data = { foo: 'bar' }
    } else {
        console.log(
            request.data.foo,
            back ? 'back' : ''
        )
    }
}
```
This is what will be logged.

```javascript
gamepad.forward()
gamepad.backward() 
> "bar"
> "back"
gamepad.forward() 
> "bar"
```
## Zoom-in 🔍 {docsify-ignore}

This is what happens in the `workflow`.

```javascript
...
// -- you are here
{ method: 'MOVE', args: ['UP'] }
...
```

```javascript
gamepad.forward()
```

```javascript
...
{ method: 'MOVE', args: ['UP'], data: { 'foo': 'bar' } }
// -- now you are here
...
```

```javascript
gamepad.backward() 
> "bar"
> "back"
```

```javascript
...
// -- now you are here
{ method: 'MOVE', args: ['UP'], data: { 'foo': 'bar' } }
...
```