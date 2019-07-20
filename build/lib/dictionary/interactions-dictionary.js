"use strict";
const TRUST = 'trust';
const UNTRUST = 'untrust';
const REFERRAL = 'referral';
const CREATE_MEDIA_POST_FROM_ACCOUNT = 'create_media_post_from_account';
const CREATE_MEDIA_POST_FROM_ORGANIZATION = 'create_media_post_from_organization';
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
    static createMediaPostFromAccount() {
        return CREATE_MEDIA_POST_FROM_ACCOUNT;
    }
    static createMediaPostFromOrganization() {
        return CREATE_MEDIA_POST_FROM_ORGANIZATION;
    }
}
module.exports = InteractionsDictionary;
