import { IAccountData, IAccountDataPermission } from '../interfaces/account-data-interfaces';

const extractOnePermissionOrError = (accountData: IAccountData, name: string): IAccountDataPermission => {
  const permission = accountData.permissions.find((item: IAccountDataPermission) => item.perm_name === name);

  if (!permission) {
    throw new TypeError(`Unable to find a permission: ${permission}`);
  }

  return permission;
};

export const extractAccountsFromMultiSignaturePermission = (accountData: IAccountData, name: string): string[] => {
  const permission = extractOnePermissionOrError(accountData, name);

  return permission.required_auth.accounts.map((item) => item.permission.actor);
};
