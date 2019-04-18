const SOCIAL_ACTION         = 'socialaction';
const VOTE_FOR_CALCULATORS  = 'votecalc';

class SmartContractsActionsDictionary {
  public static socialAction(): string {
    return SOCIAL_ACTION;
  }

  public static voteForCalculators(): string {
    return VOTE_FOR_CALCULATORS;
  }
}

export = SmartContractsActionsDictionary;
