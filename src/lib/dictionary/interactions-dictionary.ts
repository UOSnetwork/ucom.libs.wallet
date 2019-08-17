const TRUST = 'trust';
const UNTRUST = 'untrust';

const FOLLOW_TO_ACCOUNT   = 'follow_to_account';
const UNFOLLOW_TO_ACCOUNT = 'unfollow_to_account';

const FOLLOW_TO_ORGANIZATION    = 'follow_to_organization';
const UNFOLLOW_TO_ORGANIZATION  = 'unfollow_to_organization';

const REFERRAL = 'referral';

const CREATE_MEDIA_POST_FROM_ACCOUNT      = 'create_media_post_from_account';
const CREATE_MEDIA_POST_FROM_ORGANIZATION = 'create_media_post_from_organization';

const UPDATE_MEDIA_POST_FROM_ACCOUNT      = 'update_media_post_from_account';
const UPDATE_MEDIA_POST_FROM_ORGANIZATION = 'update_media_post_from_organization';

const CREATE_DIRECT_POST_FOR_ACCOUNT      = 'create_direct_post_from_account_to_account';
const CREATE_DIRECT_POST_FOR_ORGANIZATION = 'create_direct_post_from_account_to_organization';

const UPDATE_DIRECT_POST_FOR_ACCOUNT      = 'update_direct_post_from_account_to_account';
const UPDATE_DIRECT_POST_FOR_ORGANIZATION = 'update_direct_post_from_account_to_organization';

const CREATE_REPOST_FROM_ACCOUNT          = 'create_repost_from_account';

const CREATE_COMMENT_FROM_ACCOUNT         = 'create_comment_from_account';
const CREATE_COMMENT_FROM_ORGANIZATION    = 'create_comment_from_organization';

const UPVOTE    = 'upvote';
const DOWNVOTE  = 'downvote';

class InteractionsDictionary {
  public static upvote(): string {
    return UPVOTE;
  }

  public static downvote(): string {
    return DOWNVOTE;
  }

  public static referral(): string {
    return REFERRAL;
  }

  public static trust(): string {
    return TRUST;
  }

  public static untrust(): string {
    return UNTRUST;
  }

  public static followToAccount(): string {
    return FOLLOW_TO_ACCOUNT;
  }

  public static unfollowToAccount(): string {
    return UNFOLLOW_TO_ACCOUNT;
  }

  public static followToOrganization(): string {
    return FOLLOW_TO_ORGANIZATION;
  }

  public static unfollowToOrganization(): string {
    return UNFOLLOW_TO_ORGANIZATION;
  }

  public static createMediaPostFromAccount(): string {
    return CREATE_MEDIA_POST_FROM_ACCOUNT;
  }

  public static updateMediaPostFromAccount(): string {
    return UPDATE_MEDIA_POST_FROM_ACCOUNT;
  }

  public static createMediaPostFromOrganization(): string {
    return CREATE_MEDIA_POST_FROM_ORGANIZATION;
  }

  public static updateMediaPostFromOrganization(): string {
    return UPDATE_MEDIA_POST_FROM_ORGANIZATION;
  }

  public static createDirectPostForAccount(): string {
    return CREATE_DIRECT_POST_FOR_ACCOUNT;
  }

  public static updateDirectPostForAccount(): string {
    return UPDATE_DIRECT_POST_FOR_ACCOUNT;
  }

  public static createDirectPostForOrganization(): string {
    return CREATE_DIRECT_POST_FOR_ORGANIZATION;
  }

  public static updateDirectPostForOrganization(): string {
    return UPDATE_DIRECT_POST_FOR_ORGANIZATION;
  }

  public static createRepostFromAccount(): string {
    return CREATE_REPOST_FROM_ACCOUNT;
  }

  public static createCommentFromAccount(): string {
    return CREATE_COMMENT_FROM_ACCOUNT;
  }

  public static createCommentFromOrganization(): string {
    return CREATE_COMMENT_FROM_ORGANIZATION;
  }
}

export = InteractionsDictionary;
