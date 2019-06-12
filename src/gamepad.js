/* Gamepad class */
Blockly.Gamepad = class {
    constructor(options) {
        options = options || {};

        // set the worker and the blocklyManager
        this.worker = new Blockly.Gamepad.Worker();
        this.blocklyManager = new Blockly.Gamepad.BlocklyManager(options);
        // if magicJson options is true
        if (options['magicJson'] === true) {
            // set the jsonManager
            this.jsonManager = new Blockly.Gamepad.JsonManager();

            // define getter and setter for json
            Object.defineProperty(this, 'json', {
                get: function () {
                    return this.jsonManager.json;
                },
                set: function (value) {
                    this.jsonManager.init(value);
                }
            });
        };

        // set the start state
        this.state = Blockly.Gamepad['STATES']['STARTED'];

        // reset the workspace
        this.blocklyManager.resize();
        this.blocklyManager.reset();

        // set the worker 
        this.worker.onRequest(this, this.manage);
    };

    // worker requests's handler
    manage(request, back, old) {
        // if there's the id highlight the block that send the request
        if (request.id !== undefined) this.blocklyManager.setHighlight(request.id);
        else this.blocklyManager.removeHighlight();

        // if jsonManager is setted
        if (this.jsonManager) {
            // if the current level is finished and there's a forward request load the next level
            // the level is loaded with the start event
            // if there's only on level this method is never triggered
            if (request.method == Blockly.Gamepad['STATES']['STARTED'] &&
                (this.state == Blockly.Gamepad['STATES']['FINISHED'] || this.state == Blockly.Gamepad['STATES']['COMPLETED']) &&
                !back) this.jsonManager.loadNext();

            // if the current level is started and there's a backward request load the prior level
            // the level is loaded with the finished event
            // if there's only on level this method is never triggered
            if ((request.method == Blockly.Gamepad['STATES']['FINISHED'] || request.method == Blockly.Gamepad['STATES']['COMPLETED']) &&
                this.state == Blockly.Gamepad['STATES']['STARTED'] &&
                back) this.jsonManager.loadPrior();

            // if the request is not old
            if (old) {
                // if it's a backward request unload the changes
                if (back) this.jsonManager.unloadChanges();
                // if this is a forward request load the changes
                else this.jsonManager.loadChanges();
            };
        };

        // update the state 
        if (request.method == Blockly.Gamepad['STATES']['STARTED'] ||
            request.method == Blockly.Gamepad['STATES']['FINISHED'] ||
            request.method == Blockly.Gamepad['STATES']['COMPLETED']
        ) this.state = request.method;

        // send the request to the game
        let result = this.game(request, back, old);

        // if there's the json manager and the request is not old save the changes
        if (this.jsonManager && !old) this.jsonManager.commit();

        // return the game result
        return result;
    };

    // set the requests's handler
    setGame(thisArg, method) {
        // it must be a function
        if (typeof method != 'function') throw new Error('method is not a function');

        // set it
        this.game = function () {
            return method.apply(thisArg, [...arguments]);
        };
    };

    // load the code n times
    load(times) {
        // update the state of the game
        this.state = Blockly.Gamepad['STATES']['STARTED'];

        // if times is setted it must be a number greater than 0
        if ((times != undefined) && (isNaN(times) || times < 1))
            throw new Error('times must be a number greater than 0.');

        // if times is not setted load code 1 times
        times = times || 1;

        // reset the workspace
        this.worker.reset();
        // get the code
        let code = this.blocklyManager.code(times);

        // if jsonManager is setted reset it
        if (this.jsonManager) this.jsonManager.reset();

        // load the code
        Blockly.Gamepad.evalContext(code, this.worker.getIstance());

        // return the blocks number
        return this.blocklyManager.getBlocksNumber();
    };

    // reset the gamepad
    reset() {
        // if jsonManager is setted reset it
        if (this.jsonManager) this.jsonManager.reset();
        // reset the worker
        this.worker.reset();
        // reset the blocklyManager
        this.blocklyManager.reset();
    };

    // set the toolbox
    setToolbox(options) {
        this.blocklyManager.toolbox(options);
    };

    // create a formard request
    forward() {
        // stop the worker if it was running
        this.worker.stop();
        // send a forward request
        return this.worker.go(false, false);
    };

    // create a backward request
    backward() {
        // stop the worker if it was running
        this.worker.stop();
        // send a backward request
        return this.worker.go(true, false);
    };

    // play the game
    play() {
        this.worker.start();
    };

    // pause the game
    pause() {
        this.worker.stop();
    };

    // save the workspace
    save(name) {
        this.blocklyManager.save(name);
    };

    // restore the workspace
    restore(name) {
        this.blocklyManager.restore(name);
    };

    // clear the workspace
    clear() {
        this.blocklyManager.clear();
    };
};

/* Gamepad symbol */
Blockly.Gamepad['SYMBOL'] = Symbol('gamepad.js');

/* Gamepad errors */
Blockly.Gamepad['ERRORS'] = {
    'CLOSED': 'closed',
};

/* Gamepad states */
Blockly.Gamepad['STATES'] = {
    'FINISHED': 'FINISHED',
    'COMPLETED': 'COMPLETED',
    'STARTED': 'STARTED',
    'FUNCTION_CALL': 'FUNCTION_CALL'
};

/* Gamepad blocks */
Blockly.Gamepad['BLOCKS'] = {
    'START': 'start'
};

/* Gamepad templates */
Blockly.Gamepad['TEMPLATES'] = {
    'WHILE': Symbol('while'),
    'DO_WHILE': Symbol('do_while'),
    'IF': Symbol('if'),
    'IF_ELSE': Symbol('if_else')
}

/* Gamepad settings loader */
Blockly.Gamepad.setting = function () {
    // add clear method to the trashcan
    Blockly.Trashcan.prototype.clear = function () {
        this.contents_ = new Array()
    };

    // set scrollbar thickness
    Blockly.Scrollbar.scrollbarThickness = 12;

    // set some code
    Blockly.JavaScript.procedures_defreturn = function (a) {
        let id = "id: '" + a.id + "'",
            args = "args: [],",
            method = "method: Blockly.Gamepad['STATES']['FUNCTION_CALL'],",
            request = '{' + method + args + id + '}'

        var b = Blockly.JavaScript.variableDB_.getName(a.getFieldValue("NAME"), Blockly.Procedures.NAME_TYPE),
            c = Blockly.JavaScript.statementToCode(a, "STACK");
        if (Blockly.JavaScript.STATEMENT_PREFIX) {
            var d = a.id.replace(/\$/g, "$$$$");
            c = Blockly.JavaScript.prefixLines(Blockly.JavaScript.STATEMENT_PREFIX.replace(/%1/g, "'" + d + "'"), Blockly.JavaScript.INDENT) + c
        }
        Blockly.JavaScript.INFINITE_LOOP_TRAP && (c = Blockly.JavaScript.INFINITE_LOOP_TRAP.replace(/%1/g, "'" + a.id + "'") +
            c);
        (d = Blockly.JavaScript.valueToCode(a, "RETURN", Blockly.JavaScript.ORDER_NONE) || "") && (d = Blockly.JavaScript.INDENT + "return resolve(" + d + ");\n");
        for (var e = [], f = 0; f < a.arguments_.length; f++) e[f] = Blockly.JavaScript.variableDB_.getName(a.arguments_[f], Blockly.Variables.NAME_TYPE);

        c = "function " + b + "(" + e.join(", ") + ") {\n" +
            "   return new Promise(async function(resolve, reject){\n" +
            "       await worker.setRequest(" + request + ");\n" +
            c + d + "\n" +
            "       resolve();\n" +
            "   });\n" +
            "}";
        c = Blockly.JavaScript.scrub_(a, c);
        Blockly.JavaScript.definitions_["%" + b] = c;

        return null
    };
    Blockly.JavaScript.procedures_defnoreturn = Blockly.JavaScript.procedures_defreturn;
    Blockly.JavaScript.procedures_callreturn = function (a) {
        for (var b = Blockly.JavaScript.variableDB_.getName(a.getFieldValue("NAME"), Blockly.Procedures.NAME_TYPE), c = [], d = 0; d < a.arguments_.length; d++) c[d] = Blockly.JavaScript.valueToCode(a, "ARG" + d, Blockly.JavaScript.ORDER_COMMA) || "null";
        return ["await " + b + "(" + c.join(", ") + ")", Blockly.JavaScript.ORDER_FUNCTION_CALL]
    };
    Blockly.JavaScript.procedures_callnoreturn = function (a) {
        for (var b = Blockly.JavaScript.variableDB_.getName(a.getFieldValue("NAME"), Blockly.Procedures.NAME_TYPE), c = [], d = 0; d < a.arguments_.length; d++) c[d] = Blockly.JavaScript.valueToCode(a, "ARG" + d, Blockly.JavaScript.ORDER_COMMA) || "null";
        return "await " + b + "(" + c.join(", ") + ");\n"
    };
    Blockly.JavaScript.procedures_ifreturn = function (a) {
        var b = "if (" + (Blockly.JavaScript.valueToCode(a, "CONDITION", Blockly.JavaScript.ORDER_NONE) || "false") + ") {\n";
        a.hasReturnValue_ ? (a = Blockly.JavaScript.valueToCode(a, "VALUE", Blockly.JavaScript.ORDER_NONE) || "null", b += Blockly.JavaScript.INDENT + "return resolve(" + a + ");\n") : b += Blockly.JavaScript.INDENT + "return resolve();\n";
        return b + "}\n"
    };
    Blockly.JavaScript[Blockly.Gamepad['BLOCKS']['START']] = function () {
        return '';
    };

    // set reserved words
    Blockly.JavaScript.addReservedWords('CONTEXT,worker,code,reject,resolve');

    // define the start block
    Blockly.defineBlocksWithJsonArray([{
        "type": Blockly.Gamepad['BLOCKS']['START'],
        "message0": "Start",
        "deletable_": false,
        "lastDummyAlign0": "CENTRE",
        "nextStatement": null,
        "style": "hat_blocks",
        "tooltip": "",
        "helpUrl": ""
    }]);
};

