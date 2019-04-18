"use strict";
const UOS_ACTIVITY = 'uos.activity';
const TST_ACTIVITY = 'tst.activity';
const EOS_IO = 'eosio';
class SmartContractsDictionary {
    static uosActivity() {
        return UOS_ACTIVITY;
    }
    static eosIo() {
        return EOS_IO;
    }
    static tstActivity() {
        return TST_ACTIVITY;
    }
}
module.exports = SmartContractsDictionary;
