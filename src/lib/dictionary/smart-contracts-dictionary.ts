const UOS_ACTIVITY = 'uos.activity';
const TST_ACTIVITY = 'tst.activity';

const EOS_IO = 'eosio';

class SmartContractsDictionary {
  public static uosActivity(): string {
    return UOS_ACTIVITY;
  }

  public static eosIo(): string {
    return EOS_IO;
  }

  public static tstActivity(): string {
    return TST_ACTIVITY;
  }
}

export = SmartContractsDictionary;
