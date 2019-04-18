import SmartContractsDictionary = require('../dictionary/smart-contracts-dictionary');
import SmartContractsActionsDictionary = require('../dictionary/smart-contracts-actions-dictionary');
import TransactionBuilder = require('./transactions-builder');

class ActionsService {
  public static getVoteForCalculators(
    accountNameFrom: string,
    nodeTitles: string[],
    proxy: string = '',
  ): any {
    const smartContract = SmartContractsDictionary.eosIo();
    const actionName    = SmartContractsActionsDictionary.voteForCalculators();

    const data = {
      proxy,
      voter: accountNameFrom,
      calculators: nodeTitles,
    };

    return TransactionBuilder.getSingleUserAction(accountNameFrom, smartContract, actionName, data);
  }
}

export = ActionsService;
