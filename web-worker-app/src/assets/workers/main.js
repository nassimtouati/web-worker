/******/ (function(modules) { // webpackBootstrap
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
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
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
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/worker/app-workers/algorithm.worker.ts":
/*!****************************************************!*\
  !*** ./src/worker/app-workers/algorithm.worker.ts ***!
  \****************************************************/
/*! exports provided: AlgorithmWorker */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AlgorithmWorker", function() { return AlgorithmWorker; });
/* harmony import */ var _shared_worker_message_model__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./shared/worker-message.model */ "./src/worker/app-workers/shared/worker-message.model.ts");

var AlgorithmWorker = /** @class */ (function () {
    function AlgorithmWorker() {
    }
    AlgorithmWorker.doWork = function (value) {
        this.anchor_array = value.data[1][0];
        this.label_array = value.data[1][1];
        this.svg_w = value.data[0][0];
        this.svg_h = value.data[0][1];
        this.labeler();
        this.dataResponse.push(this.anchor_array);
        this.dataResponse.push(this.label_array);
        return new _shared_worker_message_model__WEBPACK_IMPORTED_MODULE_0__["WorkerMessage"](value.topic, this.dataResponse);
    };
    AlgorithmWorker.labeler = function () {
        this.label(this.label_array);
        this.anchor(this.anchor_array);
        this.width(this.svg_w);
        this.height(this.svg_h);
        this.start(1500);
    };
    AlgorithmWorker.energy = function (index) {
        // energy function, tailored for label placement
        var m = this.lab.length, ener = 0, dx = this.lab[index].x - this.anc[index].x, dy = this.anc[index].y - this.lab[index].y, dist = Math.sqrt(dx * dx + dy * dy), overlap = true, amount = 0, theta = 0;
        // penalty for length of leader line
        if (dist > 0)
            ener += dist * this.w_len;
        // label orientation bias
        dx /= dist;
        dy /= dist;
        if (dx > 0 && dy > 0) {
            ener += 0 * this.w_orient;
        }
        else if (dx < 0 && dy > 0) {
            ener += 1 * this.w_orient;
        }
        else if (dx < 0 && dy < 0) {
            ener += 2 * this.w_orient;
        }
        else {
            ener += 3 * this.w_orient;
        }
        var x21 = this.lab[index].x, y21 = this.lab[index].y - this.lab[index].height + 2.0, x22 = this.lab[index].x + this.lab[index].width, y22 = this.lab[index].y + 2.0;
        var x11, x12, y11, y12, x_overlap, y_overlap, overlap_area;
        for (var i = 0; i < m; i++) {
            if (i != index) {
                // penalty for intersection of leader lines
                overlap = this.intersect(this.anc[index].x, this.lab[index].x, this.anc[i].x, this.lab[i].x, this.anc[index].y, this.lab[index].y, this.anc[i].y, this.lab[i].y);
                if (overlap)
                    ener += this.w_inter;
                // penalty for label-label overlap
                x11 = this.lab[i].x;
                y11 = this.lab[i].y - this.lab[i].height + 2.0;
                x12 = this.lab[i].x + this.lab[i].width;
                y12 = this.lab[i].y + 2.0;
                x_overlap = Math.max(0, Math.min(x12, x22) - Math.max(x11, x21));
                y_overlap = Math.max(0, Math.min(y12, y22) - Math.max(y11, y21));
                overlap_area = x_overlap * y_overlap;
                ener += (overlap_area * this.w_lab2);
            }
            // penalty for label-anchor overlap
            x11 = this.anc[i].x - this.anc[i].r;
            y11 = this.anc[i].y - this.anc[i].r;
            x12 = this.anc[i].x + this.anc[i].r;
            y12 = this.anc[i].y + this.anc[i].r;
            x_overlap = Math.max(0, Math.min(x12, x22) - Math.max(x11, x21));
            y_overlap = Math.max(0, Math.min(y12, y22) - Math.max(y11, y21));
            overlap_area = x_overlap * y_overlap;
            ener += (overlap_area * this.w_lab_anc);
        }
        return ener;
    };
    AlgorithmWorker.mcmove = function (currT) {
        // Monte Carlo translation move
        // select a random label
        var i = Math.floor(Math.random() * this.lab.length);
        // save old coordinates
        var x_old = this.lab[i].x;
        var y_old = this.lab[i].y;
        // old energy
        var old_energy;
        if (this.user_energy) {
            old_energy = this.user_defined_energy(i, this.lab, this.anc);
        }
        else {
            old_energy = this.energy(i);
        }
        // random translation
        this.lab[i].x += (Math.random() - 0.5) * this.max_move;
        this.lab[i].y += (Math.random() - 0.5) * this.max_move;
        // hard wall boundaries
        // if (this.lab[i].x > this.w) this.lab[i].x = x_old;
        // if (this.lab[i].x < 0) this.lab[i].x = x_old;
        // if (this.lab[i].y > this.h) this.lab[i].y = y_old;
        // if (this.lab[i].y < 0) this.lab[i].y = y_old;
        // new energy
        var new_energy;
        if (this.user_energy) {
            new_energy = this.user_defined_energy(i, this.lab, this.anc);
        }
        else {
            new_energy = this.energy(i);
        }
        // delta E
        var delta_energy = new_energy - old_energy;
        if (Math.random() < Math.exp(-delta_energy / currT)) {
            this.acc += 1;
        }
        else {
            // move back to old coordinates
            this.lab[i].x = x_old;
            this.lab[i].y = y_old;
            this.rej += 1;
        }
    };
    AlgorithmWorker.mcrotate = function (currT) {
        // Monte Carlo rotation move
        // select a random label
        var i = Math.floor(Math.random() * this.lab.length);
        // save old coordinates
        var x_old = this.lab[i].x;
        var y_old = this.lab[i].y;
        // old energy
        var old_energy;
        if (this.user_energy) {
            old_energy = this.user_defined_energy(i, this.lab, this.anc);
        }
        else {
            old_energy = this.energy(i);
        }
        // random angle
        var angle = (Math.random() - 0.5) * this.max_angle;
        var s = Math.sin(angle);
        var c = Math.cos(angle);
        // translate label (relative to anchor at origin):
        this.lab[i].x -= this.anc[i].x;
        this.lab[i].y -= this.anc[i].y;
        // rotate label
        var x_new = this.lab[i].x * c - this.lab[i].y * s, y_new = this.lab[i].x * s + this.lab[i].y * c;
        // translate label back
        this.lab[i].x = x_new + this.anc[i].x;
        this.lab[i].y = y_new + this.anc[i].y;
        // hard wall boundaries
        if (this.lab[i].x > this.w)
            this.lab[i].x = x_old;
        if (this.lab[i].x < 0)
            this.lab[i].x = x_old;
        if (this.lab[i].y > this.h)
            this.lab[i].y = y_old;
        if (this.lab[i].y < 0)
            this.lab[i].y = y_old;
        // new energy
        var new_energy;
        if (this.user_energy) {
            new_energy = this.user_defined_energy(i, this.lab, this.anc);
        }
        else {
            new_energy = this.energy(i);
        }
        // delta E
        var delta_energy = new_energy - old_energy;
        if (Math.random() < Math.exp(-delta_energy / currT)) {
            this.acc += 1;
        }
        else {
            // move back to old coordinates
            this.lab[i].x = x_old;
            this.lab[i].y = y_old;
            this.rej += 1;
        }
    };
    ;
    AlgorithmWorker.intersect = function (x1, x2, x3, x4, y1, y2, y3, y4) {
        // returns true if two lines intersect, else false
        // from http://paulbourke.net/geometry/lineline2d/
        var mua, mub;
        var denom, numera, numerb;
        denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
        numera = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3);
        numerb = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3);
        /* Is the intersection along the the segments */
        mua = numera / denom;
        mub = numerb / denom;
        if (!(mua < 0 || mua > 1 || mub < 0 || mub > 1)) {
            return true;
        }
        return false;
    };
    AlgorithmWorker.cooling_schedule = function (currT, initialT, nsweeps) {
        // linear cooling
        return (currT - (initialT / nsweeps));
    };
    AlgorithmWorker.start = function (nsweeps) {
        // main simulated annealing function
        var m = this.lab.length, currT = 1.0, initialT = 1.0;
        for (var i = 0; i < nsweeps; i++) {
            for (var j = 0; j < m; j++) {
                if (Math.random() < 0.5) {
                    this.mcmove(currT);
                }
                else {
                    this.mcrotate(currT);
                }
            }
            currT = this.cooling_schedule(currT, initialT, nsweeps);
        }
        // PBE global variables alteration
    };
    ;
    AlgorithmWorker.width = function (x) {
        // users insert graph width
        if (!arguments.length)
            return this.w;
        this.w = x;
        return this.labeler;
    };
    ;
    AlgorithmWorker.height = function (x) {
        // users insert graph height
        if (!arguments.length)
            return this.h;
        this.h = x;
        return this.labeler;
    };
    ;
    AlgorithmWorker.label = function (x) {
        // users insert label positions
        if (!arguments.length)
            return this.lab;
        this.lab = x;
        return this.labeler;
    };
    ;
    AlgorithmWorker.anchor = function (x) {
        // users insert anchor positions
        if (!arguments.length)
            return this.anc;
        this.anc = x;
        return this.labeler;
    };
    ;
    AlgorithmWorker.lab = [];
    AlgorithmWorker.anc = [];
    AlgorithmWorker.w = 1; // box width
    AlgorithmWorker.h = 1; // box width
    AlgorithmWorker.max_move = 5.0;
    AlgorithmWorker.max_angle = 0.5;
    AlgorithmWorker.acc = 0;
    AlgorithmWorker.rej = 0;
    // weights
    AlgorithmWorker.w_len = 0.2; // leader line length 
    AlgorithmWorker.w_inter = 1.0; // leader line intersection
    AlgorithmWorker.w_lab2 = 30.0; // label-label overlap
    AlgorithmWorker.w_lab_anc = 30.0; // label-anchor overlap
    AlgorithmWorker.w_orient = 3.0; // orientation bias
    // booleans for user defined functions
    AlgorithmWorker.user_energy = false;
    AlgorithmWorker.user_schedule = false;
    AlgorithmWorker.dataResponse = [];
    return AlgorithmWorker;
}());



