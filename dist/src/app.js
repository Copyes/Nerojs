"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cluster_1 = __importDefault(require("cluster"));
const core_1 = require("./core");
if (cluster_1.default.isMaster) {
    const numWorkers = require('os').cpus().length;
    console.log('Master cluster setting up ' + numWorkers + ' workers...');
    for (var i = 0; i < numWorkers; i++) {
        cluster_1.default.fork();
    }
    cluster_1.default.on('online', function (worker) {
        console.log('Worker ' + worker.process.pid + ' is online');
    });
    cluster_1.default.on('exit', function (worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        cluster_1.default.fork();
    });
}
else {
    const app = new core_1.Nero;
    app.run(() => {
        console.log('server has been started');
    });
}
