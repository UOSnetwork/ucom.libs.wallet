const TRUST = 'trust';
const UNTRUST = 'untrust';

const REFERRAL = 'referral';

const CREATE_MEDIA_POST_FROM_ACCOUNT      = 'create_media_post_from_account';
const CREATE_MEDIA_POST_FROM_ORGANIZATION = 'create_media_post_from_organization';

class InteractionsDictionary {
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

  public static createMediaPostFromOrganization(): string {
    return CREATE_MEDIA_POST_FROM_ORGANIZATION;
  }
}

export = InteractionsDictionary;
