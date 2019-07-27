// ATTENTION! ⚠️    
//
// In the code below some Gamepad utils and classes are used (like Gamepad.Asynchronizer). 
// These classes can be usefull but aren't fundamental to the construction of the game.
// I suggest you first to read the remaining part of this code demo and then return here.
//
// You can find the full documentation in the official site.


/* --- Gui manager --- */
//
// this class:
//  - is used by the game to manage the GUI
class Gui {
    constructor() {
        // the asynchronizer class is usefull to kill the animation when the game is resetted 
        //
        // when the asynchronizer.run() function is called a new instance of the GUI is created,
        // that instance is in asynchronizer.async
        //
        // when the asynchronizer.reset() function is called the old instance of the GUI is killed 
        // and can no longer interact with the sprite's (it will be garbage collected)
        this.asynchronizer = new Blockly.Gamepad.Asynchronizer(
            // class
            GUI,
            // run function
            function (id) {
                // this === asynchronizer.async  (new GUI())

                // set the sprite
                this.rect = document.getElementById("clipRect" + id)
                this.pegman = document.getElementById("pegman" + id)

                // set the sprite position
                this.rect.setAttribute('x', guiData.start[id - 1].rect.x)
                this.rect.setAttribute('y', guiData.start[id - 1].rect.y)
                this.pegman.setAttribute('x', guiData.start[id - 1].pegman.x)
                this.pegman.setAttribute('y', guiData.start[id - 1].pegman.y)
            },
            // reset function
            function () {
                // this === asynchronizer.sync
                // nothing to do here
            })
    }

    /* --- Gui handlers --- */

    // load a level
    load(id) {
        // if a new id is passed the old one is updated
        // otherwise the old one is used
        id ? this.id = id : id = this.id

        // kill the old GUI instance
        this.asynchronizer.reset()
        // generate a new GUI instance
        this.asynchronizer.run(id)

        // show/hide the game background
        document.getElementById("1").style.display = this.id == 1 ? 'block' : 'none'
        document.getElementById("2").style.display = this.id == 2 ? 'block' : 'none'
    }

    // remove animation
    removeAnimation() {
        // ac is the currect instance of the GUI
        let ac = this.asynchronizer.async, tid

        // if the user click the forward/backward buttons 2 or more times within 
        // 'clickTime' milliseconds of each other the animation will not show
        ac.tid = tid = setTimeout(() => ac.animate = ac.tid === tid, guiData.clickTime)
    }

    // manage the requests
    manageRequest(request, back) {
        // ac is the currect instance of the GUI
        let ac = this.asynchronizer.async

        // call the methods of the async properties
        if (['TURN', 'MOVE'].includes(request.method))
            // update the gui
            return ac[request.method].apply(ac, [back].concat(request.data))
        else
            // wait a lot of time
            return ac.someTime(true)
    }
}

/* --- Gui class --- */
//
// this class:
//  - manage the animations of the sprite
class GUI {
    constructor() {
        // if the animation has to be loaded
        this.animate = true
    }

    // return a promise that is solved after some time
    someTime(lotOfTime) {
        // if animate is set to false the time is 0
        // otherwise the time can be guiData.lotOfTime or guiData.time
        return new Promise(resolve => {
            setTimeout(resolve, this.animate ? lotOfTime ? guiData.lotOfTime : guiData.time : 0)
        })
    }

    /* --- GUI utils --- */

    // turn the pegman of a frame 
    turn(clockwise) {
        // the rotation offset
        let off = guiData.rotateOff * (clockwise ? -1 : 1),
            // sprite viewport data
            val = parseInt(this.rect.getAttribute('x')),
            x = parseInt(this.pegman.getAttribute('x')) + off

        // adjust the sprite viewport
        if (x > val) x = val - guiData.max
        else if (x < val - guiData.max) x = val

        // update the spites viewport
        this.pegman.setAttribute('x', x)
    }

    // move the pegman of a frame
    move(forward, direction, slap) {
        // the move offset
        let off = guiData.moveOff * (forward ? 1 : -1) * (slap ? 0.4 : 1),
            // the sprite coordinates
            xP = parseInt(this.pegman.getAttribute('x')),
            yP = parseInt(this.pegman.getAttribute('y')),
            xR = parseInt(this.rect.getAttribute('x')),
            yR = parseInt(this.rect.getAttribute('y')),
            // the position offset
            position = [{
                // UP
                x: 0,
                y: -off
            },
            {
                //RIGHT
                x: off,
                y: 0
            },
            {
                //DOWN
                x: 0,
                y: off
            },
            {
                //LEFT
                x: -off,
                y: 0
            }
            ][direction]

        // update the coordinates
        this.pegman.setAttribute('x', position.x + xP)
        this.pegman.setAttribute('y', position.y + yP)
        this.rect.setAttribute('x', position.x + xR)
        this.rect.setAttribute('y', position.y + yR)
    }

    /* --- GUI methods --- */

    // turn the pegman
    TURN(back, clockwise) {
        return new Promise(async resolve => {
            // for each frame
            for (let i = 0; i < guiData.rotateFrames; i++) {
                // turn the pegman of a frame
                this.turn(back ? !clockwise : clockwise)
                // await some time
                await this.someTime()
            }

            resolve()
        })
    }
    // move the pegman
    MOVE(back, hasMoved, direction) {
        return new Promise(async resolve => {
            // if the pegman has not moved show the crash animation
            if (hasMoved) {
                // for each frame
                for (let i = 0; i < guiData.moveFrames; i++) {
                    // move the pegman of a frame
                    this.move(!back, direction)
                    // await some time
                    await this.someTime()
                }
            } else {
                // first half of the crush animation
                this.move(!back, direction, true)

                // await some time
                await this.someTime()

                // second half of the crush animation
                this.move(back, direction, true)

                // await some time
                await this.someTime()
            }

            resolve()
        })
    }
}

/* --- GUI data --- */
//
// some data
const guiData = {
    // animation frame time
    time: 100,
    // time to wait
    lotOfTime: 350,
    // user click max time offset
    clickTime: 350,
    // single frame move offset
    moveOff: 10,
    // move frames
    moveFrames: 5,
    // single frame rotate offset
    rotateOff: 49,
    // rotate frames
    rotateFrames: 4,
    // max length
    max: 735,
    // sprite viewports on start
    start: [{
        pegman: {
            x: -95,
            y: 191
        },
        rect: {
            x: 101,
            y: 191
        }
    },
    {
        pegman: {
            x: -145,
            y: 291
        },
        rect: {
            x: 51,
            y: 291
        }
    }
    ]
}