/* Gamepad init function */
Blockly.Gamepad.init = function (options) {
    // options can't be undefined
    if (options == undefined) throw new Error('options must not be undefined');

    // load the inputs
    if (options.hasOwnProperty('inputs')) this['INPUTS'] = options.inputs;
    // load the toolbox
    if (options.hasOwnProperty('toolbox')) this['TOOLBOX'] = Blockly.Gamepad.utils.xml2json(options.toolbox, "");
    // load the context
    if (options.hasOwnProperty('context')) this['CONTEXT'] = options.context;

    // load the blocks
    if (options.hasOwnProperty('blocks')) {
        let jsonArray = [];

        for (let type in options.blocks) {
            let block = options.blocks[type],
                hasStatements = false,
                hastemplate = false;

            if ('statements' in block) {
                // statements must be an array of string
                if (!Array.isArray(block.statements) || block.statements.length == 0)
                    throw new Error('statements must be an array of string');
                hasStatements = true;
            };

            if ('template' in block) {
                // template must be one of the Blockly.Gamepad['TEMPLATES']
                if (!Object.values(Blockly.Gamepad['TEMPLATES']).includes(block.template))
                    throw new Error('template must be one of Blockly.Gamepad[\'TEMPLATES\']');
                hastemplate = true;
            };

            // a block must have both or none
            if (hastemplate && !hasStatements) throw new Error('a template block require at least a statement');
            if (!hastemplate && hasStatements) throw new Error('statements setted without the temaplate');

            // load the javascript
            Blockly.JavaScript['' + type] = Blockly.Gamepad.utils.to(block.method, block.args, block.order, block.template, block.statements);

            // init the block with the json or the javascript
            if ('json' in block) {
                block.json.type = type;
                jsonArray.push(block.json);
            } else if ('javascript' in block) {
                Blockly.Blocks[type] = block.javascript;
            };
        };

        Blockly.defineBlocksWithJsonArray(jsonArray);
    };
};

/* Gamepad observer object */
Blockly.Gamepad.observer = {
    // insert event
    INSERT: 'insert',
    // update event
    UPDATE: 'update',
    // delete event
    DELETE: 'delete',
    // pop event
    POP: 'pop',
    // push event
    PUSH: 'push',
    // shift event
    SHIFT: 'shift',
    // unshift event
    UNSHIFT: 'unshift',
    //FILL,
    //SPLICE,
    //SORT,
    // reverse event
    REVERSE: 'reverse',
    // non observable object
    nonObservables: {
        Date: true,
        Blob: true,
        Number: true,
        String: true,
        Boolean: true,
        Error: true,
        SyntaxError: true,
        TypeError: true,
        URIError: true,
        Function: true,
        Promise: true,
        RegExp: true
    },
    // observable definition
    observableDefinition: {
        // reverse
        revoke: {
            value: function () {
                this[Blockly.Gamepad['SYMBOL']].revoke();
            }
        },
        // observe
        observe: {
            value: function (observer, options) {
                let systemObserver = this[Blockly.Gamepad['SYMBOL']],
                    observers = systemObserver.observers;

                if (typeof observer !== 'function') {
                    throw new Error('observer parameter MUST be a function');
                }

                if (!observers.has(observer)) {
                    observers.set(observer, Object.assign({}, options));
                }
            }
        },
        // unobserve
        unobserve: {
            value: function () {
                let systemObserver = this[Blockly.Gamepad['SYMBOL']],
                    observers = systemObserver.observers,
                    l;
                if (observers.size) {
                    l = arguments.length;
                    if (l) {
                        while (l--) {
                            observers.delete(arguments[l]);
                        }
                    } else {
                        observers.clear();
                    }
                }
            }
        }
    },
    // load the array
    prepareArray: function (source, observer) {
        let l = source.length,
            item;
        let target = new Array(source.length);
        target[Blockly.Gamepad['SYMBOL']] = observer;
        while (l--) {
            item = source[l];
            if (item && typeof item === 'object' && !Blockly.Gamepad.observer.nonObservables.hasOwnProperty(item.constructor.name)) {
                target[l] = Array.isArray(item) ?
                    new Blockly.Gamepad.observer.ArrayObserver({
                        target: item,
                        ownKey: l,
                        parent: observer
                    }).proxy :
                    new Blockly.Gamepad.observer.ObjectObserver({
                        target: item,
                        ownKey: l,
                        parent: observer
                    }).proxy;
            } else {
                target[l] = item;
            }
        }
        return target;
    },
    // load the object
    prepareObject: function (source, observer) {
        let keys = Object.keys(source),
            l = keys.length,
            key, item;
        let target = {
            [Blockly.Gamepad['SYMBOL']]: observer
        };
        while (l--) {
            key = keys[l];
            item = source[key];
            if (item && typeof item === 'object' && !Blockly.Gamepad.observer.nonObservables.hasOwnProperty(item.constructor.name)) {
                target[key] = Array.isArray(item) ?
                    new Blockly.Gamepad.observer.ArrayObserver({
                        target: item,
                        ownKey: key,
                        parent: observer
                    }).proxy :
                    new Blockly.Gamepad.observer.ObjectObserver({
                        target: item,
                        ownKey: key,
                        parent: observer
                    }).proxy;
            } else {
                target[key] = item;
            }
        }
        return target;
    },
    // call the observers
    callObservers: function (observers, changes) {
        for (let target of observers.keys()) {
            try {
                let relevantChanges = changes;
                target(relevantChanges);
            } catch (e) {
                console.error('failed to deliver changes to listener ' + target, e);
            };
        };
    },
    // get ancestor info
    getAncestorInfo: function (self) {
        let tmp = [],
            result, l1 = 0,
            l2 = 0;

        // if the object is revoked return undefined
        if (self.isRevoked) {
            return;
        }
        while (self.parent) {
            tmp[l1++] = self.ownKey;
            self = self.parent;
            if (self.isRevoked) {
                return;
            }
        }
        result = new Array(l1);
        while (l1--) result[l2++] = tmp[l1];
        return {
            observers: self.observers,
            path: result
        };
    }
};

