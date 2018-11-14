const { WalletApi }       = require('../index');
const BlockchainRegistry  = require('../lib/blockchain-registry');

const helper = require('./helper');

const delay = require('delay');

helper.initForTestEnv();

const accountName             = helper.getTesterAccountName();
const privateKey              = helper.getTesterAccountPrivateKey();

const accountNameTo           = helper.getAccountNameTo();
const accountNameToPrivateKey = helper.getAccountNameToPrivateKey();

const nonExistedAccountErrorRegex = new RegExp('Probably account does not exist. Please check spelling');
const noStakeErrorRegex = new RegExp('It is possible to vote only if you have self-staked tokens.');
const maxProducersLimitErrorRegex = new RegExp('It is possible to vote up to 30 block producers');
const noSuchBlockProducersErrorRegex = new RegExp('There is no such block producers: no_such_bp1, no_such_bp2');

const firstBp = helper.getFirstBlockProducer();

const JEST_TIMEOUT = 10000;

describe('Send transactions to blockchain', function () {
  describe('voting', () => {
    describe('Positive', () => {
      it('should vote for block producers', async () => {

        // TODO

        // const voteInfo = await BlockchainRegistry.getRawVoteInfo(accountNameTo);
        // console.dir(voteInfo);
        //
        // return;
        //
        // // const a = await WalletApi.stakeOrUnstakeTokens(accountNameTo, accountNameToPrivateKey, 10, 10);
        // //
        // // const ab = 0;
        // //
        // const res = await WalletApi.voteForBlockProducers(accountNameTo, accountNameToPrivateKey, [
        //   'benjamintinp',
        //   'eoscannonchn',
        //   // 'eosnationftw',
        // ]);
      });
    });

    describe('Negative', () => {
      it('Not possible to vote if you do not have any self staked tokens', async () => {
        await helper.unstakeEverything(accountName, privateKey);

        const nonExistedAccount = helper.getNonExistedAccountName();
        await expect(WalletApi.voteForBlockProducers(nonExistedAccount, 'sample_key', [ firstBp ]))
          .rejects.toThrow(nonExistedAccountErrorRegex);

        await expect(WalletApi.voteForBlockProducers(accountName, privateKey, [ firstBp ]))
          .rejects.toThrow(noStakeErrorRegex);

        await helper.rollbackAllUnstakingRequests(accountName, privateKey);
      }, 10000);
    });

    it('It is not possible for more than 30 BP', async () => {
      const fakeProducers = [];
      for (let i = 0; i < 31; i++) {
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

  describe('Positive', () => {
    it('sellRam', async () => {
      const freeRam = await BlockchainRegistry.getFreeRamAmountInBytes(accountName);
      const ramToSell = Math.floor(freeRam / 100);

      const balanceBefore = await BlockchainRegistry.getAccountBalance(accountName);

      const res = await WalletApi.sellRam(accountName, privateKey, ramToSell);

      helper.checkBasicTransactionStructure(res);

      const freeRamAfter = await BlockchainRegistry.getFreeRamAmountInBytes(accountName);
      expect(freeRamAfter).toBe(freeRam - ramToSell);

      const balanceAfter = await BlockchainRegistry.getAccountBalance(accountName);

      // TODO - check exact value
      expect(balanceAfter).toBeGreaterThan(balanceBefore);

    }, 20000);
    it('buyRam', async () => {
      const freeRam = await BlockchainRegistry.getFreeRamAmountInBytes(accountName);
      const ramToBuy = Math.floor(freeRam / 100);

      const totalRamBefore = await BlockchainRegistry.getTotalRamAmount(accountName);
      const balanceBefore = await BlockchainRegistry.getAccountBalance(accountName);

      const res = await WalletApi.buyRam(accountName, privateKey, ramToBuy);

      helper.checkBasicTransactionStructure(res);

      const balanceAfter = await BlockchainRegistry.getAccountBalance(accountName);
      const totalRamAfter = await BlockchainRegistry.getTotalRamAmount(accountName);

      // TODO check why ram amount is not same as amount to buy - maybe blockchain feature
      expect(totalRamAfter).toBeGreaterThan(totalRamBefore);
      // TODO - check exact value
      expect(balanceAfter).toBeLessThan(balanceBefore);
    }, 20000);
    it('Send tokens', async () => {
      const amountToSend = 2;

      const senderState = await WalletApi.getAccountState(accountName);
      const senderTokensBefore = senderState.tokens.active;

      const recipientState = await WalletApi.getAccountState(accountNameTo);
      const recipientTokensBefore = recipientState.tokens.active;

      const res = await WalletApi.sendTokens(accountName, privateKey, accountNameTo, amountToSend);

      helper.checkSendTokensTransactionResponse(res, accountName, accountNameTo, amountToSend);

      const senderStateAfter = await WalletApi.getAccountState(accountName);
      const senderTokensAfter = senderStateAfter.tokens.active;
      expect(senderTokensAfter).toBe(senderTokensBefore - amountToSend);

      const recipientStateAfter = await WalletApi.getAccountState(accountNameTo);
      const recipientTokensAfter = recipientStateAfter.tokens.active;
      expect(recipientTokensAfter).toBe(recipientTokensBefore + amountToSend);

      // rollback
      await WalletApi.sendTokens(accountNameTo, accountNameToPrivateKey, accountName, amountToSend);
    }, 20000);

    describe('stakeOrUnstakeTokens', async () => {
      it('Unstake and rollback it', async () => {
        await helper.rollbackAllUnstakingRequests(accountName, privateKey);

        // ---------- Check basic state - no unstaking request ------------
        const state = await WalletApi.getAccountState(accountName);
        const netTokensToDecrease = 2;
        const cpuTokensToDecrease = 3;

        const totalStakedTokensBefore = state.tokens.staked;

        // ---------- Lets make unstaking request ------------

        const netTokens = state.resources.net.tokens.self_delegated;
        const cpuTokens = state.resources.cpu.tokens.self_delegated;

        await WalletApi.stakeOrUnstakeTokens(
          accountName,
          privateKey,
          netTokens - netTokensToDecrease,
          cpuTokens - cpuTokensToDecrease
        );

        const stateAfter = await WalletApi.getAccountState(accountName);

        // console.log(util.inspect(stateAfter, false, null, true /* enable colors */));

        helper.checkUnstakingRequestValues(stateAfter.resources.net.unstaking_request, netTokensToDecrease);
        helper.checkUnstakingRequestValues(stateAfter.resources.cpu.unstaking_request, cpuTokensToDecrease);

        // total self_staked amount must be decreased
        expect(stateAfter.tokens.staked).toBe(totalStakedTokensBefore - netTokensToDecrease - cpuTokensToDecrease);

        // RAM is used to create a record about refund
        expect(stateAfter.resources.ram.used).toBeGreaterThan(state.resources.ram.used);

        // Active token amount is not increased
        expect(stateAfter.tokens.active).toBe(state.tokens.active);

        // ------- Next lets rollback unstaking request -----------

        const netTokensAfter = stateAfter.resources.net.tokens.self_delegated;
        const cpuTokensAfter = stateAfter.resources.cpu.tokens.self_delegated;

        await WalletApi.stakeOrUnstakeTokens(
          accountName,
          privateKey,
          netTokensAfter + netTokensToDecrease,
          cpuTokensAfter + cpuTokensToDecrease
        );

        const rollbackState = await WalletApi.getAccountState(accountName);

        const cpuUnstakingRollback = rollbackState.resources.cpu.unstaking_request;
        const netUnstakingRollback = rollbackState.resources.net.unstaking_request;

        expect(cpuUnstakingRollback.amount).toBe(0);
        expect(cpuUnstakingRollback.request_datetime).toBeNull();

        expect(netUnstakingRollback.amount).toBe(0);
        expect(netUnstakingRollback.request_datetime).toBeNull();

        // Total staked amount must restored to be the same as before
        expect(rollbackState.tokens.staked).toBe(totalStakedTokensBefore);

        // Memory must be restored
        expect(state.resources.ram.used).toBe(rollbackState.resources.ram.used);

        // Active token amount is not increased
        expect(rollbackState.tokens.active).toBe(state.tokens.active);

      }, 50000);

      it('increase both net and cpu', async () => {
        const stateBefore = await WalletApi.getAccountState(accountName);
        const netBefore = stateBefore.resources.net;
        const cpuBefore = stateBefore.resources.cpu;

        const res = await WalletApi.stakeOrUnstakeTokens(
          accountName,
          privateKey,
          netBefore.tokens.self_delegated + 1,
          cpuBefore.tokens.self_delegated + 2,
        );

        helper.checkBasicTransactionStructure(res, 2);

        const stateAfter = await WalletApi.getAccountState(accountName);
        const netAfter = stateAfter.resources.net;
        const cpuAfter = stateAfter.resources.cpu;

        expect(stateAfter.tokens.active).toBeLessThan(stateBefore.tokens.active);

        expect(netAfter.tokens.self_delegated).toBeGreaterThan(netBefore.tokens.self_delegated);
        expect(cpuAfter.tokens.self_delegated).toBeGreaterThan(cpuBefore.tokens.self_delegated);

      }, 20000);

      it('decrease both net and cpu', async () => {
        const stateBefore = await WalletApi.getAccountState(accountName);
        const netBefore = stateBefore.resources.net;
        const cpuBefore = stateBefore.resources.cpu;

        const res = await WalletApi.stakeOrUnstakeTokens(
          accountName,
          privateKey,
          netBefore.tokens.self_delegated - 1,
          cpuBefore.tokens.self_delegated - 2,
        );

        helper.checkBasicTransactionStructure(res, 2);

        const stateAfter = await WalletApi.getAccountState(accountName);
        const netAfter = stateAfter.resources.net;
        const cpuAfter = stateAfter.resources.cpu;

        expect(stateAfter.tokens.active).toBe(stateBefore.tokens.active);

        expect(netAfter.tokens.self_delegated).toBeLessThan(netBefore.tokens.self_delegated);
        expect(cpuAfter.tokens.self_delegated).toBeLessThan(cpuBefore.tokens.self_delegated);

        await helper.rollbackAllUnstakingRequests(accountName, privateKey);
      }, 20000);


      it('decrease net and increase cpu', async () => {
        const stateBefore = await WalletApi.getAccountState(accountName);
        const netBefore = stateBefore.resources.net;
        const cpuBefore = stateBefore.resources.cpu;

        const res = await WalletApi.stakeOrUnstakeTokens(
          accountName,
          privateKey,
          netBefore.tokens.self_delegated - 1,
          cpuBefore.tokens.self_delegated + 2,
        );

        helper.checkBasicTransactionStructure(res, 2);

        const stateAfter = await WalletApi.getAccountState(accountName);
        const netAfter = stateAfter.resources.net;
        const cpuAfter = stateAfter.resources.cpu;

        expect(stateAfter.tokens.active).toBeLessThan(stateBefore.tokens.active);

        expect(netAfter.tokens.self_delegated).toBeLessThan(netBefore.tokens.self_delegated);
        expect(cpuAfter.tokens.self_delegated).toBeGreaterThan(cpuBefore.tokens.self_delegated);

        await helper.rollbackAllUnstakingRequests(accountName, privateKey);

      }, 20000);

      it('decrease cpu and increase net', async () => {
        const stateBefore = await WalletApi.getAccountState(accountName);
        const netBefore = stateBefore.resources.net;
        const cpuBefore = stateBefore.resources.cpu;

        const res = await WalletApi.stakeOrUnstakeTokens(
          accountName,
          privateKey,
          netBefore.tokens.self_delegated + 3,
          cpuBefore.tokens.self_delegated - 2,
        );

        helper.checkBasicTransactionStructure(res, 2);

        delay(100);

        const stateAfter = await WalletApi.getAccountState(accountName);
        const netAfter = stateAfter.resources.net;
        const cpuAfter = stateAfter.resources.cpu;

        expect(stateAfter.tokens.active).toBeLessThan(stateBefore.tokens.active);

        expect(netAfter.tokens.self_delegated).toBeGreaterThan(netBefore.tokens.self_delegated);
        expect(cpuAfter.tokens.self_delegated).toBeLessThan(cpuBefore.tokens.self_delegated);

        await helper.rollbackAllUnstakingRequests(accountName, privateKey);
      }, 20000);

      it('decrease cpu and net the same', async () => {
        const stateBefore = await WalletApi.getAccountState(accountName);
        const netBefore = stateBefore.resources.net;
        const cpuBefore = stateBefore.resources.cpu;

        const res = await WalletApi.stakeOrUnstakeTokens(
          accountName,
          privateKey,
          netBefore.tokens.self_delegated,
          cpuBefore.tokens.self_delegated - 2,
        );

        helper.checkBasicTransactionStructure(res, 1);

        const stateAfter = await WalletApi.getAccountState(accountName);
        const netAfter = stateAfter.resources.net;
        const cpuAfter = stateAfter.resources.cpu;

        expect(stateAfter.tokens.active).toBe(stateBefore.tokens.active);

        expect(netAfter.tokens.self_delegated).toBe(netBefore.tokens.self_delegated);
        expect(cpuAfter.tokens.self_delegated).toBeLessThan(cpuBefore.tokens.self_delegated);

        await helper.rollbackAllUnstakingRequests(accountName, privateKey);
      }, 20000);

      it('decrease net and cpu the same', async () => {
        const stateBefore = await WalletApi.getAccountState(accountName);
        const netBefore = stateBefore.resources.net;
        const cpuBefore = stateBefore.resources.cpu;

        const res = await WalletApi.stakeOrUnstakeTokens(
          accountName,
          privateKey,
          netBefore.tokens.self_delegated - 2,
          cpuBefore.tokens.self_delegated,
        );

        helper.checkBasicTransactionStructure(res, 1);

        delay(100);

        const stateAfter = await WalletApi.getAccountState(accountName);
        const netAfter = stateAfter.resources.net;
        const cpuAfter = stateAfter.resources.cpu;

        expect(stateAfter.tokens.active).toBe(stateBefore.tokens.active);

        expect(netAfter.tokens.self_delegated).toBeLessThan(netBefore.tokens.self_delegated);
        expect(cpuAfter.tokens.self_delegated).toBe(cpuBefore.tokens.self_delegated);

        await helper.rollbackAllUnstakingRequests(accountName, privateKey);
      }, 20000);

      it('increase net and cpu the same', async () => {
        const stateBefore = await WalletApi.getAccountState(accountName);
        const netBefore = stateBefore.resources.net;
        const cpuBefore = stateBefore.resources.cpu;

        const res = await WalletApi.stakeOrUnstakeTokens(
          accountName,
          privateKey,
          netBefore.tokens.self_delegated + 5,
          cpuBefore.tokens.self_delegated,
        );

        helper.checkBasicTransactionStructure(res, 1);

        delay(100);

        const stateAfter = await WalletApi.getAccountState(accountName);
        const netAfter = stateAfter.resources.net;
        const cpuAfter = stateAfter.resources.cpu;

        expect(stateAfter.tokens.active).toBeLessThan(stateBefore.tokens.active);

        expect(netAfter.tokens.self_delegated).toBeGreaterThan(netBefore.tokens.self_delegated);
        expect(cpuAfter.tokens.self_delegated).toBe(cpuBefore.tokens.self_delegated);
      }, 20000);

      it('increase cpu and net the same', async () => {
        const stateBefore = await WalletApi.getAccountState(accountName);
        const netBefore = stateBefore.resources.net;
        const cpuBefore = stateBefore.resources.cpu;

        const res = await WalletApi.stakeOrUnstakeTokens(
          accountName,
          privateKey,
          netBefore.tokens.self_delegated,
          cpuBefore.tokens.self_delegated + 5,
        );

        helper.checkBasicTransactionStructure(res, 1);

        delay(100);

        const stateAfter = await WalletApi.getAccountState(accountName);
        const netAfter = stateAfter.resources.net;
        const cpuAfter = stateAfter.resources.cpu;

        expect(stateAfter.tokens.active).toBeLessThan(stateBefore.tokens.active);

        expect(netAfter.tokens.self_delegated).toBe(netBefore.tokens.self_delegated);
        expect(cpuAfter.tokens.self_delegated).toBeGreaterThan(cpuBefore.tokens.self_delegated);
      }, 20000);
    });
    it.skip('claim emission', async () => {
      // TODO it is necessary to manually set emission before this test
    });
  });

  describe('Negative', () => {
    it('Wrong private key', async () => {
      await expect(WalletApi.sendTokens(accountName, 'sample', accountNameTo, 1)).rejects.toThrow(/Malformed private key/);
    });

    it('private key of different account', async () => {
      await expect(WalletApi.sendTokens(accountName, accountNameToPrivateKey, accountNameTo, 1))
        .rejects.toThrow(/Private key is not valid/);
    });
  });
});
