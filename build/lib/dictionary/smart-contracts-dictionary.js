"use strict";
const UOS_ACTIVITY = 'uos.activity';
const TST_ACTIVITY = 'tst.activity';
const UOS_ACCOUNT_INFO = 'uaccountinfo';
const EOS_IO = 'eosio';
const TABLE_NAME__VOTERS = 'voters';
const TABLE_NAME__CALCULATORS_VOTERS = 'calcvoters';
const TABLE_NAME__CALCULATORS = 'calculators';
const TABLE_NAME__ACCOUNT_PROFILE = 'accprofile';
class SmartContractsDictionary {
    static accountProfileTableName() {
        return TABLE_NAME__ACCOUNT_PROFILE;
    }
    static votersTableName() {
        return TABLE_NAME__VOTERS;
    }
    static calculatorsVotersTableName() {
        return TABLE_NAME__CALCULATORS_VOTERS;
    }
    static calculatorsTableName() {
        return TABLE_NAME__CALCULATORS;
    }
    static uosActivity() {
        return UOS_ACTIVITY;
    }
    static uosAccountInfo() {
        return UOS_ACCOUNT_INFO;
    }
    static eosIo() {
        return EOS_IO;
    }
    static tstActivity() {
        return TST_ACTIVITY;
    }
}
module.exports = SmartContractsDictionary;
