import { IStringToAny } from '../../common/interfaces/common-interfaces';

export interface IAccountData extends IStringToAny {
  permissions: IAccountDataPermission[];
}

export enum AuthPermissions {
  owner  = 'owner',
  active = 'active',
  social = 'social',
}

export interface IAccountDataPermission {
  perm_name: AuthPermissions,
  parent: string,
  required_auth: {
    threshold: number,
    keys: IStringToAny[],
    accounts: IAuthAccountPermissions[],
    waits: IStringToAny[],
  },
}

export interface IAuthAccountPermissions {
  permission: {
    actor:      string,
    permission: string
  },
  weight: number
}