/* Observer class */
Blockly.Gamepad.observer.Observer = class {
    constructor(properties, cloningFunction) {
        let source = properties.target,
            targetClone = cloningFunction(source, this);
        if (properties.parent === null) {
            this.isRevoked = false;
            Object.defineProperty(this, 'observers', {
                value: new Map()
            });
            Object.defineProperties(targetClone, Blockly.Gamepad.observer.observableDefinition);
        } else {
            this.parent = properties.parent;
            this.ownKey = properties.ownKey;
        }
        this.revokable = Proxy.revocable(targetClone, this);
        this.proxy = this.revokable.proxy;
        this.target = targetClone;
    }

    set(target, key, value) {
        if (this.isRevoked) {
            target[key] = value;
            return true;
        }
        let newValue, oldValue = target[key],
            ad, changes;

        if (value && typeof value === 'object' && !Blockly.Gamepad.observer.nonObservables.hasOwnProperty(value.constructor.name)) {
            newValue = Array.isArray(value) ?
                new Blockly.Gamepad.observer.ArrayObserver({
                    target: value,
                    ownKey: key,
                    parent: this
                }).proxy :
                new Blockly.Gamepad.observer.ObjectObserver({
                    target: value,
                    ownKey: key,
                    parent: this
                }).proxy;
        } else {
            newValue = value;
        }
        target[key] = newValue;

        if (oldValue && typeof oldValue === 'object') {
            let tmpObserved = oldValue[Blockly.Gamepad['SYMBOL']];
            if (tmpObserved) {
                oldValue = tmpObserved.revoke();
            }
        }

        ad = Blockly.Gamepad.observer.getAncestorInfo(this);
        if (!ad) return;
        if (ad.observers.size) {
            ad.path.push(key);
            changes = typeof oldValue === 'undefined' ? [{
                type: Blockly.Gamepad.observer.INSERT,
                path: ad.path,
                value: newValue,
                object: this.proxy
            }] : [{
                type: Blockly.Gamepad.observer.UPDATE,
                path: ad.path,
                value: newValue,
                oldValue: oldValue,
                object: this.proxy
            }];
            Blockly.Gamepad.observer.callObservers(ad.observers, changes);
        }
        return true;
    }

    deleteProperty(target, key) {
        let oldValue = target[key],
            ad, changes;

        if (delete target[key]) {
            if (oldValue && typeof oldValue === 'object') {
                let tmpObserved = oldValue[Blockly.Gamepad['SYMBOL']];
                if (tmpObserved) {
                    oldValue = tmpObserved.revoke();
                }
            }

            ad = Blockly.Gamepad.observer.getAncestorInfo(this);
            if (!ad) return;
            if (ad.observers.size) {
                ad.path.push(key);
                changes = [{
                    type: Blockly.Gamepad.observer.DELETE,
                    path: ad.path,
                    oldValue: oldValue,
                    object: this.proxy
                }];
                Blockly.Gamepad.observer.callObservers(ad.observers, changes);
            }
            return true;
        } else {
            return false;
        }
    }
};

