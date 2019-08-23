class SmartContractsDictionary {
  public static historicalSenderAccountName(): string {
    return 'uoshistorian';
  }

  public static accountProfileTableName(): string {
    return 'accprofile';
  }

  public static votersTableName(): string {
    return 'voters';
  }

  public static calculatorsVotersTableName(): string {
    return 'calcvoters';
  }

  public static calculatorsTableName(): string {
    return 'calculators';
  }

  public static uosActivity(): string {
    return 'uos.activity';
  }

  public static uosAccountInfo(): string {
    return 'uaccountinfo';
  }

  public static eosIo(): string {
    return 'eosio';
  }

  public static tstActivity(): string {
    return 'tst.activity';
  }
}

export = SmartContractsDictionary;
