/* eslint-disable no-bitwise,security/detect-object-injection,jest/no-disabled-tests */
import Helper = require('../../../helpers/helper');
import TransactionsPushResponseChecker = require('../../../helpers/common/transactions-push-response-checker');
import TransactionsSamplesGenerator = require('../../../helpers/wallet/transactions-samples-generator');

const { WalletApi } = require('../../../..');

Helper.initForTestEnv();

const accountName = Helper.getTesterAccountName();
const privateKey = Helper.getTesterAccountPrivateKey();

const JEST_TIMEOUT = 5000;

describe('Send transactions to blockchain', () => {
  describe('nodes-calculators voting', () => {
    describe('Positive', () => {
      it('vote for calculator nodes', async () => {
        const res = await WalletApi.voteForCalculatorNodes(accountName, privateKey, [
          'initcalc1111',
          'initcalc1115',
        ]);

        const expected = TransactionsSamplesGenerator.getVoteForCalculatorsSample();

        TransactionsPushResponseChecker.checkOneTransaction(res, expected);
      }, JEST_TIMEOUT);

      it('vote for nobody', async () => {
        const response = await WalletApi.voteForCalculatorNodes(accountName, privateKey, []);
        const expected = TransactionsSamplesGenerator.getVoteForCalculatorsEmptySample();

        TransactionsPushResponseChecker.checkOneTransaction(response, expected);
      }, JEST_TIMEOUT);
    });
  });
});
