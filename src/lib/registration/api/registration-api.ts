import TransactionsBuilder = require('../../service/transactions-builder');
import PermissionsDictionary = require('../../dictionary/permissions-dictionary');
import EosClient = require('../../common/client/eos-client');
import Brainkey = require('../../common/services/brainkey');
import EosCryptoService = require('../../common/services/eos-crypto-service');
import AccountNameService = require('../../common/services/account-name-service');
import SmartContractsDictionary = require('../../dictionary/smart-contracts-dictionary');
import SmartContractsActionsDictionary = require('../../dictionary/smart-contracts-actions-dictionary');
import ActionResourcesDictionary = require('../../dictionary/action-resources-dictionary');
import SocialKeyApi = require('../../social-key/api/social-key-api');

class RegistrationApi {
  public static generateRandomDataForRegistration(options: any = {}) {
    const brainKey = Brainkey.generateSimple();

    const { privateKey: ownerPrivateKey, publicKey: ownerPublicKey } =
      EosCryptoService.getKeyPartsFromParentPrivateKey(brainKey);

    const { privateKey: activePrivateKey, publicKey: activePublicKey } =
      EosCryptoService.getKeyPartsFromParentPrivateKey(ownerPrivateKey);

    const { privateKey: socialPrivateKey, publicKey: socialPublicKey } =
        SocialKeyApi.generateSocialKeyFromActivePrivateKey(activePrivateKey);

    const accountName = AccountNameService.createRandomAccountName();

    let keyToSign = activePrivateKey;
    if (options.signBySocial) {
      keyToSign = socialPrivateKey;
    }

    const sign = EosCryptoService.signValue(accountName, keyToSign);

    return {
      accountName,

      brainKey,

      ownerPrivateKey,
      ownerPublicKey,

      activePrivateKey,
      activePublicKey,

      socialPrivateKey,
      socialPublicKey,

      sign,
    };
  }

  public static async createNewAccountInBlockchain(
    accountCreatorName: string,
    accountCreatorPrivateKey: string,
    newAccountName: string,
    ownerPubKey: string,
    activePubKey: string,
    isMultiSignature: boolean = false,
  ) {
    const authorization = TransactionsBuilder.getSingleUserAuthorization(
      accountCreatorName,
      PermissionsDictionary.active(),
    );

    const actions = [{
      account:  SmartContractsDictionary.eosIo(),
      name:     SmartContractsActionsDictionary.newAccount(),
      authorization,
      data: {
        creator: accountCreatorName,
        name:    newAccountName,
        owner: {
          threshold: 1,
          keys: [{
            key: ownerPubKey,
            weight: 1,
          }],
          accounts: [],
          waits: [],
        },
        active: {
          threshold: 1,
          keys: [{
            key: activePubKey,
            weight: 1,
          }],
          accounts: [],
          waits: [],
        },
      },
    },
    {
      account: SmartContractsDictionary.eosIo(),
      name: SmartContractsActionsDictionary.buyRamBytes(),
      authorization,
      data: {
        payer:    accountCreatorName,
        receiver: newAccountName,
        bytes:    isMultiSignature ? ActionResourcesDictionary.basicResourceRamForMultiSignature() : ActionResourcesDictionary.basicResourceRam(),
      },
    },
    {
      account:  SmartContractsDictionary.eosIo(),
      name:     SmartContractsActionsDictionary.delegateBw(),
      authorization,
      data: {
        from: accountCreatorName,
        receiver: newAccountName,
        stake_net_quantity: ActionResourcesDictionary.basicResourceNetTokens(),
        stake_cpu_quantity: ActionResourcesDictionary.basicResourceCpuTokens(),
        transfer: false,
      },
    }];

    return EosClient.sendTransaction(accountCreatorPrivateKey, actions);
  }
}

export = RegistrationApi;
