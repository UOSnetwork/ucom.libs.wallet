"use strict";
const UOS_ACTIVITY = 'uos.activity';
const TST_ACTIVITY = 'tst.activity';
class SmartContractsDictionary {
    /**
     *
     * @returns {string}
     */
    static uosActivity() {
        return UOS_ACTIVITY;
    }
    /**
     *
     * @returns {string}
     */
    static tstActivity() {
        return TST_ACTIVITY;
    }
}
module.exports = SmartContractsDictionary;
