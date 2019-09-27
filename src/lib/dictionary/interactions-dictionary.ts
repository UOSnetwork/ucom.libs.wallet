class InteractionsDictionary {
  public static upvote(): string {
    return 'upvote';
  }

  public static downvote(): string {
    return 'downvote';
  }

  public static referral(): string {
    return 'referral';
  }

  public static trust(): string {
    return 'trust';
  }

  public static untrust(): string {
    return 'untrust';
  }

  public static followToAccount(): string {
    return 'follow_to_account';
  }

  public static unfollowToAccount(): string {
    return 'unfollow_to_account';
  }

  public static followToOrganization(): string {
    return 'follow_to_organization';
  }

  public static unfollowToOrganization(): string {
    return 'unfollow_to_organization';
  }

  public static createMediaPostFromAccount(): string {
    return 'create_media_post_from_account';
  }

  public static updateMediaPostFromAccount(): string {
    return 'update_media_post_from_account';
  }

  public static createMediaPostFromOrganization(): string {
    return 'create_media_post_from_organization';
  }

  public static updateMediaPostFromOrganization(): string {
    return 'update_media_post_from_organization';
  }

  public static createDirectPostForAccount(): string {
    return 'create_direct_post_from_account_to_account';
  }

  public static updateDirectPostForAccount(): string {
    return 'update_direct_post_from_account_to_account';
  }

  public static createDirectPostForOrganization(): string {
    return 'create_direct_post_from_account_to_organization';
  }

  public static updateDirectPostForOrganization(): string {
    return 'update_direct_post_from_account_to_organization';
  }

  public static createRepostFromAccount(): string {
    return 'create_repost_from_account';
  }

  public static createAutoUpdatePostFromAccount(): string {
    return 'create_auto_update_post_from_account';
  }

  public static createCommentFromAccount(): string {
    return 'create_comment_from_account';
  }

  public static createCommentFromOrganization(): string {
    return 'create_comment_from_organization';
  }

  public static updateCommentFromAccount(): string {
    return 'update_comment_from_account';
  }

  public static updateCommentFromOrganization(): string {
    return 'update_comment_from_organization';
  }

  public static createOrganization(): string {
    return 'create_organization';
  }

  public static updateOrganization(): string {
    return 'update_organization';
  }
}

export = InteractionsDictionary;
