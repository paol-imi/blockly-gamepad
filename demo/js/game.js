/* Game class */

// this class:
//  - manage the requests
//  - update the game (json)
//  - manage the gui
//  - load the levels
class Game {
    // the gamepad is passed to the contructor
    constructor(gamepad) {
        // link the game
        gamepad.setGame(this, this.manageRequest)

        this.gamepad = gamepad
        // create the gui
        this.gui = new Gui()
    }

    // all the requests are passed to this function
    manageRequest(request, back, old) {
        // log the request
        console.group()
            console.info('request:      ', request)
            console.info('request type: ', back ? 'backward' : 'forward')
            console.info('request age:  ', old ? 'old' : 'new')
        console.groupEnd()


        let result, promise

        // if a method is called and the request is not old the game is updated
        //
        // using the 'magicJson' options the json need to be changed only the first
        // time the request is passed to this function
        //
        // if the request is old the json will be auto update before the request is passed
        // to this function 
        //
        // infact, in the methods's handlers below, the 'back' argument is not passed 
        // and there's no code to remove the changes of the json on back requests
        if (['PATH', 'REPEAT', 'TURN', 'MOVE'].includes(request.method) && !old)
            // update the game
            result = this[request.method].apply(this, [].concat(request.args, request))
          
        // check the game status
        this.checkGameStatus(request, back)

        // update the gui
        promise = this.gui.manageRequest(request, back)
        // you can use a promise
        return promise.then(() => result)
    }

    // load a level
    loadLevel(level) {
        // update maxBlocks setting
        if ('maxBlocks' in level)
            // if the start block is used add 1
            Blockly.getMainWorkspace().options.maxBlocks = level.maxBlocks + (start ? 1 : 0)
        else
            // no max
            Blockly.getMainWorkspace().options.maxBlocks = Infinity

        // update the toolbox
        if ('blocks' in level)
            // load some blocks/categories from the xml
            this.gamepad.setToolbox({
                blocks: level.blocks
            })
        else
            // load all the blocks/categories from the xml
            this.gamepad.setToolbox({
                all: true
            })

        // update the magicJson
        this.gamepad.json = level.game

        // load the gui
        this.gui.load(level.id)
        // reset the workspace and kill the requests of the previous game if it wasn't finished
        this.gamepad.reset()
        // restore the old code
        this.gamepad.restore('' + (level.id - 1) + start)
    }

    // load the code
    loadCode() {
        // load the code, the json is resetted
        this.gamepad.load()
        // save the code in localStorage
        this.gamepad.save('' + level + start)
        // reset the gui
        this.gui.reset()
        // load first START request
        this.gamepad.forward()
    }

    /* Game utils */

    // check the game status
    checkGameStatus(request, back) {
        let pegman = this.gamepad.json.pegman,
            marker = this.gamepad.json.marker

        // if the game is finished show win/lose alert
        if (request.method == Blockly.Gamepad['STATES']['FINISHED'] && !back) {
            if (pegman.x == marker.x && pegman.y == marker.y)
                alert('you win!')
            else
                alert('you lose!')
        }
    }

    // get the { x, y } offset of the next position
    // from a given direction
    getNextPosition(direction) {
        // the direction is one of these inputs
        //
        // Blockly.Gamepad['INPUTS'] = {
        //    'FORWARD': '0',
        //    'RIGHT': '1',
        //    'BACKWARD': '2',
        //    'LEFT': '3'
        //}

        return [{
                // UP
                x: 0,
                y: 1
            },
            {
                //RIGHT
                x: 1,
                y: 0
            },
            {
                //DOWN
                x: 0,
                y: -1
            },
            {
                //LEFT
                x: -1,
                y: 0
            }
        ][direction]
    }

    // check if the pegman can update its position
    // from the given offset
    canMove(path, pegman, position) {
        let x = pegman.x + position.x,
            y = pegman.y + position.y

        // check if the path exist
        return path.find(element => element[0] == x && element[1] == y) != undefined
    }

    /* Game methods */

    // with the 'magicJson' options these methods will be called only if the
    // request is not old
    //
    // infact in these methods there's no code to change the json on back requests
    // because it will be auto updated on all the old requests

    // 'repeat until' method
    REPEAT() {
        let pegman = this.gamepad.json.pegman,
            marker = this.gamepad.json.marker

        // the return: value
        // if true the cycle continues, otherwise it stops
        // while ( value ) {...}
        return {
            return: pegman.x != marker.x || pegman.y != marker.y
        }
    }

    // 'if path' methods
    PATH(direction) {
        let path = this.gamepad.json.path,
            pegman = this.gamepad.json.pegman,
            // because of the directions's values range from 0 to 3
            // it's possible to use the direction as an offset and then use the modulus 
            // (direction is a string so it's parsed)
            // 
            // Blockly.Gamepad['INPUTS'] = {
            //    'FORWARD': '0',
            //    'RIGHT': '1',
            //    'BACKWARD': '2',
            //    'LEFT': '3'
            //}
            position = this.getNextPosition((pegman.direction + parseInt(direction)) % 4)

        // the return: value
        // if ( value ) {...} else {...}
        return {
            return: this.canMove(path, pegman, position)
        }
    }

    // 'move forward' method
    MOVE(request) {
        let path = this.gamepad.json.path,
            pegman = this.gamepad.json.pegman,
            position = this.getNextPosition(pegman.direction),
            canMove = this.canMove(path, pegman, position)

        // if the pegman can move the position is updated
        if (canMove) {
            pegman.x += position.x
            pegman.y += position.y
        } 

        // decorate the request with some data
        // this data will be used in the gui
        request.data = [
            // if the pegman has moved
            canMove,
            // the direction of the pegman
            pegman.direction
        ]
    }

    // 'turn' method
    TURN(direction, request) {
        // because of the directions's values range from 0 to 3
        // it's possible to increment/decrement the value and then use the modulus 
        // 
        // Blockly.Gamepad['INPUTS'] = {
        //    'FORWARD': '0',
        //    'RIGHT': '1',
        //    'BACKWARD': '2',
        //    'LEFT': '3'
        //}
        if (direction == Blockly.Gamepad['INPUTS']['RIGHT'])
            // increment to rotate clockiwse
            this.gamepad.json.pegman.direction += 1

        if (direction == Blockly.Gamepad['INPUTS']['LEFT'])
            // decrement to rotate clockwise
            // 4 is added to ensure the direction is greater then 0
            this.gamepad.json.pegman.direction += -1 + 4

        // use the modulus
        this.gamepad.json.pegman.direction %= 4
        
        // decorate the request with some data
        // the data will be used in the gui
        request.data = [
            // if the rotation is clockwise
            direction == Blockly.Gamepad['INPUTS']['RIGHT']
        ]
    }
}