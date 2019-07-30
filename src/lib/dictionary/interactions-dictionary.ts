const TRUST = 'trust';
const UNTRUST = 'untrust';

const REFERRAL = 'referral';

const CREATE_MEDIA_POST_FROM_ACCOUNT      = 'create_media_post_from_account';
const CREATE_MEDIA_POST_FROM_ORGANIZATION = 'create_media_post_from_organization';

const UPDATE_MEDIA_POST_FROM_ACCOUNT      = 'update_media_post_from_account';
const UPDATE_MEDIA_POST_FROM_ORGANIZATION = 'update_media_post_from_organization';

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
}

export = InteractionsDictionary;
