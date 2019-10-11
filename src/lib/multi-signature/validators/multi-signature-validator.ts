import ActionResourcesDictionary = require('../../dictionary/action-resources-dictionary');
import WalletApi = require('../../wallet/api/wallet-api');
import BlockchainRegistry = require('../../blockchain-registry');

export class MultiSignatureValidator {
  public static async validateCreation(authorAccountName: string, multiSignatureAccountName: string): Promise<void> {
    const ram = ActionResourcesDictionary.basicResourceRam();
    const net = ActionResourcesDictionary.basicResourceNetTokensNumber();
    const cpu = ActionResourcesDictionary.basicResourceCpuTokensNumber();

    const existing = await WalletApi.getRawAccountData(multiSignatureAccountName);

    if (existing !== null) {
      throw new TypeError(`Provided account name = ${multiSignatureAccountName} is occupied.`);
    }

    const balance = await WalletApi.getAccountUosBalance(authorAccountName);

    if ((cpu + net) > balance) {
      throw new TypeError(`To register account you need ${cpu} tokens for CPU and ${net} tokens for NET. But you have only ${balance}`);
    }

    await BlockchainRegistry.isEnoughRamOrException(authorAccountName, ram);
  }
}
