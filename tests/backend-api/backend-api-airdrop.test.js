const { BackendApi, EosClient, WalletApi }       = require('../../index');

const helper = require('../helper');
const NumbersHelper = require('../helpers/common/numbers-helper');
const TransactionsPushResponseChecker = require('../helpers/common/transactions-push-response-checker');

const internalServiceErrorPattern   = new RegExp('Internal Service Error');

const JEST_TIMEOUT = 10000;

describe('Backend API airdrop', () => {
  helper.initForStagingEnv();

  const accountNameFrom = helper.getAirdropAccountName();
  const privateKey      = helper.getAirdropAccountPrivateKey();
  const permission      = 'active';

  describe('Positive', () => {
    it('Send correct airdrop transaction - all values are unique', async () => {
      const externalId = NumbersHelper.generateRandomInteger(1000000, 10000000);
      const airdropId = NumbersHelper.generateRandomInteger(1000000, 10000000);
      const amountInMinor = 20001;
      const accountNameTo = 'summerknight';
      const symbol = 'UOSTEST';

      const data = {
        symbol,
        external_id: externalId,
        airdrop_id: airdropId,
        amount: amountInMinor,
        acc_name: accountNameTo,
      };

      const signed = await BackendApi.getSignedAirdropTransaction(
        accountNameFrom,
        privateKey,
        permission,

        externalId,
        airdropId,
        accountNameTo,
        amountInMinor,
        symbol,
      );

      const response = await EosClient.pushTransaction(signed);

      const expected = getSamplePushResponse(data);
      TransactionsPushResponseChecker.checkOneTransaction(response, expected);
    }, JEST_TIMEOUT);

    it('Also send different token symbol', async () => {
      const externalId = NumbersHelper.generateRandomInteger(1000000, 10000000);
      const airdropId = NumbersHelper.generateRandomInteger(1000000, 10000000);
      const amountInMinor = 20001;
      const accountNameTo = 'summerknight';
      const symbol = 'GHTEST';

      const data = {
        symbol,
        external_id: externalId,
        airdrop_id: airdropId,
        amount: amountInMinor,
        acc_name: accountNameTo,
      };

      const signed = await BackendApi.getSignedAirdropTransaction(
        accountNameFrom,
        privateKey,
        permission,

        externalId,
        airdropId,
        accountNameTo,
        amountInMinor,
        symbol,
      );

      const response = await EosClient.pushTransaction(signed);

      const expected = getSamplePushResponse(data);
      TransactionsPushResponseChecker.checkOneTransaction(response, expected);
    }, JEST_TIMEOUT);

    it('Send correct airdrop transaction - airdrop value is not unique globally but is unique for the given user', async () => {
      const externalId = NumbersHelper.generateRandomInteger(1000000, 10000000);
      const airdropId = NumbersHelper.generateRandomInteger(1000000, 10000000);
      const amountInMinor = 20001;
      const accountNameTo = 'vlad';
      const symbol = 'UOSTEST';

      const data = {
        symbol,
        external_id: externalId,
        airdrop_id: airdropId,
        amount: amountInMinor,
        acc_name: accountNameTo,
      };

      const signed = await BackendApi.getSignedAirdropTransaction(
        accountNameFrom,
        privateKey,
        permission,

        externalId,
        airdropId,
        accountNameTo,
        amountInMinor,
        symbol,
      );

      const response = await EosClient.pushTransaction(signed);

      const expected = getSamplePushResponse(data);
      TransactionsPushResponseChecker.checkOneTransaction(response, expected);

      const janeExternalId = NumbersHelper.generateRandomInteger(1000000, 10000000);
      const janeAccountNameTo = 'jane';

      const janeData = {
        symbol,
        external_id: janeExternalId,
        airdrop_id: airdropId, // same as for vlad
        amount: amountInMinor, // same as for vlad
        acc_name: janeAccountNameTo,
      };

      const janeSigned = await BackendApi.getSignedAirdropTransaction(
        accountNameFrom,
        privateKey,
        permission,

        janeExternalId,
        airdropId,
        janeAccountNameTo,
        amountInMinor,
        symbol,
      );

      const janeResponse = await EosClient.pushTransaction(janeSigned);

      const janeExpected = getSamplePushResponse(janeData);
      TransactionsPushResponseChecker.checkOneTransaction(janeResponse, janeExpected);
    }, JEST_TIMEOUT);
  });

  describe('Negative', () => {
    it('Send duplicate external ID', async () => {
      const externalId = 111; // existing. Is set manually
      const airdropId = NumbersHelper.generateRandomInteger(1, 1000000);
      const amountInMinor = 20001;
      const accountNameTo = 'jane';
      const symbol = 'UOSTEST';

      const signed = await BackendApi.getSignedAirdropTransaction(
        accountNameFrom,
        privateKey,
        permission,

        externalId,
        airdropId,
        accountNameTo,
        amountInMinor,
        symbol,
      );

      await expect(EosClient.pushTransaction(signed)).rejects.toThrow(internalServiceErrorPattern)
    });

    it('Send duplicate airdrop ID', async () => {
      const externalId = NumbersHelper.generateRandomInteger(1, 1000000);
      const airdropId = 14;
      const amountInMinor = 20001;
      const accountNameTo = 'vlad';
      const symbol = 'UOSTEST';

      const signed = await BackendApi.getSignedAirdropTransaction(
        accountNameFrom,
        privateKey,
        permission,

        externalId,
        airdropId,
        accountNameTo,
        amountInMinor,
        symbol,
      );

      await expect(EosClient.pushTransaction(signed)).rejects.toThrow(internalServiceErrorPattern)
    });
  });

  it('Get table rows', async () => {
    /*
      get_table_rows:
        * allow batching - 0.5
      * allow setting index key - 0.5
      * autotests - 0.5
      * remember the sample output to use inside backend autotests - 0.25

      Publish - 0.5h

    {
      "scope":"testairdrop1",
      "code":"testairdrop1",
      "table":"receipt",
      "json":"true",
      "limit": 1000,
      "lower_bound": 111,
      "index_position": "2",
      "key_type": "i64"
    }
     */

    helper.initForStagingEnv();

    const smartContract = 'testairdrop1';
    const scope = 'testairdrop1';
    const table = 'receipt';

    let res;
    try {
      res = await EosClient.getJsonTableRows(smartContract, scope, table, 100);
    } catch (error) {
      const a = 0;
    }


    const a = 0;

  }, JEST_TIMEOUT * 100);
});


function getSamplePushResponse(data) {
  return {
    "producer_block_id": null,
    "scheduled": false,
    "action_traces": [
      {
        "receipt": {
          "receiver": "testairdrop1",
        },
        "act": {
          "account": "testairdrop1",
          "name": "send",
          "authorization": [
            {
              "actor": "testairdrop1",
              "permission": "active"
            }
          ],
          data,
        },
        "context_free": false,
        "producer_block_id": null,
      }
    ],
    "except": null
  }
}
