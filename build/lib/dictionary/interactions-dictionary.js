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
const CREATE_DIRECT_POST_FOR_ACCOUNT = 'create_direct_post_from_account_to_account';
const CREATE_DIRECT_POST_FOR_ORGANIZATION = 'create_direct_post_from_account_to_organization';
const UPDATE_DIRECT_POST_FOR_ACCOUNT = 'update_direct_post_from_account_to_account';
const UPDATE_DIRECT_POST_FOR_ORGANIZATION = 'update_direct_post_from_account_to_organization';
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
    static createDirectPostForAccount() {
        return CREATE_DIRECT_POST_FOR_ACCOUNT;
    }
    static updateDirectPostForAccount() {
        return UPDATE_DIRECT_POST_FOR_ACCOUNT;
    }
    static createDirectPostForOrganization() {
        return CREATE_DIRECT_POST_FOR_ORGANIZATION;
    }
    static updateDirectPostForOrganization() {
        return UPDATE_DIRECT_POST_FOR_ORGANIZATION;
    }
}
module.exports = InteractionsDictionary;
