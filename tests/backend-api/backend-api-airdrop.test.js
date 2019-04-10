const { BackendApi, EosClient }       = require('../../index');

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

  describe('Get airdrops receipt table rows', () => {
    it('Get table rows with regular pagination (via id)', async () => {
      helper.initForStagingEnv();

      const actual = await BackendApi.getAirdropsReceiptTableRows();
      const expected = getSampleAirdropsReceiptTableRows();

      for (let i = 0; i < expected.length; i += 1) {
        expect(actual[i]).toMatchObject(expected[i]);
      }
    }, JEST_TIMEOUT);

    it('Find a concrete record via external_id', async () => {
      helper.initForStagingEnv();

      const externalId = 3882236;
      const actual = await BackendApi.getOneAirdropReceiptRowByExternalId(externalId);
      const expected = {
        id: 13,
        external_id: 3882236,
        airdrop_id: 5104204,
        amount: 20001,
        acc_name: "jane",
        symbol: "UOSTEST"
      };

      expect(actual).toMatchObject(expected);
    }, JEST_TIMEOUT);

    it('Find receipt records from given external_id', async () => {
      helper.initForStagingEnv();

      const externalId = 275349;
      const actual = await BackendApi.getAirdropsReceiptTableRowsAfterExternalId(externalId, 10);
      const expected = getSampleAirdropsReceiptAfterExternalId();

      for (let i = 0; i < 4; i += 1) {
        expect(actual[i]).toMatchObject(expected[i]);
      }
    }, JEST_TIMEOUT);
  });
});


function getSampleAirdropsReceiptAfterExternalId() {
  return [
    {
      "id": 6,
      "external_id": 275349,
      "airdrop_id": 29947,
      "amount": 20001,
      "acc_name": "petr",
      "symbol": "UOSTEST"
    },
    {
      "id": 7,
      "external_id": 312965,
      "airdrop_id": 29947,
      "amount": 20001,
      "acc_name": "vlad",
      "symbol": "UOSTEST"
    },
    {
      "id": 5,
      "external_id": 470255,
      "airdrop_id": 618018,
      "amount": 20001,
      "acc_name": "jane",
      "symbol": "UOSTEST"
    },
    {
      "id": 9,
      "external_id": 958064,
      "airdrop_id": 587162,
      "amount": 20001,
      "acc_name": "jane",
      "symbol": "UOSTEST"
    },
    {
      "id": 8,
      "external_id": 988861,
      "airdrop_id": 587162,
      "amount": 20001,
      "acc_name": "vlad",
      "symbol": "UOSTEST"
    },
    {
      "id": 20,
      "external_id": 1119045,
      "airdrop_id": 1583784,
      "amount": 20001,
      "acc_name": "vlad",
      "symbol": "UOSTEST"
    },
    {
      "id": 17,
      "external_id": 1169432,
      "airdrop_id": 3714441,
      "amount": 20001,
      "acc_name": "jane",
      "symbol": "UOSTEST"
    },
    {
      "id": 25,
      "external_id": 1364080,
      "airdrop_id": 7464427,
      "amount": 20001,
      "acc_name": "jane",
      "symbol": "UOSTEST"
    },
    {
      "id": 27,
      "external_id": 2259812,
      "airdrop_id": 14781593,
      "amount": 30001,
      "acc_name": "jane",
      "symbol": "GHTEST"
    },
    {
      "id": 30,
      "external_id": 2807738,
      "airdrop_id": 3044321,
      "amount": 20001,
      "acc_name": "summerknight",
      "symbol": "UOSTEST"
    },
    {
      "id": 11,
      "external_id": 3008790,
      "airdrop_id": 1951188,
      "amount": 20001,
      "acc_name": "summerknight",
      "symbol": "GHTEST"
    },
    {
      "id": 29,
      "external_id": 3197937,
      "airdrop_id": 12807513,
      "amount": 30001,
      "acc_name": "jane",
      "symbol": "GHTEST"
    },
    {
      "id": 13,
      "external_id": 3882236,
      "airdrop_id": 5104204,
      "amount": 20001,
      "acc_name": "jane",
      "symbol": "UOSTEST"
    },
    {
      "id": 31,
      "external_id": 3991488,
      "airdrop_id": 9373946,
      "amount": 20001,
      "acc_name": "summerknight",
      "symbol": "GHTEST"
    },
    {
      "id": 16,
      "external_id": 4000336,
      "airdrop_id": 3714441,
      "amount": 20001,
      "acc_name": "vlad",
      "symbol": "UOSTEST"
    },
    {
      "id": 10,
      "external_id": 4324265,
      "airdrop_id": 4821544,
      "amount": 20001,
      "acc_name": "summerknight",
      "symbol": "UOSTEST"
    },
    {
      "id": 32,
      "external_id": 4464744,
      "airdrop_id": 2603820,
      "amount": 20001,
      "acc_name": "vlad",
      "symbol": "UOSTEST"
    },
    {
      "id": 12,
      "external_id": 4800357,
      "airdrop_id": 5104204,
      "amount": 20001,
      "acc_name": "vlad",
      "symbol": "UOSTEST"
    },
    {
      "id": 19,
      "external_id": 4936361,
      "airdrop_id": 7826972,
      "amount": 20001,
      "acc_name": "summerknight",
      "symbol": "GHTEST"
    },
    {
      "id": 28,
      "external_id": 5210779,
      "airdrop_id": 87218862,
      "amount": 30001,
      "acc_name": "jane",
      "symbol": "UOSTEST"
    },
    {
      "id": 33,
      "external_id": 5546471,
      "airdrop_id": 2603820,
      "amount": 20001,
      "acc_name": "jane",
      "symbol": "UOSTEST"
    },
    {
      "id": 18,
      "external_id": 5615020,
      "airdrop_id": 8085431,
      "amount": 20001,
      "acc_name": "summerknight",
      "symbol": "UOSTEST"
    },
    {
      "id": 24,
      "external_id": 5646349,
      "airdrop_id": 7464427,
      "amount": 20001,
      "acc_name": "vlad",
      "symbol": "UOSTEST"
    },
    {
      "id": 26,
      "external_id": 5676835,
      "airdrop_id": 41,
      "amount": 30001,
      "acc_name": "jane",
      "symbol": "GHTEST"
    },
    {
      "id": 21,
      "external_id": 6225753,
      "airdrop_id": 1583784,
      "amount": 20001,
      "acc_name": "jane",
      "symbol": "UOSTEST"
    },
    {
      "id": 14,
      "external_id": 6309138,
      "airdrop_id": 3345720,
      "amount": 20001,
      "acc_name": "summerknight",
      "symbol": "UOSTEST"
    },
    {
      "id": 23,
      "external_id": 9299101,
      "airdrop_id": 8072423,
      "amount": 20001,
      "acc_name": "summerknight",
      "symbol": "GHTEST"
    },
    {
      "id": 15,
      "external_id": 9392554,
      "airdrop_id": 2260179,
      "amount": 20001,
      "acc_name": "summerknight",
      "symbol": "GHTEST"
    },
    {
      "id": 22,
      "external_id": 9937582,
      "airdrop_id": 1882053,
      "amount": 20001,
      "acc_name": "summerknight",
      "symbol": "UOSTEST"
    }
  ];
}

