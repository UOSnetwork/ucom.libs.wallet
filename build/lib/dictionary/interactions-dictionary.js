"use strict";
class InteractionsDictionary {
    static upvote() {
        return 'upvote';
    }
    static downvote() {
        return 'downvote';
    }
    static referral() {
        return 'referral';
    }
    static trust() {
        return 'trust';
    }
    static untrust() {
        return 'untrust';
    }
    static followToAccount() {
        return 'follow_to_account';
    }
    static unfollowToAccount() {
        return 'unfollow_to_account';
    }
    static followToOrganization() {
        return 'follow_to_organization';
    }
    static unfollowToOrganization() {
        return 'unfollow_to_organization';
    }
    static createMediaPostFromAccount() {
        return 'create_media_post_from_account';
    }
    static updateMediaPostFromAccount() {
        return 'update_media_post_from_account';
    }
    static createMediaPostFromOrganization() {
        return 'create_media_post_from_organization';
    }
    static updateMediaPostFromOrganization() {
        return 'update_media_post_from_organization';
    }
    static createDirectPostForAccount() {
        return 'create_direct_post_from_account_to_account';
    }
    static updateDirectPostForAccount() {
        return 'update_direct_post_from_account_to_account';
    }
    static createDirectPostForOrganization() {
        return 'create_direct_post_from_account_to_organization';
    }
    static updateDirectPostForOrganization() {
        return 'update_direct_post_from_account_to_organization';
    }
    static createRepostFromAccount() {
        return 'create_repost_from_account';
    }
    static createAutoUpdatePostFromAccount() {
        return 'create_auto_update_post_from_account';
    }
    static createCommentFromAccount() {
        return 'create_comment_from_account';
    }
    static createCommentFromOrganization() {
        return 'create_comment_from_organization';
    }
    static updateCommentFromAccount() {
        return 'update_comment_from_account';
    }
    static updateCommentFromOrganization() {
        return 'update_comment_from_organization';
    }
    static createOrganization() {
        return 'create_organization';
    }
    static updateOrganization() {
        return 'update_organization';
    }
}
module.exports = InteractionsDictionary;
