"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const uniqid_1 = __importDefault(require("uniqid"));
class ContentIdGenerator {
    static getForMediaPost() {
        const uniqIdPrefix = 'pstms';
        return uniqid_1.default(`${uniqIdPrefix}-`);
    }
}
module.exports = ContentIdGenerator;
