// ATTENTION! ⚠️    
//
// In the code below some Gamepad utils and classes are used (like Gamepad.Asynchronizer). 
// These classes can be usefull but aren't fundamental to the construction of the game.
// I suggest you first to read the remaining part of this code demo and then return here.
//
// You can find the full documentation in the official site.

/* Gui class */

// this class:
//  - manage the graphic part of the game
const Gui = function () {
    // the asynchronizer class is usefull to kill the animation when the game is resetted 
    const asyncM = new Blockly.Gamepad.Asynchronizer({
            // if the animation has to be loaded
            animate: true,
            // reset the game
            reset() {
                // restart the position of the pacman
                this.rect.setAttribute('x', guiData.start[this.id - 1].rect.x)
                this.rect.setAttribute('y', guiData.start[this.id - 1].rect.y)
                this.pegman.setAttribute('x', guiData.start[this.id - 1].pegman.x)
                this.pegman.setAttribute('y', guiData.start[this.id - 1].pegman.y)
            },
            // return a promise that is solved after some time
            someTime: function (lotOfTime) {
                // if animate is set to false the time is 0
                return new Promise(resolve => {
                    setTimeout(resolve, this.animate ? lotOfTime ? guiData.lotOfTime : guiData.time : 0)
                })
            },

            /* gui methods's helper */

            // turn the pegman of a frame 
            turn: function (clockwise) {
                let off = guiData.rotateOff * (clockwise ? -1 : 1),
                    val = parseInt(this.rect.getAttribute('x')),
                    x = parseInt(this.pegman.getAttribute('x')) + off

                if (x > val) x = val - guiData.max
                else if (x < val - guiData.max) x = val

                this.pegman.setAttribute('x', x)
            },
            // move the pegman of a frame
            move: function (forward, direction, slap) {
                let off = guiData.moveOff * (forward ? 1 : -1) * (slap ? 0.4 : 1),
                    xP = parseInt(this.pegman.getAttribute('x')),
                    yP = parseInt(this.pegman.getAttribute('y')),
                    xR = parseInt(this.rect.getAttribute('x')),
                    yR = parseInt(this.rect.getAttribute('y')),
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

                this.pegman.setAttribute('x', position.x + xP)
                this.pegman.setAttribute('y', position.y + yP)
                this.rect.setAttribute('x', position.x + xR)
                this.rect.setAttribute('y', position.y + yR)
            },

            /* gui methods */

            // turn the pegman
            TURN: function (back, clockwise) {
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
            },
            // move the pegman
            MOVE: function (back, hasMoved, direction) {
                return new Promise(async resolve => {
                    // if the pegman has not moved show the crash animation
                    if (!hasMoved) {
                        // first half of the crush animation
                        this.move(!back, direction, true)

                        // await some time
                        await this.someTime()
                        // second half of the crush animation
                        this.move(back, direction, true)

                        // await some time
                        await this.someTime()
                    } else {
                        // for each frame
                        for (let i = 0; i < guiData.moveFrames; i++) {
                            // move the pegman of a frame
                            this.move(!back, direction)
                            // await some time
                            await this.someTime()
                        }
                    }

                    resolve()
                })
            }
        },
        // run function
        function () {
            // show/hide the game background
            document.getElementById("1").style.display = this.id == 1 ? 'block' : 'none'
            document.getElementById("2").style.display = this.id == 2 ? 'block' : 'none'

            // set the pegman data in the async properties
            this.rect = document.getElementById("clipRect" + this.id)
            this.pegman = document.getElementById("pegman" + this.id)

            // reset the gui
            this.reset()
        },
        // reset function
        function (id) {
            // set the id in the sync properties
            if (id) this.id = id
        })

    // load a level
    this.load = function (id) {
        asyncM.reset(id)
        asyncM.run()
    }

    // reset the current level
    this.reset = function () {
        asyncM.reset()
        asyncM.run()
    }

    // remove animation
    this.removeAnimation = function () {
        let ac = asyncM.asyncProperties, id

        // if the user click the forward/backward buttons 2 or more times within 
        // 'clickTime' milliseconds of each other the animation will not show
        ac.id = id = setTimeout(() => ac.animate = ac.id === id, guiData.clickTime)
    }

    // manage the requests
    this.manageRequest = function (request, back) {
        let ac = asyncM.asyncProperties

        // call the methods of the async properties
        if (['TURN', 'MOVE'].includes(request.method))
            // update the gui
            return ac[request.method].apply(ac, [back].concat(request.data))
        else
            // wait a lot of time
            return ac.someTime(true)
    }
}

// some data
const guiData = {
    // animation frame time
    time: 100,
    // not animation time
    lotOfTime: 350,
    // user click max time
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
    // start pegman setting
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