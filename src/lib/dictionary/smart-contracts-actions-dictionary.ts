const SOCIAL_ACTION         = 'socialaction';
const VOTE_FOR_CALCULATORS  = 'votecalc';
const SET_PROFILE           = 'setprofile';

class SmartContractsActionsDictionary {
  public static setProfile(): string {
    return SET_PROFILE;
  }

  public static socialAction(): string {
    return SOCIAL_ACTION;
  }

  public static voteForCalculators(): string {
    return VOTE_FOR_CALCULATORS;
  }
}

export = SmartContractsActionsDictionary;