/***/ }),

/***/ "./src/worker/app-workers/app.workers.ts":
/*!***********************************************!*\
  !*** ./src/worker/app-workers/app.workers.ts ***!
  \***********************************************/
/*! exports provided: AppWorkers */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppWorkers", function() { return AppWorkers; });
/* harmony import */ var _algorithm_worker__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./algorithm.worker */ "./src/worker/app-workers/algorithm.worker.ts");
/* harmony import */ var _shared_worker_message_model__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./shared/worker-message.model */ "./src/worker/app-workers/shared/worker-message.model.ts");
/* harmony import */ var _shared_worker_topic_constants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./shared/worker-topic.constants */ "./src/worker/app-workers/shared/worker-topic.constants.ts");



var AppWorkers = /** @class */ (function () {
    function AppWorkers(workerCtx) {
        this.workerCtx = workerCtx;
        this.created = new Date();
    }
    AppWorkers.prototype.workerBroker = function ($event) {
        var _a = $event.data, topic = _a.topic, data = _a.data;
        var workerMessage = new _shared_worker_message_model__WEBPACK_IMPORTED_MODULE_1__["WorkerMessage"](topic, data);
        switch (topic) {
            case _shared_worker_topic_constants__WEBPACK_IMPORTED_MODULE_2__["WORKER_TOPIC"].cpuIntensive:
                this.returnWorkResults(_algorithm_worker__WEBPACK_IMPORTED_MODULE_0__["AlgorithmWorker"].doWork(workerMessage));
                break;
            default: // Add support for other workers here
                console.error('Topic Does Not Match');
        }
    };
    AppWorkers.prototype.returnWorkResults = function (message) {
        this.workerCtx.postMessage(message);
    };
    return AppWorkers;
}());