/* Array observer class */
Blockly.Gamepad.observer.ArrayObserver = class extends Blockly.Gamepad.observer.Observer {
    constructor(properties) {
        super(properties, Blockly.Gamepad.observer.prepareArray);
    }

    revoke() {
        // revoke
        this.isRevoked = true;

        let target = this.target,
            l = target.length,
            item;
        while (l--) {
            item = target[l];
            // send revoke event to all sons
            if (item && typeof item === 'object') {
                let tmpObserved = item[Blockly.Gamepad['SYMBOL']];
                if (tmpObserved) {
                    target[l] = tmpObserved.revoke();
                }
            }
        }
        return target;
    }

    get(target, key) {
        // methods
        const proxiedArrayMethods = {
            pop: function proxiedPop(target, observed) {
                if (target.length == 0) return;
                let popResult;
                popResult = target.pop();
                if (popResult && typeof popResult === 'object') {
                    let tmpObserved = popResult[Blockly.Gamepad['SYMBOL']];
                    if (tmpObserved) {
                        popResult = tmpObserved.revoke();
                    }
                }

                let ad = Blockly.Gamepad.observer.getAncestorInfo(observed);
                if (!ad) return;
                if (ad.observers.size) {
                    Blockly.Gamepad.observer.callObservers(ad.observers, [{
                        type: Blockly.Gamepad.observer.POP,
                        path: ad.path,
                        oldValue: popResult,
                        object: observed.proxy
                    }]);
                }
                return popResult;
            },
            push: function proxiedPush(target, observed) {
                let i, l = arguments.length - 2,
                    item, pushContent = new Array(l),
                    pushResult, changes,
                    initialLength, ad = Blockly.Gamepad.observer.getAncestorInfo(observed);
                initialLength = target.length;

                for (i = 0; i < l; i++) {
                    item = arguments[i + 2];
                    if (item && typeof item === 'object' && !Blockly.Gamepad.observer.nonObservables.hasOwnProperty(item
                            .constructor.name)) {
                        item = Array.isArray(item) ?
                            new Blockly.Gamepad.observer.ArrayObserver({
                                target: item,
                                ownKey: initialLength + i,
                                parent: observed
                            }).proxy :
                            new Blockly.Gamepad.observer.ObjectObserver({
                                target: item,
                                ownKey: initialLength + i,
                                parent: observed
                            }).proxy;
                    }
                    pushContent[i] = item;
                }
                pushResult = Reflect.apply(target.push, target, pushContent);

                if (!ad) return;
                if (ad.observers.size) {
                    changes = [{
                        type: Blockly.Gamepad.observer.PUSH,
                        path: ad.path,
                        value: pushContent,
                        object: observed.proxy
                    }]
                    Blockly.Gamepad.observer.callObservers(ad.observers, changes);
                }
                return pushResult;
            },
            shift: function proxiedShift(target, observed) {
                if (target.length == 0) return;
                let shiftResult, i, l, item, ad, changes;

                shiftResult = target.shift();
                if (shiftResult && typeof shiftResult === 'object') {
                    let tmpObserved = shiftResult[Blockly.Gamepad['SYMBOL']];
                    if (tmpObserved) {
                        shiftResult = tmpObserved.revoke();
                    }
                }

                for (i = 0, l = target.length; i < l; i++) {
                    item = target[i];
                    if (item && typeof item === 'object') {
                        let tmpObserved = item[Blockly.Gamepad['SYMBOL']];
                        if (tmpObserved) {
                            tmpObserved.ownKey = i;
                        }
                    }
                }

                ad = Blockly.Gamepad.observer.getAncestorInfo(observed);
                if (!ad) return;
                if (ad.observers.size) {
                    changes = [{
                        type: Blockly.Gamepad.observer.SHIFT,
                        path: ad.path,
                        oldValue: shiftResult,
                        object: observed.proxy
                    }];
                    Blockly.Gamepad.observer.callObservers(ad.observers, changes);
                }
                return shiftResult;
            },
            unshift: function proxiedUnshift(target, observed) {
                let unshiftContent, unshiftResult, ad, changes;
                unshiftContent = Array.from(arguments);
                unshiftContent.splice(0, 2);
                unshiftContent.forEach((item, index) => {
                    if (item && typeof item === 'object' && !Blockly.Gamepad.observer.nonObservables.hasOwnProperty(item
                            .constructor.name)) {
                        unshiftContent[index] = Array.isArray(item) ?
                            new Blockly.Gamepad.observer.ArrayObserver({
                                target: item,
                                ownKey: index,
                                parent: observed
                            }).proxy :
                            new Blockly.Gamepad.observer.ObjectObserver({
                                target: item,
                                ownKey: index,
                                parent: observed
                            }).proxy;
                    }
                });
                unshiftResult = Reflect.apply(target.unshift, target, unshiftContent);
                for (let i = 0, l = target.length, item; i < l; i++) {
                    item = target[i];
                    if (item && typeof item === 'object') {
                        let tmpObserved = item[Blockly.Gamepad['SYMBOL']];
                        if (tmpObserved) {
                            tmpObserved.ownKey = i;
                        }
                    }
                }

                ad = Blockly.Gamepad.observer.getAncestorInfo(observed);
                if (!ad) return;
                if (ad.observers.size) {
                    changes = [{
                        type: Blockly.Gamepad.observer.UNSHIFT,
                        path: ad.path,
                        value: unshiftContent,
                        object: observed.proxy
                    }]

                    Blockly.Gamepad.observer.callObservers(ad.observers, changes);
                }
                return unshiftResult;
            },
            reverse: function proxiedReverse(target, observed) {
                let i, l, item, ad, changes;
                target.reverse();
                for (i = 0, l = target.length; i < l; i++) {
                    item = target[i];
                    if (item && typeof item === 'object') {
                        let tmpObserved = item[Blockly.Gamepad['SYMBOL']];
                        if (tmpObserved) {
                            tmpObserved.ownKey = i;
                        }
                    }
                }

                //	publish changes
                ad = Blockly.Gamepad.observer.getAncestorInfo(observed);
                if (ad.observers.size) {
                    changes = [{
                        type: Blockly.Gamepad.observer.REVERSE,
                        path: ad.path,
                        object: observed.proxy
                    }];
                    Blockly.Gamepad.observer.callObservers(ad.observers, changes);
                }
                return observed.proxy;
            },
            sort: function proxiedSort(target, observed, comparator) {
                let i, l, item, ad, changes, oldValue = target.slice(0);
                target.sort(comparator);
                for (i = 0, l = target.length; i < l; i++) {
                    item = target[i];
                    if (item && typeof item === 'object') {
                        let tmpObserved = item[Blockly.Gamepad['SYMBOL']];
                        if (tmpObserved) {
                            tmpObserved.ownKey = i;
                        }
                    }
                }

                //	publish changes
                ad = Blockly.Gamepad.observer.getAncestorInfo(observed);
                if (ad.observers.size) {
                    changes = [{
                        type: Blockly.Gamepad.observer.UPDATE,
                        value: target,
                        oldValue,
                        path: ad.path,
                        object: observed.proxy
                    }];
                    Blockly.Gamepad.observer.callObservers(ad.observers, changes);
                }
                return observed.proxy;
            },
            fill: function proxiedFill(target, observed) {
                let ad = Blockly.Gamepad.observer.getAncestorInfo(observed),
                    normArgs, argLen,
                    start, end, changes = [],
                    prev, tarLen = target.length,
                    path;
                normArgs = Array.from(arguments);
                normArgs.splice(0, 2);
                argLen = normArgs.length;
                start = argLen < 2 ? 0 : (normArgs[1] < 0 ? tarLen + normArgs[1] : normArgs[1]);
                end = argLen < 3 ? tarLen : (normArgs[2] < 0 ? tarLen + normArgs[2] : normArgs[2]);
                prev = target.slice(0);
                Reflect.apply(target.fill, target, normArgs);

                for (let i = start, item, tmpTarget; i < end; i++) {
                    item = target[i];
                    if (item && typeof item === 'object' && !Blockly.Gamepad.observer.nonObservables.hasOwnProperty(item
                            .constructor.name)) {
                        target[i] = Array.isArray(item) ?
                            new Blockly.Gamepad.observer.ArrayObserver({
                                target: item,
                                ownKey: i,
                                parent: observed
                            }).proxy :
                            new Blockly.Gamepad.observer.ObjectObserver({
                                target: item,
                                ownKey: i,
                                parent: observed
                            }).proxy;
                    }
                    if (prev.hasOwnProperty(i)) {
                        tmpTarget = prev[i];
                        if (tmpTarget && typeof tmpTarget === 'object') {
                            let tmpObserved = tmpTarget[Blockly.Gamepad['SYMBOL']];
                            if (tmpObserved) {
                                tmpTarget = tmpObserved.revoke();
                            }
                        }

                        path = ad.path.slice(0);
                        path.push(i);
                        changes.push({
                            type: Blockly.Gamepad.observer.UPDATE,
                            path: path,
                            value: target[i],
                            oldValue: tmpTarget,
                            object: observed.proxy
                        });
                    } else {
                        path = ad.path.slice(0);
                        path.push(i);
                        changes.push({
                            type: Blockly.Gamepad.observer.INSERT,
                            path: path,
                            value: target[i],
                            object: observed.proxy
                        });
                    }
                }

                if (!ad) return;
                if (ad.observers.size) {
                    Blockly.Gamepad.observer.callObservers(ad.observers, changes);
                }
                return observed.proxy;
            },
            splice: function proxiedSplice(target, observed) {
                let ad = Blockly.Gamepad.observer.getAncestorInfo(observed),
                    spliceContent, spliceResult, changes = [],
                    tmpObserved,
                    startIndex, removed, inserted, splLen, tarLen = target.length;

                spliceContent = Array.from(arguments);
                spliceContent.splice(0, 2);
                splLen = spliceContent.length;

                for (let i = 2, item; i < splLen; i++) {
                    item = spliceContent[i];
                    if (item && typeof item === 'object' && !Blockly.Gamepad.observer.nonObservables.hasOwnProperty(item
                            .constructor.name)) {
                        spliceContent[i] = Array.isArray(item) ?
                            new Blockly.Gamepad.observer.ArrayObserver({
                                target: item,
                                ownKey: i,
                                parent: observed
                            }).proxy :
                            new Blockly.Gamepad.observer.ObjectObserver({
                                target: item,
                                ownKey: i,
                                parent: observed
                            }).proxy;
                    }
                }

                startIndex = splLen === 0 ? 0 : (spliceContent[0] < 0 ? tarLen + spliceContent[0] :
                    spliceContent[0]);
                removed = splLen < 2 ? tarLen - startIndex : spliceContent[1];
                inserted = Math.max(splLen - 2, 0);
                spliceResult = Reflect.apply(target.splice, target, spliceContent);
                tarLen = target.length;

                for (let i = 0, item; i < tarLen; i++) {
                    item = target[i];
                    if (item && typeof item === 'object') {
                        tmpObserved = item[Blockly.Gamepad['SYMBOL']];
                        if (tmpObserved) {
                            tmpObserved.ownKey = i;
                        }
                    }
                }

                let i, l, item;
                for (i = 0, l = spliceResult.length; i < l; i++) {
                    item = spliceResult[i];
                    if (item && typeof item === 'object') {
                        tmpObserved = item[Blockly.Gamepad['SYMBOL']];
                        if (tmpObserved) {
                            spliceResult[i] = tmpObserved.revoke();
                        }
                    }
                }

                if (!ad) return;
                if (ad.observers.size) {
                    let index, path;
                    for (index = 0; index < removed; index++) {
                        path = ad.path.slice(0);
                        path.push(startIndex + index);
                        if (index < inserted) {
                            changes.push({
                                type: Blockly.Gamepad.observer.UPDATE,
                                path: path,
                                value: target[startIndex + index],
                                oldValue: spliceResult[index],
                                object: observed.proxy
                            });
                        } else {
                            changes.push({
                                type: Blockly.Gamepad.observer.DELETE,
                                path: path,
                                oldValue: spliceResult[index],
                                object: observed.proxy
                            });
                        }
                    }
                    for (; index < inserted; index++) {
                        path = ad.path.slice(0);
                        path.push(startIndex + index);
                        changes.push({
                            type: Blockly.Gamepad.observer.INSERT,
                            path: path,
                            value: target[startIndex + index],
                            object: observed.proxy
                        });
                    }
                    Blockly.Gamepad.observer.callObservers(ad.observers, changes);
                }
                return spliceResult;
            }
        };
        if (proxiedArrayMethods.hasOwnProperty(key)) {
            return proxiedArrayMethods[key].bind(undefined, target, this);
        } else {
            return target[key];
        }
    }
};

/* Object observer class */
Blockly.Gamepad.observer.ObjectObserver = class extends Blockly.Gamepad.observer.Observer {
    constructor(properties) {
        super(properties, Blockly.Gamepad.observer.prepareObject);
    }

    revoke() {
        this.isRevoked = true;

        let target = this.target,
            keys = Object.keys(target),
            l = keys.length,
            key, item;
        while (l--) {
            key = keys[l];
            item = target[key];
            if (item && typeof item === 'object') {
                let tmpObserved = item[Blockly.Gamepad['SYMBOL']];
                if (tmpObserved) {
                    target[key] = tmpObserved.revoke();
                }
            }
        }
        return target;
    }
};

