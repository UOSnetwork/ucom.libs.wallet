"use strict";
const SOCIAL_ACTION = 'socialaction';
const VOTE_FOR_CALCULATORS = 'votecalc';
class SmartContractsActionsDictionary {
    static socialAction() {
        return SOCIAL_ACTION;
    }
    static voteForCalculators() {
        return VOTE_FOR_CALCULATORS;
    }
}
module.exports = SmartContractsActionsDictionary;
