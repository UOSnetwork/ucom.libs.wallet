/* eslint-disable unicorn/prevent-abbreviations,sonarjs/no-duplicate-string,security/detect-object-injection,max-len,no-restricted-syntax */
import ConfigService = require('../../../src/config/config-service');

import _ = require('lodash');
import UosAccountsPropertiesApi = require('../../../src/lib/uos-accounts-properties/uos-accounts-properties-api');

const JEST_TIMEOUT = 15000;

ConfigService.initNodeJsEnv();
ConfigService.initForStagingEnv();

describe('UOS accounts properties', () => {
  it('get all at once', async () => {
    const lowerBound = 0;
    const limit = 5000;

    const allRows = await UosAccountsPropertiesApi.getAccountsTableRows(lowerBound, limit);
    const allRowsWithPagination = await UosAccountsPropertiesApi.getAllAccountsTableRows();

    expect(allRows.accounts.length).toBe(allRowsWithPagination.length);
  }, JEST_TIMEOUT);

  it('get table rows and check the interface', async () => {
    const lowerBound = 0;
    const limit = 1500;

    const rows = await UosAccountsPropertiesApi.getAccountsTableRows(lowerBound, limit);

    expect(rows.lower_bound).toBe(lowerBound);
    expect(rows.limit).toBe(limit);

    expect(typeof rows.total).toBe('number');
    expect(rows.total).toBeGreaterThan(0);

    expect(_.isEmpty(rows.accounts)).toBeFalsy();
    expect(rows.accounts.length).toBeGreaterThan(0);

    const expectedFields = [
      'staked_balance',
      'validity',
      'importance',
      'scaled_importance',

      'stake_rate',
      'scaled_stake_rate',

      'social_rate',
      'scaled_social_rate',

      'transfer_rate',
      'scaled_transfer_rate',

      'previous_cumulative_emission',
      'current_emission',
      'current_cumulative_emission',
    ];

    for (const item of rows.accounts) {
      expect(typeof item.name).toBe('string');
      expect(item.name.length).toBeGreaterThanOrEqual(3);

      const { values } = item;
      expect(_.isEmpty(values)).toBeFalsy();
      expect(typeof values).toBe('object');

      for (const expectedField of expectedFields) {
        expect(typeof values[expectedField]).toBe('string');
        expect(values.current_cumulative_emission.length).toBeGreaterThan(0);

        const numeric = +values[expectedField];
        expect(Number.isFinite(numeric)).toBeTruthy();
        expect(numeric).toBeGreaterThanOrEqual(0);
      }
    }
  }, JEST_TIMEOUT);

  it('check pagination bounds', async () => {
    let offset = 0;
    const limit = 5;

    const firstRowsSet = await UosAccountsPropertiesApi.getAccountsTableRows(offset, limit);
    offset += limit;
    const secondRowsSet = await UosAccountsPropertiesApi.getAccountsTableRows(offset, limit);
    offset += limit;
    const thirdRowsSet = await UosAccountsPropertiesApi.getAccountsTableRows(offset, limit);

    const expectedRowsSet = await UosAccountsPropertiesApi.getAccountsTableRows(0, 15);

    const actualRows: any = Array.prototype.concat(
      firstRowsSet.accounts,
      secondRowsSet.accounts,
      thirdRowsSet.accounts,
    );

    expect(actualRows.length).toBe(expectedRowsSet.accounts.length);
    expect(actualRows).toMatchObject(expectedRowsSet.accounts);
  }, JEST_TIMEOUT);
});

export {};
