/* eslint-disable no-bitwise,security/detect-object-injection,jest/no-disabled-tests */
import Helper = require('../../helpers/helper');
import BlockchainRegistry = require('../../../src/lib/blockchain-registry');
import WalletApi = require('../../../src/lib/wallet/api/wallet-api');

const delay = require('delay');

Helper.initForEnvByProcessVariable();

const accountName = Helper.getTesterAccountName();
const privateKey = Helper.getTesterAccountPrivateKey();

const accountNameTo = Helper.getAccountNameTo();
const accountNameToPrivateKey = Helper.getAccountNameToPrivateKey();

const JEST_TIMEOUT = 20000;

describe('Send transactions to blockchain', () => {
  describe('Positive', () => {
    it('sellRam', async () => {
      const freeRam = await BlockchainRegistry.getFreeRamAmountInBytes(accountName);
      const ramToSell = Math.floor(freeRam / 50);

      const balanceBefore = await BlockchainRegistry.getAccountBalance(accountName);

      const response = await WalletApi.sellRam(accountName, privateKey, ramToSell);

      Helper.checkBasicTransactionStructure(response);

      const freeRamAfter = await BlockchainRegistry.getFreeRamAmountInBytes(accountName);
      expect(freeRamAfter).toBe(freeRam - ramToSell);

      const balanceAfter = await BlockchainRegistry.getAccountBalance(accountName);

      expect(balanceAfter).toBeGreaterThan(balanceBefore);
    }, JEST_TIMEOUT);

    it('buyRam', async () => {
      const freeRam = await BlockchainRegistry.getFreeRamAmountInBytes(accountName);
      const ramToBuy = Math.floor(freeRam / 50);

      const totalRamBefore = await BlockchainRegistry.getTotalRamAmount(accountName);
      const balanceBefore = await BlockchainRegistry.getAccountBalance(accountName);

      const response = await WalletApi.buyRam(accountName, privateKey, ramToBuy);

      Helper.checkBasicTransactionStructure(response);

      const balanceAfter = await BlockchainRegistry.getAccountBalance(accountName);
      const totalRamAfter = await BlockchainRegistry.getTotalRamAmount(accountName);

      // #task check why ram amount is not same as amount to buy - maybe blockchain feature
      expect(totalRamAfter).toBeGreaterThan(totalRamBefore);
      // #task - check exact value
      expect(balanceAfter).toBeLessThan(balanceBefore);
    }, JEST_TIMEOUT);

    it('Send tokens', async () => {
      const amountToSend = 2;

      const senderState = await WalletApi.getAccountState(accountName);
      const senderTokensBefore = senderState.tokens.active;

      const recipientState = await WalletApi.getAccountState(accountNameTo);
      const recipientTokensBefore = recipientState.tokens.active;

      const response = await WalletApi.sendTokens(accountName, privateKey, accountNameTo, amountToSend);

      Helper.checkSendTokensTransactionResponse(response, accountName, accountNameTo, amountToSend);

      const senderStateAfter = await WalletApi.getAccountState(accountName);
      const senderTokensAfter = senderStateAfter.tokens.active;
      expect(senderTokensAfter).toBe(senderTokensBefore - amountToSend);

      const recipientStateAfter = await WalletApi.getAccountState(accountNameTo);
      const recipientTokensAfter = recipientStateAfter.tokens.active;
      expect(recipientTokensAfter).toBe(recipientTokensBefore + amountToSend);

      // rollback
      await WalletApi.sendTokens(accountNameTo, accountNameToPrivateKey, accountName, amountToSend);
    }, JEST_TIMEOUT);

    describe('stakeOrUnstakeTokens', () => {
      it('Unstake and rollback it', async () => {
        await Helper.rollbackAllUnstakingRequests(accountName, privateKey);

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
          cpuTokens - cpuTokensToDecrease,
        );

        const stateAfter = await WalletApi.getAccountState(accountName);

        // console.log(util.inspect(stateAfter, false, null, true /* enable colors */));

        Helper.checkUnstakingRequestValues(stateAfter.resources.net.unstaking_request, netTokensToDecrease);
        Helper.checkUnstakingRequestValues(stateAfter.resources.cpu.unstaking_request, cpuTokensToDecrease);

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
          cpuTokensAfter + cpuTokensToDecrease,
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
      }, JEST_TIMEOUT);

      it('increase both net and cpu', async () => {
        const stateBefore = await WalletApi.getAccountState(accountName);
        const netBefore = stateBefore.resources.net;
        const cpuBefore = stateBefore.resources.cpu;

        const response = await WalletApi.stakeOrUnstakeTokens(
          accountName,
          privateKey,
          netBefore.tokens.self_delegated + 1,
          cpuBefore.tokens.self_delegated + 2,
        );

        Helper.checkBasicTransactionStructure(response, 2);

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

        const response = await WalletApi.stakeOrUnstakeTokens(
          accountName,
          privateKey,
          netBefore.tokens.self_delegated - 1,
          cpuBefore.tokens.self_delegated - 2,
        );

        Helper.checkBasicTransactionStructure(response, 2);

        const stateAfter = await WalletApi.getAccountState(accountName);
        const netAfter = stateAfter.resources.net;
        const cpuAfter = stateAfter.resources.cpu;

        expect(stateAfter.tokens.active).toBe(stateBefore.tokens.active);

        expect(netAfter.tokens.self_delegated).toBeLessThan(netBefore.tokens.self_delegated);
        expect(cpuAfter.tokens.self_delegated).toBeLessThan(cpuBefore.tokens.self_delegated);

        await Helper.rollbackAllUnstakingRequests(accountName, privateKey);
      }, 20000);


      it('decrease net and increase cpu', async () => {
        const stateBefore = await WalletApi.getAccountState(accountName);
        const netBefore = stateBefore.resources.net;
        const cpuBefore = stateBefore.resources.cpu;

        const response = await WalletApi.stakeOrUnstakeTokens(
          accountName,
          privateKey,
          netBefore.tokens.self_delegated - 1,
          cpuBefore.tokens.self_delegated + 2,
        );

        Helper.checkBasicTransactionStructure(response, 2);

        const stateAfter = await WalletApi.getAccountState(accountName);
        const netAfter = stateAfter.resources.net;
        const cpuAfter = stateAfter.resources.cpu;

        expect(stateAfter.tokens.active).toBeLessThan(stateBefore.tokens.active);

        expect(netAfter.tokens.self_delegated).toBeLessThan(netBefore.tokens.self_delegated);
        expect(cpuAfter.tokens.self_delegated).toBeGreaterThan(cpuBefore.tokens.self_delegated);

        await Helper.rollbackAllUnstakingRequests(accountName, privateKey);
      }, 20000);

      it('decrease cpu and increase net', async () => {
        const stateBefore = await WalletApi.getAccountState(accountName);
        const netBefore = stateBefore.resources.net;
        const cpuBefore = stateBefore.resources.cpu;

        const response = await WalletApi.stakeOrUnstakeTokens(
          accountName,
          privateKey,
          netBefore.tokens.self_delegated + 3,
          cpuBefore.tokens.self_delegated - 2,
        );

        Helper.checkBasicTransactionStructure(response, 2);

        delay(100);

        const stateAfter = await WalletApi.getAccountState(accountName);
        const netAfter = stateAfter.resources.net;
        const cpuAfter = stateAfter.resources.cpu;

        expect(stateAfter.tokens.active).toBeLessThan(stateBefore.tokens.active);

        expect(netAfter.tokens.self_delegated).toBeGreaterThan(netBefore.tokens.self_delegated);
        expect(cpuAfter.tokens.self_delegated).toBeLessThan(cpuBefore.tokens.self_delegated);

        await Helper.rollbackAllUnstakingRequests(accountName, privateKey);
      }, 20000);

      it('decrease cpu and net the same', async () => {
        const stateBefore = await WalletApi.getAccountState(accountName);
        const netBefore = stateBefore.resources.net;
        const cpuBefore = stateBefore.resources.cpu;

        const response = await WalletApi.stakeOrUnstakeTokens(
          accountName,
          privateKey,
          netBefore.tokens.self_delegated,
          cpuBefore.tokens.self_delegated - 2,
        );

        Helper.checkBasicTransactionStructure(response, 1);

        const stateAfter = await WalletApi.getAccountState(accountName);
        const netAfter = stateAfter.resources.net;
        const cpuAfter = stateAfter.resources.cpu;

        expect(stateAfter.tokens.active).toBe(stateBefore.tokens.active);

        expect(netAfter.tokens.self_delegated).toBe(netBefore.tokens.self_delegated);
        expect(cpuAfter.tokens.self_delegated).toBeLessThan(cpuBefore.tokens.self_delegated);

        await Helper.rollbackAllUnstakingRequests(accountName, privateKey);
      }, 20000);

      it('decrease net and cpu the same', async () => {
        const stateBefore = await WalletApi.getAccountState(accountName);
        const netBefore = stateBefore.resources.net;
        const cpuBefore = stateBefore.resources.cpu;

        const response = await WalletApi.stakeOrUnstakeTokens(
          accountName,
          privateKey,
          netBefore.tokens.self_delegated - 2,
          cpuBefore.tokens.self_delegated,
        );

        Helper.checkBasicTransactionStructure(response, 1);

        delay(100);

        const stateAfter = await WalletApi.getAccountState(accountName);
        const netAfter = stateAfter.resources.net;
        const cpuAfter = stateAfter.resources.cpu;

        expect(stateAfter.tokens.active).toBe(stateBefore.tokens.active);

        expect(netAfter.tokens.self_delegated).toBeLessThan(netBefore.tokens.self_delegated);
        expect(cpuAfter.tokens.self_delegated).toBe(cpuBefore.tokens.self_delegated);

        await Helper.rollbackAllUnstakingRequests(accountName, privateKey);
      }, 20000);

      it('increase net and cpu the same', async () => {
        const stateBefore = await WalletApi.getAccountState(accountName);
        const netBefore = stateBefore.resources.net;
        const cpuBefore = stateBefore.resources.cpu;

        const response = await WalletApi.stakeOrUnstakeTokens(
          accountName,
          privateKey,
          netBefore.tokens.self_delegated + 5,
          cpuBefore.tokens.self_delegated,
        );

        Helper.checkBasicTransactionStructure(response, 1);

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

        const response = await WalletApi.stakeOrUnstakeTokens(
          accountName,
          privateKey,
          netBefore.tokens.self_delegated,
          cpuBefore.tokens.self_delegated + 5,
        );

        Helper.checkBasicTransactionStructure(response, 1);

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
      // #task it is necessary to manually set emission before this test
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

export {};
