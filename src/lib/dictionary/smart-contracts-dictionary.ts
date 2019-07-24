const UOS_ACTIVITY          = 'uos.activity';
const TST_ACTIVITY          = 'tst.activity';
const UOS_ACCOUNT_INFO      = 'uaccountinfo';

const EOS_IO = 'eosio';
const TABLE_NAME__VOTERS                = 'voters';
const TABLE_NAME__CALCULATORS_VOTERS    = 'calcvoters';
const TABLE_NAME__CALCULATORS           = 'calculators';
const TABLE_NAME__ACCOUNT_PROFILE       = 'accprofile';

const HISTORICAL_SENDER_ACCOUNT_NAME = 'uoshistorian';

class SmartContractsDictionary {
  public static historicalSenderAccountName(): string {
    return HISTORICAL_SENDER_ACCOUNT_NAME;
  }

  public static accountProfileTableName(): string {
    return TABLE_NAME__ACCOUNT_PROFILE;
  }

  public static votersTableName(): string {
    return TABLE_NAME__VOTERS;
  }

  public static calculatorsVotersTableName(): string {
    return TABLE_NAME__CALCULATORS_VOTERS;
  }

  public static calculatorsTableName(): string {
    return TABLE_NAME__CALCULATORS;
  }

  public static uosActivity(): string {
    return UOS_ACTIVITY;
  }

  public static uosAccountInfo(): string {
    return UOS_ACCOUNT_INFO;
  }

  public static eosIo(): string {
    return EOS_IO;
  }

  public static tstActivity(): string {
    return TST_ACTIVITY;
  }
}

export = SmartContractsDictionary;
