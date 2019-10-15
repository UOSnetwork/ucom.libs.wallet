"use strict";
const currency_dictionary_1 = require("./currency-dictionary");
class ActionResourcesDictionary {
    static basicResourceRam() {
        return 8192;
    }
    static basicResourceNetTokensNumber() {
        return 1;
    }
    static basicResourceCpuTokensNumber() {
        return 1;
    }
    static basicResourceCpuTokens() {
        return `${this.basicResourceCpuTokensNumber()}.0000 ${currency_dictionary_1.UOS}`;
    }
    static basicResourceNetTokens() {
        return `${this.basicResourceNetTokensNumber()}.0000 ${currency_dictionary_1.UOS}`;
    }
}
module.exports = ActionResourcesDictionary;