/* Gamepad utils */
Blockly.Gamepad.utils = {
    /* xml to json */
    xml2json: function (xml, tab) {
        var X = {
            toObj: function (xml) {
                var o = {};
                if (xml.nodeType == 1) {
                    if (xml.attributes.length)
                        for (var i = 0; i < xml.attributes.length; i++)
                            o["@" + xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue || "").toString();
                    if (xml.firstChild) {
                        var textChild = 0,
                            cdataChild = 0,
                            hasElementChild = false;
                        for (var n = xml.firstChild; n; n = n.nextSibling) {
                            if (n.nodeType == 1) hasElementChild = true;
                            else if (n.nodeType == 3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++;
                            else if (n.nodeType == 4) cdataChild++;
                        }
                        if (hasElementChild) {
                            if (textChild < 2 && cdataChild < 2) {
                                X.removeWhite(xml);
                                for (var n = xml.firstChild; n; n = n.nextSibling) {
                                    if (n.nodeType == 3)
                                        o["#text"] = X.escape(n.nodeValue);
                                    else if (n.nodeType == 4)
                                        o["#cdata"] = X.escape(n.nodeValue);
                                    else if (o[n.nodeName]) {
                                        if (o[n.nodeName] instanceof Array)
                                            o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                                        else
                                            o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                                    } else
                                        o[n.nodeName] = X.toObj(n);
                                }
                            } else {
                                if (!xml.attributes.length)
                                    o = X.escape(X.innerXml(xml));
                                else
                                    o["#text"] = X.escape(X.innerXml(xml));
                            }
                        } else if (textChild) {
                            if (!xml.attributes.length)
                                o = X.escape(X.innerXml(xml));
                            else
                                o["#text"] = X.escape(X.innerXml(xml));
                        } else if (cdataChild) {
                            if (cdataChild > 1)
                                o = X.escape(X.innerXml(xml));
                            else
                                for (var n = xml.firstChild; n; n = n.nextSibling)
                                    o["#cdata"] = X.escape(n.nodeValue);
                        }
                    }
                    if (!xml.attributes.length && !xml.firstChild) o = null;
                } else if (xml.nodeType == 9) {
                    o = X.toObj(xml.documentElement);
                }
                return o;
            },
            toJson: function (o, name, ind) {
                var json = name ? ("\"" + name + "\"") : "";
                if (o instanceof Array) {
                    for (var i = 0, n = o.length; i < n; i++)
                        o[i] = X.toJson(o[i], "", ind + "\t");
                    json += (name ? ":[" : "[") + (o.length > 1 ? ("\n" + ind + "\t" + o.join(",\n" + ind + "\t") + "\n" + ind) : o.join("")) + "]";
                } else if (o == null)
                    json += (name && ":") + "null";
                else if (typeof (o) == "object") {
                    var arr = [];
                    for (var m in o)
                        arr[arr.length] = X.toJson(o[m], m, ind + "\t");
                    json += (name ? ":{" : "{") + (arr.length > 1 ? ("\n" + ind + "\t" + arr.join(",\n" + ind + "\t") + "\n" + ind) : arr.join("")) + "}";
                } else if (typeof (o) == "string")
                    json += (name && ":") + "\"" + o.toString() + "\"";
                else
                    json += (name && ":") + o.toString();
                return json;
            },
            innerXml: function (node) {
                var s = ""
                if ("innerHTML" in node)
                    s = node.innerHTML;
                else {
                    var asXml = function (n) {
                        var s = "";
                        if (n.nodeType == 1) {
                            s += "<" + n.nodeName;
                            for (var i = 0; i < n.attributes.length; i++)
                                s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue || "").toString() + "\"";
                            if (n.firstChild) {
                                s += ">";
                                for (var c = n.firstChild; c; c = c.nextSibling)
                                    s += asXml(c);
                                s += "</" + n.nodeName + ">";
                            } else
                                s += "/>";
                        } else if (n.nodeType == 3)
                            s += n.nodeValue;
                        else if (n.nodeType == 4)
                            s += "<![CDATA[" + n.nodeValue + "]]>";
                        return s;
                    };
                    for (var c = node.firstChild; c; c = c.nextSibling)
                        s += asXml(c);
                }
                return s;
            },
            escape: function (txt) {
                return txt.replace(/[\\]/g, "\\\\")
                    .replace(/[\"]/g, '\\"')
                    .replace(/[\n]/g, '\\n')
                    .replace(/[\r]/g, '\\r');
            },
            removeWhite: function (e) {
                e.normalize();
                for (var n = e.firstChild; n;) {
                    if (n.nodeType == 3) {
                        if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) {
                            var nxt = n.nextSibling;
                            e.removeChild(n);
                            n = nxt;
                        } else
                            n = n.nextSibling;
                    } else if (n.nodeType == 1) {
                        X.removeWhite(n);
                        n = n.nextSibling;
                    } else
                        n = n.nextSibling;
                }
                return e;
            }
        };
        if (xml.nodeType == 9)
            xml = xml.documentElement;
        var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
        return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
    },
    /* json to xml */
    json2xml: function (o, tab) {
        var toXml = function (v, name, ind) {
                var xml = "";
                if (v instanceof Array) {
                    for (var i = 0, n = v.length; i < n; i++)
                        xml += ind + toXml(v[i], name, ind + "\t") + "\n";
                } else if (typeof (v) == "object") {
                    var hasChild = false;
                    xml += ind + "<" + name.toLowerCase();
                    for (var m in v) {
                        if (m.charAt(0) == "@")
                            xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
                        else
                            hasChild = true;
                    }
                    xml += hasChild ? ">" : "/>";
                    if (hasChild) {
                        for (var m in v) {
                            if (m == "#text")
                                xml += v[m];
                            else if (m == "#cdata")
                                xml += "<![CDATA[" + v[m] + "]]>";
                            else if (m.charAt(0) != "@")
                                xml += toXml(v[m], m, ind + "\t");
                        }
                        xml += (xml.charAt(xml.length - 1) == "\n" ? ind : "") + "</" + name.toLowerCase() + ">";
                    }
                } else {
                    xml += ind + "<" + name + ">" + v.toString() + "</" + name + ">";
                }
                return xml;
            },
            xml = "";
        for (var m in o)
            xml += toXml(o[m], m.toString().toLowerCase(), "");
        return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
    },
    /* request string builder */
    request: function (method, args, id, order) {
        if (typeof method != 'string') method = '';
        if (!Array.isArray(args)) args = [];
        if (typeof method != 'string') id = '';

        method = ` method: '${method}',`;
        args = ` args: ${JSON.stringify(args)},`;
        id = ` id: '${id}' `;

        let result = 'await worker.setRequest({' + method + args + id + '})\n';

        return (order != undefined) ? [result, order] : result;
    },
    /* javascript string builder */
    to: function (method, args, order, template, statements) {
        args = Array.isArray(args) ? args : [];
        statements = Array.isArray(statements) ? statements : [];
        return function (block) {
            let _args = [],
                _statements = [];
            for (let arg of args) {
                let get = (typeof arg.get == 'function') ? arg.get : _ => _;

                if (arg.field != undefined) {
                    _args.push(get(block.getFieldValue(arg.field)));
                } else if (arg.input != undefined) {
                    _args.push(get(Blockly.Gamepad['INPUTS'][arg.input]));
                } else if (arg.value != undefined) {
                    _args.push(get(arg.value));
                };
            };

            for (let statement of statements) {
                _statements.push(Blockly.JavaScript.statementToCode(block, statement));
            }

            switch (template) {
                case Blockly.Gamepad['TEMPLATES']['WHILE']:
                    return 'while(' + Blockly.Gamepad.utils.request(method, _args, block.id) + '){\n' + _statements[0] + '}';
                case Blockly.Gamepad['TEMPLATES']['DO_WHILE']:
                    return 'do{' + _statements[0] + '}while{\n' + Blockly.Gamepad.utils.request(method, _args, block.id) + '}';
                case Blockly.Gamepad['TEMPLATES']['IF']:
                    return 'if(' + Blockly.Gamepad.utils.request(method, _args, block.id) + '){\n' + _statements[0] + '}';
                case Blockly.Gamepad['TEMPLATES']['IF_ELSE']:
                    return 'if(' + Blockly.Gamepad.utils.request(method, _args, block.id) + '){\n' + _statements[0] + '}else{' + _statements[1] + '}';
                default:
                    return Blockly.Gamepad.utils.request(method, _args, block.id, order);
            }
        };
    },
    /* code string builder */
    code: function (code, times) {
        //  try{
        //      try{
        //          await worker.setRequest({method: Blockly.Gamepad["STATES"]["STARTED"], id: "1"});
        //          ...
        //          await worker.setRequest({method: Blockly.Gamepad["STATES"]["FINISHED"]});
        //      }catch(error){ 
        //          if(error == Blockly.Gamepad["STATES"]["COMPLETED"]) throw error; 
        //      }
        //      try{
        //          await worker.setRequest({method: Blockly.Gamepad["STATES"]["STARTED"], id: "1"});
        //          ...
        //          await worker.setRequest({method: Blockly.Gamepad["STATES"]["FINISHED"]});
        //      }catch(error){ 
        //          if(error == Blockly.Gamepad["STATES"]["COMPLETED"]) throw error; 
        //      }
        //  }catch(error){
        //      if(err != Blockly.Gamepad["STATES"]["COMPLETED"]) throw err;
        //  }

        code =
            ('      try{\n' +
                '       await worker.setRequest({method: Blockly.Gamepad["STATES"]["STARTED"], id: "1"});\n' +
                code +
                '       await worker.setRequest({method: Blockly.Gamepad["STATES"]["FINISHED"]});\n' +
                '}catch(error){ if(error == Blockly.Gamepad["STATES"]["COMPLETED"]) throw Blockly.Gamepad["STATES"]["COMPLETED"]; }').repeat(times);


        return ('async function f() {\n' +
            '   try{\n' +
            code +
            '       worker.close();\n' +
            '   }catch(err){ if(err != Blockly.Gamepad["STATES"]["COMPLETED"]) { throw err; }; }\n' +
            '   };\n' +
            'f();');
    },
    /* promise wrapper */
    promiseWrapper: function () {
        let resolve,
            promise = new Promise(res => {
                resolve = res
            })

        var isPending = true;
        var isFulfilled = false;

        promise.isFulfilled = function () {
            return isFulfilled;
        };
        promise.isPending = function () {
            return isPending;
        };
        promise.resolve = function () {
            isPending = false;
            isFulfilled = true;
            resolve();
        }

        return promise;
    },
    /* error handler */
    errorHandler: function (error) {
        if (error != Blockly.Gamepad['ERRORS']['CLOSED'])
            throw error
    },
    /* observe a json */
    observeJson: function (target) {
        if (target && typeof target === 'object' && !Blockly.Gamepad.observer.nonObservables.hasOwnProperty(target.constructor.name) && !
            ('observe' in target) && !('unobserve' in target) && !('revoke' in target)) {
            let observed = Array.isArray(target) ?
                new Blockly.Gamepad.observer.ArrayObserver({
                    target: target,
                    ownKey: null,
                    parent: null
                }) :
                new Blockly.Gamepad.observer.ObjectObserver({
                    target: target,
                    ownKey: null,
                    parent: null
                });
            return observed.proxy;
        } else {
            if (!target || typeof target !== 'object') {
                throw new Error('observable MAY ONLY be created from non-null object only');
            } else if ('observe' in target || 'unobserve' in target || 'revoke' in target) {
                throw new Error(
                    'target object MUST NOT have nor own neither inherited properties from the following list: "observe", "unobserve", "revoke"'
                );
            } else if (Blockly.Gamepad.observer.nonObservables.hasOwnProperty(target.constructor.name)) {
                throw new Error(target + ' found to be one of non-observable object types: ' + Blockly.Gamepad.observer.nonObservables);
            }
        }
    }
};

/* eval function */
Blockly.Gamepad.evalContext = function (code, worker) {
    try {
        let CONTEXT = Blockly.Gamepad['CONTEXT'];
        eval(code);
    } catch (err) {
        console.error('eval error:', err, 'code:', code);
    };
};

/* Gamepad History */
Blockly.Gamepad.History = class {
    constructor() {
        this.reset();
    };

    // get the length
    get length() {
        return this.history.length;
    };

    // add an event
    add(event, update) {
        // remove the events after the current
        this.history.splice(this.index + 1);
        // push the vent
        this.history.push(event);
        // uodate the index
        if (update) this.index = this.length - 1;
    };

    // update the current element with the next one and return it
    get next() {
        if (this.index < this.length - 1)
            return this.history[++this.index];
    };

    // update the current element with the next one and return it
    // if the current is the first one it becomes undefined
    get prior() {
        if (this.index > -1)
            return this.history[--this.index];
    };

    // get the current event
    get current() {
        if (this.index > -1) return this.history[this.index];
    };

    // reset
    reset() {
        this.index = -1;
        this.history = [];
    };
};

/* Gamepad Queue */
Blockly.Gamepad.Queue = class {
    constructor(single) {
        // if single is enabled only one request at a time can be set
        this.single = single === true;
        // requests
        this.requests = [];
        // requests with priority
        this.prequests = [];
        // if the queue is closed
        this.closed = false;

        // set the waiter
        this.setWaiter();
    };

    // set the waiter, once a request is setted the waiter is resolved
    setWaiter() {
        // crate the waiter
        this.waiter = new Promise((resolve, reject) => {
            // once a request has been setted this method is called and the waiter will manage the get function
            this.setted = (options) => {
                // if there's no options a request has been setted and can be returned by the get method
                if (!options) return resolve();
                // if the queue has been closed the get method will return undefined
                if (options.close) return resolve(true);
                // if the queue has been resetted throw the closed error
                if (options.reset) return reject(Blockly.Gamepad['ERRORS']['CLOSED']);

                // resolve
                resolve();
            };
        });

        // wrap it to avoid the console.error if it'll be rejected
        this.waiter.then(() => {}, () => {});

        // remove the result
        this.result = undefined;
    };

    // reset
    reset() {
        this.requests = [];
        this.prequests = [];
        this.closed = false;

        // send the waiter with the reset event
        this.setted({
            reset: true
        });
        // set the waiter
        this.setWaiter();
    };

    // close the queue, get function will return undefined
    close() {
        this.closed = true;
        // send the waiter with the close event
        this.setted({
            close: true
        });
    };

    // open the queue, get function will work normally
    open() {
        this.closed = false;
    };

    // get the current request
    //
    // if there's no request the set event is awaited
    //
    // if there are more calls to this method when the request is not setted 
    // all the callers will receive the same result
    get() {
        // if the queue is closed return undefined
        if (this.closed) return new Promise(resolve => {
            resolve();
        });

        // set the result and return it
        if (this.result == undefined) return (this.result = new Promise(async (resolve, reject) => {
            // when a request has been setted has been setted
            this.waiter.then(
                closed => {
                    // if the queue is closed return undefined
                    if (closed) return resolve();
                    // else there's a request to return

                    let request;
                    // check priority requests first
                    if (this.prequests.length == 1) request = this.prequests.shift();
                    // else get the request without priority 
                    else request = this.requests.shift();

                    // set te waiter
                    this.setWaiter();
                    // if there's at least one request send the waiter
                    if ((this.requests.length + this.prequests.length) != 0) this.setted();

                    // return the request
                    resolve(request);
                },
                reject
            );
        }));

        // return the result
        return this.result;
    };

    // set the request
    set(request, hasPriority) {
        // single is enabled
        if (this.single) {
            // if there aren't priority requests
            if (this.prequests.length == 0) {
                // if has priority
                if (hasPriority) {
                    // set the request with priority
                    this.prequests.push(request);
                    // send the waiter
                    this.setted();

                    // if has not priority
                } else {
                    // if there aren't requests
                    if (this.requests.length == 0) {
                        //set the request without priority
                        this.requests.push(request);
                        // send the waiter
                        this.setted();
                    };
                };
            };
            // if single isn't enabled
        } else {
            // set the request with priority
            if (hasPriority) this.prequests.push(request);
            // set the request without priority
            else this.requests.push(request);

            // if there's al least one request send the waiter
            if ((this.requests.length + this.prequests.length) == 1) this.setted();
        };
    };
};

/* Gamepad Asynchronizer */
Blockly.Gamepad.Asynchronizer = class {
    constructor(properties, runnable, resetter) {
        this.properties = properties || {};
        this.asyncProperties = {};
        this.runnable = runnable || function () {};
        this.resetter = resetter || function () {};

        // set the waiter and resolve it
        this.waiter = Blockly.Gamepad.utils.promiseWrapper();
        this.waiter.resolve();
    };

    reset() {
        // if the asynchronizer is resetting
        if (this.waiter.isPending()) return;

        // set the waiter
        this.waiter = Blockly.Gamepad.utils.promiseWrapper();

        // remove all the properties from the asyncProperties
        for (const key of Object.keys(this.asyncProperties)) {
            this.asyncProperties[key] = undefined;
        };

        // set the symbol, to tell the asyncProperties has been resetted
        this.asyncProperties[Blockly.Gamepad['SYMBOL']] = true;

        // call the resetter function
        return this.resetter.apply(this.properties, [...arguments]);
    };

    run() {
        // if the asynchronizer is running
        if (this.waiter.isFulfilled()) return;

        // set the asyncProperties copying the properties
        this.asyncProperties = new Proxy(Object.defineProperties(Object.assign({}, this.properties), Object.getOwnPropertyDescriptors(this.properties)), {
            // set the getter
            get: function (obj, prop) {
                // if has been resetted
                if (Object.getOwnPropertySymbols(obj).includes(Blockly.Gamepad['SYMBOL']))
                    // throw Blockly.Gamepad['ERRORS']['CLOSED']
                    throw Blockly.Gamepad['ERRORS']['CLOSED'];
                else
                    // normal getter
                    return obj[prop];
            }
        });

        // call the runnable
        let result = this.runnable.apply(this.asyncProperties, [...arguments]);

        // if the result is a Promise
        if (result instanceof Promise) {
            return result.then(result => {
                // resolve the waiter
                this.waiter.resolve();
                // return the result
                return result;
            });
        } else {
            // resolve the waiter
            this.waiter.resolve();
            // return the result
            return result;
        };
    };
};

/* Gamepad Worker */
Blockly.Gamepad.Worker = function () {
    let asyncM = new Blockly.Gamepad.Asynchronizer({
            // history for the old requests
            history: new Blockly.Gamepad.History(),
            // queue for forward/backward requests
            queue: new Blockly.Gamepad.Queue(),
            // queue for blocks's requests
            requests: new Blockly.Gamepad.Queue(),
            // is the worker is running
            isRunning: false,
            // create a forward/backward request
            go: function (back, hasPriority) {
                return new Promise(resolve => {
                    this.queue.set({
                        back: back === true,
                        resolve
                    }, hasPriority === true);
                })
            },
            // start the worker
            start: function () {
                if (this.isRunning) return;
                // update running state
                this.isRunning = true
                // set a forward request with priority
                this.queue.set({
                    back: false,
                }, true);
            },
            // stop the worker
            stop: function () {
                this.isRunning = false;
            },
            // set a request from the blocks
            setRequest: function (request) {
                return new Promise((resolve, reject) => {
                    this.requests.set({
                        request,
                        resolve,
                        reject
                    })
                })
            },
            // close the worker
            // no more requests from blocks 
            close: function () {
                this.requests.close()
            }
        },
        function () {
            // flow or requests
            const start = async () => {
                try {
                    while (true) {
                        // if is running load a forward request
                        // else get from the queue
                        let request = this.isRunning ? {
                                back: false,
                            } :
                            await this.queue.get();

                        result = (request && request.back) ?
                            await backwards() :
                            await forwards();

                        // resolve the forward/backward request
                        if (request.resolve) request.resolve();
                    };
                } catch (error) {
                    // don't throw the error is the worker is been resetted
                    Blockly.Gamepad.utils.errorHandler(error);
                };
            };

            // backward manager
            const backwards = () => {
                return new Promise(async (resolve, reject) => {
                    try {
                        // get the request from the history
                        let request = this.history.current;
                        // load prior request
                        this.history.prior;

                        // if request exist manage it
                        if (request != undefined)
                            await this.manage(request, true, true);

                        resolve();
                    } catch (error) {
                        reject(error);
                    };
                });
            };

            const forwards = () => {
                return new Promise(async (resolve, reject) => {
                    let request, result;

                    try {
                        // if there's a request in the history
                        if ((request = this.history.next) !== undefined) {
                            await this.manage(request, false, true);
                            return resolve();
                        };

                        // get the request from the queue
                        request = await this.requests.get();

                        // if the worker has been closed the request will be undefined
                        if (request == undefined) {
                            this.stop();
                            return resolve();
                        };

                        if (this.history.current) {
                            // it's possible that a block pass the 'FINISHED' state
                            // when it's passed the upcoming requests need to be killed until the next 'STARTED' state
                            if (this.history.current.method == Blockly.Gamepad['STATES']['FINISHED']) {
                                // if the current isn't a 'STARTED' state kill all the requests until the next 'STARTED' state 
                                if (request.request.method != Blockly.Gamepad['STATES']['STARTED']) {
                                    request.reject(Blockly.Gamepad['STATES']['FINISHED']);
                                    return resolve();
                                };
                            };

                            // if the 'COMPLETED' is the current one in the hostory the worker is stopped
                            if (this.history.current.method == Blockly.Gamepad['STATES']['COMPLETED']) {
                                this.stop();
                                return resolve();
                            };
                        };

                        // manage the request
                        result = await this.manage(request.request, false, false);
                        if (result == undefined) result = {};

                        // add the request to the history
                        this.history.add(request.request, true);

                        // if result.finished reject the 'FINISHED' state
                        // all the upcoming requests are killed until the next 'STARTED' state
                        if (result.finished) {
                            this.history.add({
                                method: Blockly.Gamepad['STATES']['FINISHED']
                            }, true);
                            request.reject(Blockly.Gamepad['STATES']['FINISHED']);

                            // if result.finished reject the 'COMPLETED' state
                            // all the requests are killed
                        } else if (result.completed) {
                            this.history.add({
                                method: Blockly.Gamepad['STATES']['COMPLETED']
                            }, true);
                            request.reject(Blockly.Gamepad['STATES']['COMPLETED']);
                            this.close();

                            // resolve and return
                        } else {
                            request.resolve(result.return);
                        };

                        resolve();
                    } catch (error) {
                        reject(error);
                    };
                });
            };

            start();
        },
        function () {
            // reset all
            this.queue.reset();
            this.requests.reset();
            this.history.reset();
        });

    Object.assign(this, {
        // reset
        reset: function () {
            asyncM.reset();
            asyncM.run();
        },
        // request manager
        onRequest: function (thisArg, method) {
            asyncM.properties.manage = function (request, back, old) {
                return method.apply(thisArg, [request, back, old]);
            };
        },
        // return the current asyncProperties
        getIstance: function () {
            return asyncM.asyncProperties;
        }
    });

    // link the asyncProperties methods
    for (const method of [
            'go',
            'setRequest',
            'start',
            'stop',
            'close'
        ]) {
        this[method] = function () {
            let args = [...arguments];
            let ac = asyncM.asyncProperties;
            try {
                return ac[method].apply(ac, args);
            } catch (error) {
                Blockly.Gamepad.utils.errorHandler(error);
            };
        };
    };
};

/* Gamepad BlocklyManager */
Blockly.Gamepad.BlocklyManager = class {
    constructor(options) {
        options = options || {};

        // if someone is changing the workspace
        this.isCoding = false;
        // if use the strat block
        this.start = options.start === true;
        // set custom highlight
        this.customHighlight = 'customHighlight' in options ? options.customHighlight === true : null;
        // set the workspace, default is Blockly.getMainWorkspace()
        this.workspace = options.workspace || Blockly.getMainWorkspace();

        this.workspace.addChangeListener((event) => {
            if (event.type == Blockly.Events.BLOCK_MOVE) {
                // update codinge state and remove block highlight
                if (!this.isCoding) this.removeHighlight();
                this.isCoding = true;
            };

            // if the start block is enabled
            if (this.start) {
                // it's possible that the start block is deleted also if it is undelatable
                // for exmple with an (ctrl + z) commmand
                // if it has been deleted call the undo method
                if (event.type == Blockly.Events.BLOCK_DELETE) {
                    let blocks = this.workspace.getTopBlocks()

                    for (let block of blocks) {
                        if (block.type == Blockly.Gamepad['BLOCKS']['START']) return;
                    };

                    this.workspace.undo(true);
                };
            };
        });
    };

    // get the code
    code(times) {
        // update coding state
        this.isCoding = false;
        // clear the workspace
        if (this.start) this.clear();

        // get the code
        let code = Blockly.JavaScript.workspaceToCode(this.workspace);
        code = Blockly.Gamepad.utils.code(code, times);

        return code;
    };

    // clear the workspace
    clear() {
        let blocks = this.workspace.getTopBlocks();
        // remove all expect methods and start block
        for (let block of blocks) {
            if (!block.type.includes('procedures_def') && (!this.start || (block.type != Blockly.Gamepad['BLOCKS']['START'])))
                block.dispose(false);
        };
    };

    // clear the workspace
    reset() {
        this.workspace.clear()
        setTimeout(() => {
            // clear the trashcan
            if (this.workspace.trashcan) this.workspace.trashcan.clear()
        })

        // start is enabled create it
        if (this.start) {
            this.parentBlock = this.workspace.newBlock(Blockly.Gamepad['BLOCKS']['START'], '1')
            this.parentBlock.setDeletable(false)
            this.parentBlock.startHat_ = true
            this.parentBlock.initSvg()
            this.parentBlock.render()
            this.parentBlock.setMovable(false)
            this.parentBlock.moveBy(20, 20)
        }
    }

    // update the toolbox
    toolbox(options) {
        if (options == undefined) return;
        // get the toolbox object
        let toolbox = JSON.parse(Blockly.Gamepad['TOOLBOX']);

        // show some blocks
        if (options.blocks) {
            function filter(obj) {
                let hasCategory = false;
                let hasBlock = false;

                if (obj['@custom'] == "PROCEDURE") {
                    return options.procedure !== false;
                };

                if (obj['@custom'] == "VARIABLE") {
                    return options.variable !== false;
                };

                if (obj.CATEGORY) {
                    let i;
                    for (i = 0; i < obj.CATEGORY.length; i++) {
                        if (!filter(obj.CATEGORY[i])) {
                            obj.CATEGORY.splice(i, 1);
                            i--;
                        };
                    };

                    if (i > 0) hasCategory = true;
                };

                if (obj.BLOCK) {
                    let i;
                    for (i = 0; i < obj.BLOCK.length; i++) {
                        if (!options.blocks.includes(obj.BLOCK[i]['@type'])) {
                            obj.BLOCK.splice(i, 1);
                            i--;
                        };
                    };

                    if (i > 0) hasBlock = true;
                }

                return hasCategory || hasBlock;
            };

            // filter 
            filter(toolbox.XML);

            this.workspace.updateToolbox(Blockly.Gamepad.utils.json2xml(toolbox));
            // show all blocks
        } else if (options.all) {
            this.workspace.updateToolbox(Blockly.Gamepad.utils.json2xml(toolbox));
        };
    };

    // highlight a block
    setHighlight(id) {
        if(this.customHighlight === null) return; 

        if (!this.isCoding) {
            if (this.customHighlight) {
                this.removeHighlight();
                try {
                    document.querySelector("[data-id='" + id + "']").classList.add('blocklySelected');
                } catch (error) {};
            }else{
                this.workspace.highlightBlock(id);
            };
        };
    };

    // remove the highlight from all the block
    removeHighlight() {
        if(this.customHighlight === null) return; 

        if (!this.isCoding) {
            if (this.customHighlight) {
                let blocks = document.getElementsByClassName("blocklySelected");
                for (let i = blocks.length; i > 0; i--) blocks[i - 1].classList.remove('blocklySelected');
            } else {
                this.workspace.highlightBlock();
            };
        };
    };

    // get the blocks number
    getBlocksNumber() {
        let blocks = this.workspace.getAllBlocks(),
            result = {
                total: 0
            };

        for (let block of blocks) {
            if (result[block.type] == undefined) result[block.type] = 0;
            result[block.type]++;
            result.total++;
        };

        return result;
    };

    // save the workspace in the local storage
    save(name) {
        if (typeof (Storage) !== "undefined") {
            let xml = Blockly.Xml.workspaceToDom(this.workspace);
            localStorage.setItem(name, Blockly.Xml.domToText(xml));
        };
    };

    // restore the workspace from the local storage
    restore(name) {
        if (typeof (Storage) !== "undefined") {
            if (localStorage.getItem(name) != null) {
                this.workspace.clear();
                try {
                    let xml = Blockly.Xml.textToDom(localStorage.getItem(name));
                    Blockly.Xml.domToWorkspace(xml, this.workspace);
                } catch (error) {
                    this.reset()
                }
            };

            if (this.start) {
                let blocks = this.workspace.getTopBlocks();

                for (let block of blocks) {
                    if (block.type == Blockly.Gamepad['BLOCKS']['START']) return;
                };

                this.reset();
            };
        };

        if (this.workspace.trashcan) this.workspace.trashcan.clear();
    };

    // resize the workspace
    resize() {
        Blockly.svgResize(this.workspace);
    };
};

/* Gamepad JsonManager */
Blockly.Gamepad.JsonManager = class {
    constructor(data) {
        this.init(data || {})
    }

    // reset the json
    reset() {
        this.init()
    }

    // load new json
    init(data) {
        if (data !== undefined) this.data = data
        this.observers = []
        this.index = 0

        let to = (data) => {
            let obj = {
                json: Blockly.Gamepad.utils.observeJson(data),
                history: [],
                index: -1,
                changes: []
            }

            this.observers.push(obj)
            obj.json.observe(changes => {

                changes.forEach(change => {
                    if ('value' in change && (change.value != undefined)) change.value =
                        JSON.parse(JSON.stringify(change.value))
                    if ('oldValue' in change && (change.oldValue != undefined)) change
                        .oldValue = JSON.parse(JSON.stringify(change.oldValue))

                    obj.changes.push(change)
                });
            });
        }

        if (Array.isArray(this.data)) {
            for (let entries of this.data) to(entries)
        } else {
            to(this.data)
        }
    }

    get current() {
        return this.observers[this.index]
    }

    get json() {
        return this.current.json
    }

    get history() {
        return this.current.history
    }

    get changes() {
        return this.current.changes
    }

    set changes(value) {
        this.current.changes = value
    }

    // get the obj and the path
    load(path) {
        let obj = this.json,
            i;

        for (i = 0; i < path.length - 1; i++) obj = obj[path[i]];

        return {
            path: path[i],
            obj
        };
    }

    // save changes
    commit() {
        this.history.splice(this.current.index + 1)
        this.history.push(this.changes)
        this.current.index = this.history.length - 1
        this.changes = []
    }

    // load single change
    loadChange(change) {
        let {
            obj,
            path
        } = this.load(change.path, change.value)


        if (Array.isArray(obj)) {
            if (change.type == Blockly.Gamepad.observer.INSERT) {
                // if the path isn't a number the if is false and it will set the value correctly
                if (obj.length > path)
                    obj.splice(path, 0, change.value)
                else
                    obj[path] = change.value
            }
            if (change.type == Blockly.Gamepad.observer.DELETE) obj.splice(path, 1)
        } else {
            if (change.type == Blockly.Gamepad.observer.INSERT) obj[path] = change.value
            if (change.type == Blockly.Gamepad.observer.DELETE) delete obj[path]
        }

        if (change.type == Blockly.Gamepad.observer.PUSH) obj[path].push.apply(obj, change.value)
        if (change.type == Blockly.Gamepad.observer.POP) obj[path].pop()
        if (change.type == Blockly.Gamepad.observer.UNSHIFT) obj[path].unshift.apply(obj, change.value)
        if (change.type == Blockly.Gamepad.observer.SHIFT) obj[path].shift()
        if (change.type == Blockly.Gamepad.observer.REVERSE) obj[path].reverse()

        if (change.type == Blockly.Gamepad.observer.UPDATE) obj[path] = change.value
    }

    // unload single change
    unloadChange(change) {
        let {
            obj,
            path
        } = this.load(change.path, change.value)

        if (Array.isArray(obj)) {

            if (change.type == Blockly.Gamepad.observer.INSERT) {
                // if the path isn't a number the if is false and it will set the value correctly
                if (obj.length > path)
                    obj.splice(path, 1)
                else
                    delete obj[path]
            }
            if (change.type == Blockly.Gamepad.observer.DELETE) obj.splice(path, 0, change.oldValue)
        } else {
            if (change.type == Blockly.Gamepad.observer.INSERT) delete obj[path]

            if (change.type == Blockly.Gamepad.observer.DELETE) obj[path] = change.oldValue
        }

        if (change.type == Blockly.Gamepad.observer.PUSH) {

            for (let i = 0; i < change.value.length; i++) obj[path].pop()
        }
        if (change.type == Blockly.Gamepad.observer.POP) obj[path].push(change.oldValue)
        if (change.type == Blockly.Gamepad.observer.UNSHIFT) {
            for (let i = 0; i < change.value.length; i++) obj[path].shift()
        }
        if (change.type == Blockly.Gamepad.observer.SHIFT) obj[path].unshift(change.oldValue)
        if (change.type == Blockly.Gamepad.observer.REVERSE) obj[path].reverse()


        if (change.type == Blockly.Gamepad.observer.UPDATE) obj[path] = change.oldValue
    }

    // load all changes
    loadChanges() {
        let changes = this.changes.slice(0)
        while (changes.length > 0) this.unloadChange(changes.pop())

        if (this.current.index < this.history.length - 1) {
            this.current.index++
            let array = this.history[this.current.index]

            let i = -1
            while (++i < array.length) this.loadChange(array[i])
        }

        this.changes = []
    }

    // unload all changes
    unloadChanges() {
        let changes = this.changes.slice(0)
        while (changes.length > 0) this.unloadChange(changes.pop())

        if (this.current.index > -1) {
            let array = this.history[this.current.index]

            let i = array.length

            while (--i >= 0) {
                this.unloadChange(array[i])

            }
            this.current.index--
        }

        this.changes = []
    }

    // load next json
    loadNext() {
        if (this.index < this.observers.length - 1) this.index++
    }

    // load prior json
    loadPrior() {
        if (this.index > 0) this.index--
    }
};

/* load the setting */
Blockly.Gamepad.setting();