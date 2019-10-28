import PermissionsDictionary = require('../../dictionary/permissions-dictionary');
import ContentTransactionsCommonFactory = require('../service/content-transactions-common-factory');
import EosClient = require('../../common/client/eos-client');
import SmartContractsDictionary = require('../../dictionary/smart-contracts-dictionary');
import WalletApi = require('../../wallet/api/wallet-api');

class ContentApi {
  public static async createProfileAfterRegistration(
    accountNameFrom: string,
    privateKey: string,
    isTrackingAllowed: boolean,
    userCreatedAt: string,
    permission: string = PermissionsDictionary.active(),
  ) {
    const profile = {
      account_name: accountNameFrom,
      is_tracking_allowed: isTrackingAllowed,
      profile_updated_at: userCreatedAt,
    };

    return ContentApi.updateProfile(accountNameFrom, privateKey, profile, permission);
  }

  public static async updateProfile(
    accountNameFrom: string,
    privateKey: string,
    profileJsonObject: any,
    permission: string = PermissionsDictionary.active(),
  ): Promise<any> {
    await ContentApi.isEnoughRamOrException(accountNameFrom, profileJsonObject);

    return ContentTransactionsCommonFactory.getSendProfileTransaction(
      accountNameFrom,
      privateKey,
      profileJsonObject,
      permission,
    );
  }

  public static async getOneAccountProfileFromSmartContractTable(
    accountName: string,
  ): Promise<{ acc: string; json_profile: any } | null> {
    const data = await EosClient.getJsonTableRows(
      SmartContractsDictionary.uosAccountInfo(),
      accountName,
      SmartContractsDictionary.accountProfileTableName(),
      1,
    );

    if (data.length === 0) {
      return null;
    }

    if (data.length !== 1) {
      throw new TypeError(`getOneAccountProfileFromSmartContractTable returns more than 1 profile data for ${accountName}`);
    }

    return data[0];
  }

  public static async isEnoughRamOrException(accountNameFrom: string, profileJsonObject: any) {
    const newProfileLength = JSON.stringify(profileJsonObject).length;

    const currentProfile: any = await ContentApi.getOneAccountProfileFromSmartContractTable(accountNameFrom);

    let currentProfileLength = 0;
    if (currentProfile) {
      currentProfileLength = JSON.stringify(currentProfile.profile_json).length;
    }

    const requiredRamInBytes = newProfileLength - currentProfileLength;

    if (requiredRamInBytes <= 0) {
      // RAM will be decreased
      return;
    }

    const currentState = await WalletApi.getAccountState(accountNameFrom);
    const { ram } = currentState.resources;

    const freeRamInBytes = ram.free * 1024;

    if (requiredRamInBytes > freeRamInBytes) {
      throw new Error(`
        Account ${accountNameFrom} has insufficient RAM. 
        Free RAM: ${ram.free} bytes, required: ${requiredRamInBytes} bytes. Overhead: ${requiredRamInBytes - freeRamInBytes} bytes
      `);
    }
  }
}

export = ContentApi;
