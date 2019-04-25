/* eslint-disable unicorn/import-index,max-len,jest/no-disabled-tests */
import Helper = require('../../helpers/helper');
import WalletApi = require('../../../src/lib/wallet/api/wallet-api');

Helper.initForTestEnv();

const accountName = Helper.getTesterAccountName();
const accountNameTo = Helper.getAccountNameTo();

const positiveIntErrorRegex = new RegExp('Input value must be an integer and greater than zero');
const positiveOrZeroIntErrorRegex = new RegExp('Input value must be an integer and greater than or equal to zero');
const nonExistedAccountErrorRegex = new RegExp('Probably account does not exist. Please check spelling');
const notEnoughFreeRamErrorRegex = new RegExp('Not enough free RAM. Please correct input data');
const tooSmallRamAmountErrorRegex = new RegExp('Please increase amounts of bytes - total UOS price must be more or equal 1');
const notEnoughTokensErrorRegex = new RegExp('Not enough tokens. Please correct input data');

Helper.mockTransactionSending();

describe('Get blockchain info and validation checks', () => {
  describe('GET requests', () => {
    describe('Get info from blockchain', () => {
      describe('Positive', () => {
        it('Get account state', async () => {
          const accountState = await WalletApi.getAccountState(accountName);

          Helper.checkStateStructure(accountState);
        });

        it('Get ram price', async () => {
          const bytesToBuy = 10000;

          const uosPrice = await WalletApi.getApproximateRamPriceByBytesAmount(bytesToBuy);

          expect(typeof uosPrice).toBe('number');
          expect(uosPrice).toBeGreaterThan(0);
        });

        it('getCurrentNetAndCpuStakedTokens', async () => {
          const data = await WalletApi.getCurrentNetAndCpuStakedTokens(accountName);

          expect(typeof data.cpu).toBe('number');
          expect(data.cpu).toBeGreaterThan(0);

          expect(typeof data.net).toBe('number');
          expect(data.net).toBeGreaterThan(0);

          expect(data.currency).toBe('UOS');
        });
      });

      describe('Negative', () => {
        it('Empty object if account does not exist', async () => {
          const account = Helper.getNonExistedAccountName();

          const accountState = await WalletApi.getAccountState(account);

          expect(typeof accountState).toBe('object');
          expect(Object.keys(accountState).length).toBe(0);
        });
      });
    });
  });

  describe('Validations', () => {
    it('getApproximateRamPriceByBytesAmount - wrong number', async () => {
      await expect(WalletApi.getApproximateRamPriceByBytesAmount(0)).rejects.toThrow(positiveIntErrorRegex);
      // noinspection JSCheckFunctionSignatures
      await expect(WalletApi.getApproximateRamPriceByBytesAmount('abc')).rejects.toThrow(positiveIntErrorRegex);
    });

    it('sellRam validation', async () => {
      await expect(WalletApi.sellRam(accountName, 'sample_key', 0)).rejects.toThrow(positiveIntErrorRegex);
      // noinspection JSCheckFunctionSignatures
      await expect(WalletApi.sellRam(accountName, 'sample_key', 'abc')).rejects.toThrow(positiveIntErrorRegex);

      const nonExistedAccount = Helper.getNonExistedAccountName();
      await expect(WalletApi.sellRam(nonExistedAccount, 'sample_key', 100)).rejects.toThrow(nonExistedAccountErrorRegex);

      const state = await WalletApi.getAccountState(accountName);

      const freeRam = state.resources.ram.free * 1024;
      await expect(WalletApi.sellRam(accountName, 'sample_key', freeRam + 1)).rejects.toThrow(notEnoughFreeRamErrorRegex);

      await expect(WalletApi.sellRam(accountName, 'sample_key', 1)).rejects.toThrow(tooSmallRamAmountErrorRegex);

      const response = await WalletApi.sellRam(accountName, 'sample_key', freeRam - 100);

      expect(response.success).toBeTruthy();
    });

    it('buyRam validation', async () => {
      await expect(WalletApi.buyRam(accountName, 'sample_key', 0)).rejects.toThrow(positiveIntErrorRegex);
      // noinspection JSCheckFunctionSignatures
      await expect(WalletApi.buyRam(accountName, 'sample_key', 'abc')).rejects.toThrow(positiveIntErrorRegex);

      const nonExistedAccount = Helper.getNonExistedAccountName();
      await expect(WalletApi.buyRam(nonExistedAccount, 'sample_key', 1000)).rejects.toThrow(nonExistedAccountErrorRegex);

      await expect(WalletApi.buyRam(accountName, 'sample_key', 1)).rejects.toThrow(tooSmallRamAmountErrorRegex);

      await expect(WalletApi.buyRam(accountName, 'sample_key', 10000000000)).rejects.toThrow(notEnoughTokensErrorRegex);

      const response = await WalletApi.buyRam(accountName, 'sample_key', 1000000);

      expect(response.success).toBeTruthy();
    });

    it('claim emission validation', async () => {
      const nonExistedAccount = Helper.getNonExistedAccountName();
      await expect(WalletApi.claimEmission(nonExistedAccount, 'sample_key')).rejects.toThrow(nonExistedAccountErrorRegex);

      const response = await WalletApi.claimEmission(accountName, 'sample_key');
      expect(response.success).toBeTruthy();
    });

    it('send tokens', async () => {
      await expect(WalletApi.sendTokens(accountName, 'sample_key', 'sample_acc_to', 0, '')).rejects.toThrow(positiveIntErrorRegex);
      // noinspection JSCheckFunctionSignatures
      await expect(WalletApi.sendTokens(accountName, 'sample_key', 'sample_acc_to', 'abc', '')).rejects.toThrow(positiveIntErrorRegex);

      const nonExistedAccount = Helper.getNonExistedAccountName();
      await expect(WalletApi.sendTokens(nonExistedAccount, 'sample_key', 'sample_acc_to', 1, '')).rejects.toThrow(nonExistedAccountErrorRegex);

      await expect(WalletApi.sendTokens(accountName, 'sample_key', nonExistedAccount, 1, '')).rejects.toThrow(nonExistedAccountErrorRegex);

      await expect(WalletApi.sendTokens(accountName, 'sample_key', accountName, 1000000, '')).rejects.toThrow(notEnoughTokensErrorRegex);

      const response = await WalletApi.sendTokens(accountName, 'sample_key', accountNameTo, 1, '');
      expect(response.success).toBeTruthy();
    }, 10000);

    it('stakeOrUnstakeTokens', async () => {
      await expect(WalletApi.stakeOrUnstakeTokens(accountName, 'sample', -1, 0)).rejects.toThrow(positiveOrZeroIntErrorRegex);
      await expect(WalletApi.stakeOrUnstakeTokens(accountName, 'sample', 0, -1)).rejects.toThrow(positiveOrZeroIntErrorRegex);

      const nonExistedAccount = Helper.getNonExistedAccountName();
      await expect(WalletApi.stakeOrUnstakeTokens(nonExistedAccount, 'sample', 0, 0)).rejects.toThrow(nonExistedAccountErrorRegex);

      await expect(WalletApi.stakeOrUnstakeTokens(accountName, 'sample', 10000000, 0)).rejects.toThrow(notEnoughTokensErrorRegex);
      await expect(WalletApi.stakeOrUnstakeTokens(accountName, 'sample', 0, 10000000)).rejects.toThrow(notEnoughTokensErrorRegex);

      const state = await WalletApi.getAccountState(accountName);

      const netTokens = state.resources.net.tokens.self_delegated;
      const cpuTokens = state.resources.cpu.tokens.self_delegated;

      const response1 = await WalletApi.stakeOrUnstakeTokens(accountName, 'sample', netTokens + 2, cpuTokens + 3);
      expect(response1.success).toBeTruthy();

      const response2 = await WalletApi.stakeOrUnstakeTokens(accountName, 'sample', netTokens - 1, cpuTokens - 2);
      expect(response2.success).toBeTruthy();

      const response3 = await WalletApi.stakeOrUnstakeTokens(accountName, 'sample', netTokens + 1, cpuTokens - 1);
      expect(response3.success).toBeTruthy();

      const response4 = await WalletApi.stakeOrUnstakeTokens(accountName, 'sample', netTokens - 1, cpuTokens + 1);
      expect(response4.success).toBeTruthy();
    }, 10000);

    it('getCurrentNetAndCpuStakedTokens', async () => {
      const nonExistedAccount = Helper.getNonExistedAccountName();
      await expect(WalletApi.getCurrentNetAndCpuStakedTokens(nonExistedAccount)).rejects.toThrow(nonExistedAccountErrorRegex);
    });
  });
});

export {};
