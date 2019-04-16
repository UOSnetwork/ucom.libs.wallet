/* eslint-disable unicorn/prevent-abbreviations,sonarjs/no-duplicate-string,security/detect-object-injection,max-len,no-restricted-syntax */
import ConfigService = require('../../../config/config-service');

import _ = require('lodash');
import UosAccountsPropertiesApi = require('../../../lib/uos-accounts-properties/uos-accounts-properties-api');

const JEST_TIMEOUT = 10000;

ConfigService.initNodeJsEnv();
ConfigService.initForStagingEnv();

describe('UOS accounts properties', () => {
  it('get table rows and check the interface', async () => {
    const lowerBound = 2;
    const limit = 500;

    const rows = await UosAccountsPropertiesApi.getImportanceTableRows(lowerBound, limit);

    expect(rows.lower_bound).toBe(lowerBound);
    expect(rows.limit).toBe(limit);

    expect(typeof rows.total).toBe('number');
    expect(rows.total).toBeGreaterThan(limit);

    expect(_.isEmpty(rows.accounts)).toBeFalsy();
    expect(rows.accounts.length).toBe(limit);

    for (const item of rows.accounts) {
      expect(typeof item.name).toBe('string');
      expect(item.name.length).toBe(12);

      const { values } = item;

      expect(_.isEmpty(values)).toBeFalsy();
      expect(typeof values).toBe('object');

      expect(typeof values.current_cumulative_emission).toBe('string');
      expect(values.current_cumulative_emission.length).toBeGreaterThan(0);

      expect(typeof values.current_emission).toBe('string');
      expect(values.current_emission.length).toBeGreaterThan(0);

      expect(typeof values.importance).toBe('string');
      expect(values.importance.length).toBeGreaterThan(0);

      expect(typeof values.prev_cumulative_emission).toBe('string');
      expect(values.prev_cumulative_emission.length).toBeGreaterThan(0);

      expect(typeof values.scaled_importance).toBe('string');
      expect(values.scaled_importance.length).toBeGreaterThan(0);

      expect(typeof values.scaled_social_rate).toBe('string');
      expect(values.scaled_social_rate.length).toBeGreaterThan(0);

      expect(typeof values.scaled_stake_rate).toBe('string');
      expect(values.scaled_stake_rate.length).toBeGreaterThan(0);

      expect(typeof values.scaled_transfer_rate).toBe('string');
      expect(values.scaled_transfer_rate.length).toBeGreaterThan(0);

      expect(typeof values.social_rate).toBe('string');
      expect(values.social_rate.length).toBeGreaterThan(0);

      expect(typeof values.staked_balance).toBe('string');
      expect(values.staked_balance.length).toBeGreaterThan(0);

      expect(typeof values.stake_rate).toBe('string');
      expect(values.stake_rate.length).toBeGreaterThan(0);

      expect(typeof values.validity).toBe('string');
      expect(values.validity.length).toBeGreaterThan(0);
    }
  }, JEST_TIMEOUT);

  it('check pagination bounds', async () => {
    let offset = 0;
    const limit = 5;

    const firstRowsSet = await UosAccountsPropertiesApi.getImportanceTableRows(offset, limit);
    offset += limit;
    const secondRowsSet = await UosAccountsPropertiesApi.getImportanceTableRows(offset, limit);
    offset += limit;
    const thirdRowsSet = await UosAccountsPropertiesApi.getImportanceTableRows(offset, limit);

    const expectedRowsSet = await UosAccountsPropertiesApi.getImportanceTableRows(0, 15);

    const actualRows: any = Array.prototype.concat(
      firstRowsSet.accounts,
      secondRowsSet.accounts,
      thirdRowsSet.accounts,
    );

    expect(actualRows.length).toBe(expectedRowsSet.accounts.length);
    expect(actualRows).toMatchObject(expectedRowsSet.accounts);
  }, JEST_TIMEOUT);
});
