// some inputs
Blockly.Gamepad['INPUTS'] = {
    'FORWARD': '0',
    'RIGHT': '1',
    'BACKWARD': '2',
    'LEFT': '3'
}

// init the Gamepad
Blockly.Gamepad.init({
    toolbox,
    blocks: {
        'repeat_until': {
            // the request will be { method: 'REPEAT', args: [] }
            method: 'REPEAT', // the method of the request
            statements: ['DO'], // the statement name*
            template: Blockly.Gamepad['TEMPLATES']['WHILE'], // the template type
            json: {
                // type: 'repeat_until',    is automatically setted
                'message0': 'Repeat until %1 %2 do %3',
                'args0': [{
                    'type': 'field_image',
                    'src': 'images/marker.png',
                    'width': 15,
                    'height': 15,
                },
                {
                    'type': 'input_dummy'
                },
                {
                    // the child blocks will be contained here
                    'type': 'input_statement',
                    'name': 'DO' // the statement name*
                }
                ],
                'previousStatement': null,
                'colour': 120,
            }
        },
        'if_path': {
            // the request will be { method: 'PATH', args: [ Blockly.Gamepad['INPUTS']['...some direction'] ]}
            method: 'PATH',
            args: [{
                field: 'DIRECTION', // the field name
                get: parseInt // return the number instead of the string
            }],
            statements: ['DO'],
            template: Blockly.Gamepad['TEMPLATES']['IF'],
            json: {
                'message0': 'if path %1 %2 do %3',
                'args0': [{
                    'type': 'field_dropdown',
                    'name': 'DIRECTION', // the field name
                    'options': [ // args[0] will be one of these options
                        ['ahead', Blockly.Gamepad['INPUTS']['FORWARD']],
                        ['to the right ↻', Blockly.Gamepad['INPUTS']['RIGHT']],
                        ['to the left ↺', Blockly.Gamepad['INPUTS']['LEFT']]
                    ]
                },
                {
                    'type': 'input_dummy'
                },
                {
                    'type': 'input_statement',
                    'name': 'DO'
                }
                ],
                'previousStatement': null,
                'nextStatement': null,
                'colour': 210
            }
        },
        'if_else_path': {
            // the request will be { method: 'PATH', args: [ Blockly.Gamepad['INPUTS']['...some direction'] ]}
            method: 'PATH',
            args: [{
                field: 'DIRECTION',
                get: parseInt
            }],
            statements: ['DO', 'ELSE'],
            template: Blockly.Gamepad['TEMPLATES']['IF_ELSE'],
            json: {
                'message0': 'if path %1 %2 do %3 else %4',
                'args0': [{
                    'type': 'field_dropdown',
                    'name': 'DIRECTION',
                    'options': [
                        ['ahead', Blockly.Gamepad['INPUTS']['FORWARD']],
                        ['to the right ↻', Blockly.Gamepad['INPUTS']['RIGHT']],
                        ['to the left ↺', Blockly.Gamepad['INPUTS']['LEFT']]
                    ]
                },
                {
                    'type': 'input_dummy'
                },
                {
                    'type': 'input_statement',
                    'name': 'DO'
                },
                {
                    'type': 'input_statement',
                    'name': 'ELSE'
                }
                ],
                'previousStatement': null,
                'nextStatement': null,
                'colour': 210
            }
        },
        'turn': {
            // the request will be { method: 'TURN', args: [ Blockly.Gamepad['INPUTS']['...some direction'] ]}
            method: 'TURN',
            args: [{
                field: 'DIRECTION',
                get: parseInt
            }],
            json: {
                'message0': 'turn %1',
                'args0': [{
                    'type': 'field_dropdown',
                    'name': 'DIRECTION',
                    'options': [
                        ['right ↻', Blockly.Gamepad['INPUTS']['RIGHT']],
                        ['left ↺', Blockly.Gamepad['INPUTS']['LEFT']]
                    ]
                }],
                'previousStatement': null,
                'nextStatement': null,
                'colour': 285
            }
        },
        'move': {
            // the request will be { method: 'MOVE', args: [] ]}
            method: 'MOVE',
            json: {
                'message0': 'move forward',
                'previousStatement': null,
                'nextStatement': null,
                'colour': 285
            }
        }
    }
})

// create the workspace
Blockly.inject('blockly-div', {
    toolbox,
    toolboxPosition: 'start',
    horizontalLayout: false,
})

// create the gamepad and the game
const
    gamepad = new Blockly.Gamepad({
        'start': start, // enable/disable start block
        'magicJson': true, // look at the game.js file to see how this option work
        'customHighlight': true // if false use the blockly highlight method
    }),
    gui = new Gui(),
    game = new Game(gui, gamepad)

// add debug options in the blocks context menu
const populate_ = Blockly.ContextMenu.populate_;
Blockly.ContextMenu.populate_ = function (options, rtl) {
    options = options.concat(
        {
            text: 'Set as breakpoint (forward)',
            enabled: true,
            callback: async () => {
                // decrease times
                guiData.time /= 10
                guiData.lotOfTime /= 10
                // debug
                await gamepad.debug(Blockly.selected.id, false)
                // restore times
                guiData.time *= 10
                guiData.lotOfTime *= 10
            }
        },
        {
            text: 'Set as breakpoint (backward)',
            enabled: true,
            callback: async () => {
                // decrease times
                guiData.time /= 10
                guiData.lotOfTime /= 10
                // debug
                await gamepad.debug(Blockly.selected.id, true)
                // restore times
                guiData.time *= 10
                guiData.lotOfTime *= 10
            }
        })

    return populate_.apply(Blockly.ContextMenu, [options, rtl])
}

// load the level
game.loadLevel(levels[id])