"use strict";
const TRUST = 'trust';
const UNTRUST = 'untrust';
const REFERRAL = 'referral';
const CREATE_MEDIA_POST_FROM_ACCOUNT = 'create_media_post_from_account';
const CREATE_MEDIA_POST_FROM_ORGANIZATION = 'create_media_post_from_organization';
const UPDATE_MEDIA_POST_FROM_ACCOUNT = 'update_media_post_from_account';
const UPDATE_MEDIA_POST_FROM_ORGANIZATION = 'update_media_post_from_organization';
const UPVOTE = 'upvote';
const DOWNVOTE = 'downvote';
class InteractionsDictionary {
    static upvote() {
        return UPVOTE;
    }
    static downvote() {
        return DOWNVOTE;
    }
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
    static updateMediaPostFromAccount() {
        return UPDATE_MEDIA_POST_FROM_ACCOUNT;
    }
    static createMediaPostFromOrganization() {
        return CREATE_MEDIA_POST_FROM_ORGANIZATION;
    }
    static updateMediaPostFromOrganization() {
        return UPDATE_MEDIA_POST_FROM_ORGANIZATION;
    }
}
module.exports = InteractionsDictionary;
