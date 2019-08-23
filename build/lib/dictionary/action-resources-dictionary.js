"use strict";
class ActionResourcesDictionary {
    static UOS() {
        return 'UOS';
    }
    static basicResourceRam() {
        return 8192;
    }
    static basicResourceCpuTokens() {
        return `1.0000 ${this.UOS()}`;
    }
    static basicResourceNetTokens() {
        return `1.0000 ${this.UOS()}`;
    }
}
module.exports = ActionResourcesDictionary;
