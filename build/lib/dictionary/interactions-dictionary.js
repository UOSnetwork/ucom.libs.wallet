"use strict";
const TRUST = 'trust';
const UNTRUST = 'untrust';
const REFERRAL = 'referral';
class InteractionsDictionary {
    static referral() {
        return REFERRAL;
    }
    static trust() {
        return TRUST;
    }
    static untrust() {
        return UNTRUST;
    }
}
module.exports = InteractionsDictionary;
