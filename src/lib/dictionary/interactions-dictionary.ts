const TRUST = 'trust';
const UNTRUST = 'untrust';

const REFERRAL = 'referral';

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
}

export = InteractionsDictionary;
