/* eslint-disable no-bitwise,security/detect-object-injection,jest/no-disabled-tests */
import Helper = require('../../../helpers/helper');
import ConfigService = require('../../../../src/config/config-service');
import EosClient = require('../../../../src/lib/common/client/eos-client');
import WalletApi = require('../../../../src/lib/wallet/api/wallet-api');

ConfigService.initNodeJsEnv();
ConfigService.initForTestEnv();

EosClient.initForTestEnv();
EosClient.setNodeJsEnv();

Helper.initForTestEnv();

const accountName = Helper.getTesterAccountName();
const privateKey = Helper.getTesterAccountPrivateKey();

const nonExistedAccountErrorRegex = new RegExp('Probably account does not exist. Please check spelling');
const noStakeErrorRegex = new RegExp('It is possible to vote only if you have self-staked tokens.');
const maxProducersLimitErrorRegex = new RegExp('It is possible to vote up to 30 block producers');
const noSuchBlockProducersErrorRegex = new RegExp('There is no such block producers: no_such_bp1, no_such_bp2');

const firstBp = Helper.getFirstBlockProducer();
const secondBp = Helper.getSecondBlockProducer();

const JEST_TIMEOUT = 20000;

describe('Block producers voting', () => {
  describe('Positive', () => {
    it('should be possible to vote for nobody', async () => {
      await Helper.stakeSomethingIfNecessary(accountName, privateKey);
      await WalletApi.voteForBlockProducers(accountName, privateKey, [
        firstBp,
        secondBp,
      ]);

      const voteInfo = await WalletApi.getRawVoteInfo(accountName);

      const { producers } = voteInfo;

      expect(~(producers.indexOf(firstBp))).toBeTruthy();
      expect(~(producers.indexOf(secondBp))).toBeTruthy();

      expect(+voteInfo.last_vote_weight).toBeGreaterThan(0);

      await WalletApi.voteForBlockProducers(accountName, privateKey, []);

      const voteInfoAfter = await WalletApi.getRawVoteInfo(accountName);
      expect(voteInfoAfter.producers.length).toBe(0);
    }, JEST_TIMEOUT);
  });

  describe('Negative', () => {
    it('Not possible to vote if you do not have any self staked tokens', async () => {
      await Helper.unstakeEverything(accountName, privateKey);

      const nonExistedAccount = Helper.getNonExistedAccountName();
      await expect(WalletApi.voteForBlockProducers(nonExistedAccount, 'sample_key', [firstBp]))
        .rejects.toThrow(nonExistedAccountErrorRegex);

      await expect(WalletApi.voteForBlockProducers(accountName, privateKey, [firstBp]))
        .rejects.toThrow(noStakeErrorRegex);

      await Helper.rollbackAllUnstakingRequests(accountName, privateKey);
    }, JEST_TIMEOUT);
  });

  it('It is not possible for more than 30 BP', async () => {
    const fakeProducers: string[] = [];
    for (let i = 0; i < 31; i += 1) {
      fakeProducers.push(`producer_${i}`);
    }

    await expect(WalletApi.voteForBlockProducers(accountName, privateKey, fakeProducers))
      .rejects.toThrow(maxProducersLimitErrorRegex);
  });

  it('it is not possible to vote for producer which does not exist', async () => {
    const producers = ['no_such_bp1', 'no_such_bp2', firstBp];

    await expect(WalletApi.voteForBlockProducers(accountName, privateKey, producers))
      .rejects.toThrow(noSuchBlockProducersErrorRegex);
  }, JEST_TIMEOUT);
});
