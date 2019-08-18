"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const uniqid_1 = __importDefault(require("uniqid"));
class ContentIdGenerator {
    static getForMediaPost() {
        return this.getUniqId('pstms');
    }
    static getForDirectPost() {
        return this.getUniqId('pstdr');
    }
    static getForRepost() {
        return this.getUniqId('pstrp');
    }
    static getForComment() {
        return this.getUniqId('cmmnt');
    }
    static getForOrganization() {
        return this.getUniqId('org');
    }
    static getUniqId(uniqIdPrefix) {
        return uniqid_1.default(`${uniqIdPrefix}-`);
    }
}
module.exports = ContentIdGenerator;