/***/ }),

/***/ "./src/worker/app-workers/shared/worker-message.model.ts":
/*!***************************************************************!*\
  !*** ./src/worker/app-workers/shared/worker-message.model.ts ***!
  \***************************************************************/
/*! exports provided: WorkerMessage */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WorkerMessage", function() { return WorkerMessage; });
var WorkerMessage = /** @class */ (function () {
    function WorkerMessage(topic, data) {
        this.topic = topic;
        this.data = data;
    }
    WorkerMessage.getInstance = function (value) {
        var topic = value.topic, data = value.data;
        return new WorkerMessage(topic, data);
    };
    return WorkerMessage;
}());



/***/ }),

/***/ "./src/worker/app-workers/shared/worker-topic.constants.ts":
/*!*****************************************************************!*\
  !*** ./src/worker/app-workers/shared/worker-topic.constants.ts ***!
  \*****************************************************************/
/*! exports provided: WORKER_TOPIC */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WORKER_TOPIC", function() { return WORKER_TOPIC; });
var WORKER_TOPIC = {
    cpuIntensive: 'cupIntensive',
};


/***/ }),

/***/ "./src/worker/main.worker.ts":
/*!***********************************!*\
  !*** ./src/worker/main.worker.ts ***!
  \***********************************/
/*! exports provided: worker */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "worker", function() { return worker; });
/* harmony import */ var _app_workers_app_workers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./app-workers/app.workers */ "./src/worker/app-workers/app.workers.ts");

var worker = new _app_workers_app_workers__WEBPACK_IMPORTED_MODULE_0__["AppWorkers"](self);
addEventListener('message', function ($event) {
    worker.workerBroker($event);
});


/***/ }),

/***/ 0:
/*!*****************************************!*\
  !*** multi ./src/worker/main.worker.ts ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! ./src/worker/main.worker.ts */"./src/worker/main.worker.ts");


/***/ })

/******/ });