"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = require("../../src/base/service");
class check extends service_1.Service {
    index() {
        return 1 + 2;
    }
}
exports.default = check;