function getSampleAirdropsReceiptTableRows() {
  return [
    {
      "id": 0,
      "external_id": 100,
      "airdrop_id": 12,
      "amount": 1,
      "acc_name": "vlad",
      "symbol": "UOSTEST"
    },
    {
      "id": 1,
      "external_id": 101,
      "airdrop_id": 13,
      "amount": 1,
      "acc_name": "vlad",
      "symbol": "UOSTEST"
    },
    {
      "id": 2,
      "external_id": 102,
      "airdrop_id": 12,
      "amount": 10001,
      "acc_name": "jane",
      "symbol": "UOSTEST"
    },
    {
      "id": 3,
      "external_id": 111,
      "airdrop_id": 14,
      "amount": 1,
      "acc_name": "vlad",
      "symbol": "UOSTEST"
    },
    {
      "id": 4,
      "external_id": 112,
      "airdrop_id": 14,
      "amount": 2001,
      "acc_name": "jane",
      "symbol": "UOSTEST"
    },
    {
      "id": 5,
      "external_id": 470255,
      "airdrop_id": 618018,
      "amount": 20001,
      "acc_name": "jane",
      "symbol": "UOSTEST"
    },
    {
      "id": 6,
      "external_id": 275349,
      "airdrop_id": 29947,
      "amount": 20001,
      "acc_name": "petr",
      "symbol": "UOSTEST"
    },
    {
      "id": 7,
      "external_id": 312965,
      "airdrop_id": 29947,
      "amount": 20001,
      "acc_name": "vlad",
      "symbol": "UOSTEST"
    },
    {
      "id": 8,
      "external_id": 988861,
      "airdrop_id": 587162,
      "amount": 20001,
      "acc_name": "vlad",
      "symbol": "UOSTEST"
    },
    {
      "id": 9,
      "external_id": 958064,
      "airdrop_id": 587162,
      "amount": 20001,
      "acc_name": "jane",
      "symbol": "UOSTEST"
    },
    {
      "id": 10,
      "external_id": 4324265,
      "airdrop_id": 4821544,
      "amount": 20001,
      "acc_name": "summerknight",
      "symbol": "UOSTEST"
    },
    {
      "id": 11,
      "external_id": 3008790,
      "airdrop_id": 1951188,
      "amount": 20001,
      "acc_name": "summerknight",
      "symbol": "GHTEST"
    },
    {
      "id": 12,
      "external_id": 4800357,
      "airdrop_id": 5104204,
      "amount": 20001,
      "acc_name": "vlad",
      "symbol": "UOSTEST"
    },
    {
      "id": 13,
      "external_id": 3882236,
      "airdrop_id": 5104204,
      "amount": 20001,
      "acc_name": "jane",
      "symbol": "UOSTEST"
    },
    {
      "id": 14,
      "external_id": 6309138,
      "airdrop_id": 3345720,
      "amount": 20001,
      "acc_name": "summerknight",
      "symbol": "UOSTEST"
    },
    {
      "id": 15,
      "external_id": 9392554,
      "airdrop_id": 2260179,
      "amount": 20001,
      "acc_name": "summerknight",
      "symbol": "GHTEST"
    },
    {
      "id": 16,
      "external_id": 4000336,
      "airdrop_id": 3714441,
      "amount": 20001,
      "acc_name": "vlad",
      "symbol": "UOSTEST"
    },
    {
      "id": 17,
      "external_id": 1169432,
      "airdrop_id": 3714441,
      "amount": 20001,
      "acc_name": "jane",
      "symbol": "UOSTEST"
    },
  ];
}


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
