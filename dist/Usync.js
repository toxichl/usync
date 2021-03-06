(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("Usync", [], factory);
	else if(typeof exports === 'object')
		exports["Usync"] = factory();
	else
		root["Usync"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = __webpack_require__(3);
var lifeCycle_1 = __webpack_require__(1);
var STATE;
(function (STATE) {
    STATE[STATE["READY"] = 0] = "READY";
    STATE[STATE["PENDING"] = 1] = "PENDING";
    STATE[STATE["FULFILLED"] = 2] = "FULFILLED";
    STATE[STATE["REJECTED"] = 3] = "REJECTED";
})(STATE || (STATE = {}));
var Usync = (function () {
    /**
     * Initialize a Usync APP
     * @param state
     * @param options
     */
    function Usync(state, options) {
        this.vessel = {};
        this.lifecycleMap = lifeCycle_1.init();
        this.root = Array.isArray(state) ? state :
            typeof state === 'string' ? ((this.setName(state)) && {}) :
                typeof state === 'object' ? [state] : {};
        options = index_1.assign({}, options);
        if (options.name) {
            this.setName(options.name);
        }
        this.root.$name = this.__name__;
        this.defferd = [];
        this.index = -1;
        this.state = STATE.READY;
        this.runHook(lifeCycle_1.LIFECYCLE[lifeCycle_1.LIFECYCLE.init], this);
    }
    Usync.prototype.fulfilledBroadcast = function () { };
    Object.defineProperty(Usync.prototype, "currentDefferd", {
        get: function () {
            return this.defferd[this.index];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Usync.prototype, "prevDefferd", {
        get: function () {
            return this.defferd[this.index - 1];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Usync.prototype, "nextDefferd", {
        get: function () {
            return this.defferd[this.index + 1];
        },
        enumerable: true,
        configurable: true
    });
    Usync.prototype.setName = function (name) {
        this.__name__ = name;
        return this;
    };
    Object.defineProperty(Usync.prototype, "name", {
        get: function () {
            return this.__name__;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Core method to add task
     * @param handler
     * @returns {Usync}
     */
    Usync.prototype.use = function (handler) {
        // Supoort Array syntax
        if (Array.isArray(handler)) {
            for (var _i = 0, handler_1 = handler; _i < handler_1.length; _i++) {
                var childHandler = handler_1[_i];
                this.use(childHandler);
            }
            return this;
        }
        handler.$parent = this;
        this.runHook(lifeCycle_1.LIFECYCLE[lifeCycle_1.LIFECYCLE.beforeUse], this, handler);
        this.defferd.push(handler);
        if (this.defferd.length === 1) {
            this.state = STATE.PENDING;
            this.index = 0;
        }
        else {
            // Previous task has been FULFILLED, directly to the next task execution
            if (this.defferd[this.defferd.length - 2].__state__ === STATE.FULFILLED) {
                this.then();
            }
        }
        return this;
    };
    /**
     * Run next task
     */
    Usync.prototype.then = function () {
        var _this = this;
        // Add Support for time record
        this.currentDefferd.startTime = new Date().getTime();
        var argues = [this.root].concat(this.done.bind(this));
        try {
            this.setRootProperty();
            this.runHook(lifeCycle_1.LIFECYCLE[lifeCycle_1.LIFECYCLE.taskStart], this.root);
            if (typeof this.currentDefferd === 'function') {
                var returnValue = this.currentDefferd.apply(this, argues);
                if (returnValue instanceof Promise) {
                    returnValue.then(function () {
                        _this.done.call(_this);
                    }).catch(function (err) {
                        throw err;
                    });
                }
            }
            else if (this.currentDefferd instanceof Usync) {
                this.currentDefferd.fulfilledBroadcast = this.done.bind(this);
                this.currentDefferd.start();
            }
        }
        catch (err) {
            if (this.vessel.catch) {
                var errArgues = [err].concat([this.root], this.done.bind(this));
                this.vessel.catch.apply(this, errArgues);
            }
            else {
                throw new Error(err);
            }
        }
    };
    /**
     * Update root state
     */
    Usync.prototype.setRootProperty = function () {
        this.root.$current = this.currentDefferd;
        this.root.$prev = this.prevDefferd;
        this.root.$next = this.nextDefferd;
    };
    /**
     * the next()
     */
    Usync.prototype.done = function () {
        this.currentDefferd.__state__ = STATE.FULFILLED;
        this.currentDefferd.endTime = new Date().getTime();
        this.setRootProperty();
        this.runHook(lifeCycle_1.LIFECYCLE[lifeCycle_1.LIFECYCLE.taskEnd], this.root);
        this.index++;
        // defferd running finished
        if (this.index === this.defferd.length) {
            this.state = STATE.FULFILLED;
            this.defferd = [];
            this.index = -1;
            this.runHook(lifeCycle_1.LIFECYCLE[lifeCycle_1.LIFECYCLE.appEnd], this.root);
            // When a Usync instance set as a child task for another Usync instance
            // fulfilledBroadcast() will tell the parent it was fulfilled
            if (typeof this.fulfilledBroadcast === 'function') {
                this.fulfilledBroadcast();
            }
            return;
        }
        // Synchronous task call next,
        // subsequent task at this time has not yet been push, return directly
        if (this.currentDefferd === undefined) {
            return;
        }
        else if (this.currentDefferd.__state__ === undefined) {
            this.then();
        }
    };
    /**
     * Error catch
     * @param fn
     * @returns {Usync}
     */
    Usync.prototype.catch = function (fn) {
        this.vessel.catch = fn;
        return this;
    };
    /**
     * A Usync application does not run automatically, start() must be called
     */
    Usync.prototype.start = function () {
        this.runHook(lifeCycle_1.LIFECYCLE[lifeCycle_1.LIFECYCLE.appStart], this.root);
        this.startTime = new Date().getTime();
        this.then();
    };
    /**
     * Run life cycle hook
     * @param {String} name
     * @param args
     */
    Usync.prototype.runHook = function (name) {
        var _this = this;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var hookQuene = name + "Quene";
        this.lifecycleMap[hookQuene].forEach(function (hook) { return hook.apply(_this, args); });
        if (this.protoLifecycleMap) {
            this.protoLifecycleMap[hookQuene].forEach(function (hook) { return hook.apply(_this, args); });
        }
    };
    Object.defineProperty(Usync.prototype, "protoLifecycleMap", {
        get: function () {
            return Object.getPrototypeOf(this).lifecycleMap;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Extend through life cycle
     * @param hooks
     */
    Usync.prototype.extend = function (hooks) {
        for (var _i = 0, _a = Object.keys(this.lifecycleMap); _i < _a.length; _i++) {
            var key = _a[_i];
            var _key = key.replace('Quene', '');
            if (hooks[_key]) {
                this.lifecycleMap[key].push(hooks[_key]);
            }
        }
    };
    Usync.plugin = function (plugin, options) {
    };
    Usync.app = function (state, options) {
        return new Usync(state, options);
    };
    Usync.extend = function (hooks) {
    };
    return Usync;
}());
exports.default = Usync;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var LIFECYCLE;
(function (LIFECYCLE) {
    LIFECYCLE[LIFECYCLE["appStart"] = 1] = "appStart";
    LIFECYCLE[LIFECYCLE["taskStart"] = 2] = "taskStart";
    LIFECYCLE[LIFECYCLE["taskEnd"] = 3] = "taskEnd";
    LIFECYCLE[LIFECYCLE["appEnd"] = 4] = "appEnd";
    LIFECYCLE[LIFECYCLE["beforeUse"] = 5] = "beforeUse";
    LIFECYCLE[LIFECYCLE["init"] = 6] = "init";
})(LIFECYCLE = exports.LIFECYCLE || (exports.LIFECYCLE = {}));
/**
 * Check if a string only contains Number string
 * @param value
 * @returns {boolean}
 */
function isNumberStr(value) {
    // Cannot to use the parseInt API
    // because parseInt will ignore the partial that aren't Number
    var n = Number(value);
    return !isNaN(n);
}
/**
 * Init the life cycle map
 * @returns {ILifecycleMap}
 */
function init() {
    var list = {};
    for (var _i = 0, _a = Object.keys(LIFECYCLE); _i < _a.length; _i++) {
        var cycle = _a[_i];
        if (!isNumberStr(cycle)) {
            list[cycle + "Quene"] = [];
        }
    }
    return list;
}
exports.init = init;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/// <reference path="./index.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright toxichl All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/toxichl/usync/blob/master/LICENSE
 */
var core_1 = __webpack_require__(0);
var globalAPI_1 = __webpack_require__(4);
globalAPI_1.default(core_1.default);
module.exports = core_1.default;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function assign(target) {
    var restOb = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        restOb[_i - 1] = arguments[_i];
    }
    if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object');
    }
    target = Object(target);
    for (var index = 0; index < restOb.length; index++) {
        var source = restOb[index];
        if (source != null) {
            for (var key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                }
            }
        }
    }
    return target;
}
exports.assign = assign;
;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var plugin_1 = __webpack_require__(5);
var extend_1 = __webpack_require__(6);
function initGlobalAPI(_Usync) {
    plugin_1.default(_Usync);
    extend_1.default(_Usync);
}
exports.default = initGlobalAPI;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function initPlugin($Usync) {
    $Usync.plugin = function (plugin, options) {
        if (typeof plugin === 'function') {
            plugin($Usync, options);
        }
        else if (typeof plugin === 'object' && plugin.install) {
            plugin.install($Usync, options);
        }
    };
}
exports.default = initPlugin;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__(0);
var lifeCycle_1 = __webpack_require__(1);
function initExtend($Usync) {
    $Usync.extend = function (hooks) {
        if (!core_1.default.prototype.lifecycleMap) {
            core_1.default.prototype.lifecycleMap = lifeCycle_1.init();
        }
        core_1.default.prototype.extend.call(core_1.default.prototype, hooks);
    };
}
exports.default = initExtend;


/***/ })
/******/ ]);
});
//# sourceMappingURL=Usync.js.map