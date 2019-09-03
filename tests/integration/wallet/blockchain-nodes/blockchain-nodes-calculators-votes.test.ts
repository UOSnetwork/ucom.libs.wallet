import Helper = require('../../../helpers/helper');
import TransactionsPushResponseChecker = require('../../../helpers/common/transactions-push-response-checker');
import TransactionsSamplesGenerator = require('../../../helpers/wallet/transactions-samples-generator');
import WalletApi = require('../../../../src/lib/wallet/api/wallet-api');

Helper.initForEnvByProcessVariable();

const accountName = Helper.getTesterAccountName();

const socialPrivateKey = Helper.getTesterAccountSocialPrivateKey();
const permission = 'social';

const JEST_TIMEOUT = 40000;

describe('Send transactions to blockchain', () => {
  describe('nodes-calculators voting', () => {
    describe('Positive', () => {
      it('vote for calculator nodes', async () => {
        const res = await WalletApi.voteForCalculatorNodes(accountName, socialPrivateKey, [
          'initcalc1111',
          'initcalc1115',
        ], permission);

        const expected = TransactionsSamplesGenerator.getVoteForCalculatorsSample(accountName, permission);

        TransactionsPushResponseChecker.checkOneTransaction(res, expected);
      }, JEST_TIMEOUT * 2);

      it('vote for nobody', async () => {
        const response = await WalletApi.voteForCalculatorNodes(accountName, socialPrivateKey, [], permission);
        const expected = TransactionsSamplesGenerator.getVoteForCalculatorsEmptySample(accountName, permission);

        TransactionsPushResponseChecker.checkOneTransaction(response, expected);
      }, JEST_TIMEOUT * 2);
    });
  });
});

export {};
