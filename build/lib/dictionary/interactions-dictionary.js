"use strict";
const TRUST = 'trust';
const UNTRUST = 'untrust';
const FOLLOW_TO_ACCOUNT = 'follow_to_account';
const UNFOLLOW_TO_ACCOUNT = 'unfollow_to_account';
const FOLLOW_TO_ORGANIZATION = 'follow_to_organization';
const UNFOLLOW_TO_ORGANIZATION = 'unfollow_to_organization';
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
    static followToAccount() {
        return FOLLOW_TO_ACCOUNT;
    }
    static unfollowToAccount() {
        return UNFOLLOW_TO_ACCOUNT;
    }
    static followToOrganization() {
        return FOLLOW_TO_ORGANIZATION;
    }
    static unfollowToOrganization() {
        return UNFOLLOW_TO_ORGANIZATION;
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
