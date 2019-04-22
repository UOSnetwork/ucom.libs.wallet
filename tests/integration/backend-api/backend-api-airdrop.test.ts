/* eslint-disable security/detect-object-injection */
import Helper = require('../../helpers/helper');
import NumbersHelper = require('../../helpers/common/numbers-helper');
import TransactionsPushResponseChecker = require('../../helpers/common/transactions-push-response-checker');
import BackendApi = require('../../../src/lib/backend-api');
import EosClient = require('../../../src/lib/common/client/eos-client');

const internalServiceErrorPattern = new RegExp('Internal Service Error');

const JEST_TIMEOUT = 10000;

describe('Backend API airdrop', () => {
  Helper.initForStagingEnv();

  const accountNameFrom = Helper.getAirdropAccountName();
  const privateKey = Helper.getAirdropAccountPrivateKey();
  const permission = 'active';

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

      const expected = Helper.getSamplePushResponse(data);
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

      const expected = Helper.getSamplePushResponse(data);
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

      const expected = Helper.getSamplePushResponse(data);
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

      const janeExpected = Helper.getSamplePushResponse(janeData);
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

      await expect(EosClient.pushTransaction(signed)).rejects.toThrow(internalServiceErrorPattern);
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

      await expect(EosClient.pushTransaction(signed)).rejects.toThrow(internalServiceErrorPattern);
    });
  });

  describe('Get airdrops receipt table rows', () => {
    it('Get table rows with regular pagination (via id)', async () => {
      Helper.initForStagingEnv();

      const actual = await BackendApi.getAirdropsReceiptTableRows();
      const expected = Helper.getSampleAirdropsReceiptTableRows();

      for (let i = 0; i < expected.length; i += 1) {
        expect(actual[i]).toMatchObject(expected[i]);
      }
    }, JEST_TIMEOUT);

    it('Find a concrete record via external_id', async () => {
      Helper.initForStagingEnv();

      const externalId = 3882236;
      const actual = await BackendApi.getOneAirdropReceiptRowByExternalId(externalId);
      const expected = {
        id: 13,
        external_id: 3882236,
        airdrop_id: 5104204,
        amount: 20001,
        acc_name: 'jane',
        symbol: 'UOSTEST',
      };

      expect(actual).toMatchObject(expected);
    }, JEST_TIMEOUT);

    it('Find receipt records from given external_id', async () => {
      Helper.initForStagingEnv();

      const externalId = 275349;
      const actual = await BackendApi.getAirdropsReceiptTableRowsAfterExternalId(externalId, 10);
      const expected = Helper.getSampleAirdropsReceiptAfterExternalId();

      for (let i = 0; i < 4; i += 1) {
        expect(actual[i]).toMatchObject(expected[i]);
      }
    }, JEST_TIMEOUT);
  });
});
