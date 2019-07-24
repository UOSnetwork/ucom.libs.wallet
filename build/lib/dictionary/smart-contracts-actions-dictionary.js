"use strict";
const SOCIAL_ACTION = 'socialactndt';
const HISTORICAL_SOCIAL_ACTION = 'histactndt';
const VOTE_FOR_CALCULATORS = 'votecalc';
const SET_PROFILE = 'setprofile';
class SmartContractsActionsDictionary {
    static setProfile() {
        return SET_PROFILE;
    }
    static socialAction() {
        return SOCIAL_ACTION;
    }
    static historicalSocialAction() {
        return HISTORICAL_SOCIAL_ACTION;
    }
    static voteForCalculators() {
        return VOTE_FOR_CALCULATORS;
    }
}
module.exports = SmartContractsActionsDictionary;
