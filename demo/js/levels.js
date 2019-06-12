/* levels data */

const levels = [
    // level 1
    {
        id: 1,
        // the blocks to show in the toolbox
        blocks: [
            'move_forward',
            'turn'
        ],
        // game data
        game: {
            // pegman data
            pegman: {
                direction: 1,
                x: 0,
                y: 0
            },
            // marker data
            marker: {
                x: 2,
                y: 1
            },
            // game path
            path: [
                // [x, y]
                [0, 0],
                [1, 0],
                [1, 1],
                [2, 1]
            ]
        }
    },
    //level 2
    {
        id: 2,
        // maximum blocks allowed
        maxBlocks: 10,
        //game data
        game: {
            // pegman data
            pegman: {
                direction: 1,
                x: 0,
                y: 0
            },
            // marker data
            marker: {
                x: 3,
                y: 5
            },
            // game path
            path: [
                // [x, y]
                [0, 0],
                [1, 0],
                [2, 0],
                [3, 0],
                [2, 1],
                [2, 2],
                [2, 3],
                [1, 2],
                [0, 2],
                [0, 3],
                [0, 4],
                [0, 5],
                [1, 4],
                [1, 5],
                [3, 2],
                [4, 2],
                [5, 2],
                [5, 1],
                [5, 0],
                [4, 3],
                [4, 4],
                [3, 4],
                [3, 5],
                [4, 4],
                [5, 4],
                [5, 5],
            ]
        }
    },
]