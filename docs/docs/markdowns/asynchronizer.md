## Asynchronizer {docsify-ignore}

> new Blockly.Gamepad.Asynchronizer ( sync: `Object` | `Class`, onRun: `function`, onReset: `function` )

## Working with objects

let's see this `example`.

```javascript
let obj = {
  foo: 'bar'
}

let asynchronizer = new Blockly.Gamepad.Asynchronizer(obj)
```

The object is stored in `asynchronizer.sync`.

```javascript
console.log(asynchronizer.sync)
// output
> { foo: 'bar' }
```

Calling `asynchronizer.run()` will clone the properties of the `.sync` object in a new object. The new object is stored in `asynchronizer.async`.

```javascript
asynchronizer.run()

console.log(asynchronizer.async)
// output
> { foo: 'bar' }
```

`.sync` and `.async` are `different` objects.
```javascript
asynchronizer.async.foo = 'a new value'

console.log(asynchronizer.sync.foo)
// output
> 'bar'
```

Calling `asynchronizer.reset()` will make `insaccessible ` the properties of the current `.async` object.<br>
Now trying to `access` a property of the `.async` object will throw an `error` (Blockly.Gamepad.ERRORS.CLOSED).

The old object can be garbage collected when asynchronizer.run() is called again.

```javascript
console.log(asynchronizer.async.foo)
// error
> "❌ Uncaught closed"
```

Properties can't be accessed even using the `this` keyword. Here's an example.

```javascript
let bomb = {
  message: 'boooom!',
  detonate: function(){
    // show the message after some time
    setTimeout(() => console.log(this.message), 10000)
  }
}

let asynchronizer = new Blockly.Gamepad.Asynchronizer(bomb)
```
And now... 

```javascript
asynchronizer.run() // generate the .async object
asynchronizer.async.detonate() // start the countdown
asynchronizer.reset() // reset the asynchronizer


// after some time...


// log an error and not the message
> "❌ Uncaught closed"
```

The current code logged an error because the detonate method was trying to `access` the `this.message` but all the properties were no longer accessible. 

The error is a simple `string` and has no description because if it is thrown it only means that the instance is no longer usable.

## Working with classes

It's possible to use `classes`. Here's an example.

```javascript
class Bomb {
  message = 'boooom!'

  detonate(){
    // show the message after some time
    setTimer(() => console.log(this.message), 10000)
  }
}

let asynchronizer = new Blockly.Gamepad.Asynchronizer(Bomb)
```

Calling `asynchronizer.run()` will create a `new instance` of the bomb class. The new instance is stored in `asynchronizer.async`.

```javascript
asynchronizer.run() // asynchronizer.async = new Bomb()
asynchronizer.async.detonate() // start the countdown
```
The class is stored in asynchronizer.sync. It' possible to pass some `arguments` to the Bomb constructor when it is instantiated using `asynchronizer.run()`, see how in the [chapter](https://paol-imi.github.io/blockly-gamepad/#/asynchronizer?id=run-function) below.

## Run function

It's possible to set a `onRun` function, that function will be called by the `asynchronizer.run()` method after the .async object is generated.

The `this` keyword refer to the `.async` object.

```javascript
let asynchronizer = new Blockly.Gamepad.Asynchronizer(
  // the class
  class Bomb {
    message = 'boooom!'

    detonate(){
      // show the message after some time
      setTimer(() => console.log(this.message), 10000)
    }
  },
  // onRun function
  function() {
    // this === asynchronizer.async

    // detonate the bomb with the asynchronizer.run() call
    this.detonate()
  }
)
```

It's possible to pass some `arguments`.

```javascript
let asynchronizer = new Blockly.Gamepad.Asynchronizer(
  // the class
  class Bomb { },
  // onRun function
  function(value) {
    // value => 'someValue'
  }
)

asynchronizer.run('someValue')
```

If a `Class` is used the arguments passed to the run function are also passed to the `constructor` of that class when it is instantiated in `.async`.

```javascript
let asynchronizer = new Blockly.Gamepad.Asynchronizer(
  // the class
  class Bomb { 
    constructor(value){
      // value => 'someValue'
    }
  },
  // onRun function
  function(value) {
    // value => 'someValue'
  }
)

asynchronizer.run('someValue')
```

Also the return value is passed.

```javascript
let asynchronizer = new Blockly.Gamepad.Asynchronizer(
  // the class
  class Bomb { },
  // onRun function
  function() {
    return 'someValue'
  }
)

console.log(asynchronizer.run())
// output
> 'someValue'
```

## Reset function

It's also possible to set a `onReset` function, that function will be called by the `asynchronizer.reset()` method. Also here it's possible to pass some arguments.

The `this` keyword refer to the `.sync` object.

```javascript
let asynchronizer = new Blockly.Gamepad.Asynchronizer(
  // the class
  class Bomb { },
  // onRun function
  function() { }.
  // onRset function
  function() {
    // this === asynchronizer.sync
  }
)
```

## Game example

Building a game with `blockly-gamepad` like [the-aviator](https://paol-imi.github.io/the-aviator) may require some management, more or less complicated, of the `asynchronous` part.

For example, if an `animation` is running and you need to reset the full game some problems may occur.

With the `Asynchronizer` you can solve these problems in a very simple way working with the `.async` object. Here's a simple example.

```javascript
let asynchronizer = new Blockly.Gamepad.Asynchronizer(
  {
    game: new Game(),
    loop: function() {
      // update the game
      this.game.update()

      // call 
      requestAnimationFrame(this.loop())
    }
  },
  // on run
  function() {
    // this === asynchronizer.async
    // start the loop of the .async
    this.loop()
  },
  // on reset
  function() {
    // this === asynchronizer.sync
    // the .async can no longer acces the game
    // that can be safely resetted in the .sync
    this.game.reset()
  }
)


function play(){
  // kill the old game and reset it
  asynchronizer.reset()
  // play the new game
  asynchronizer.run()
}
```

When the `asynchronizer.run()` is called the `loop` start.

When the `asynchronizer.reset()` is called the loop can no longer `access` the this properties, it will crash generating a `Blockly.Gamepad.ERRORS.CLOSED` error. The `animations` are no longer updated by the old instance. 

If you want to see a complete implementation of this class I suggest you to see the `full code` of this [demo](https://github.com/Paol-imi/blockly-gamepad/tree/master/docs/demo).