import { IBlockchainAction } from '../../common/interfaces/common-interfaces';

import RegistrationApi = require('../../registration/api/registration-api');
import PermissionsDictionary = require('../../dictionary/permissions-dictionary');
import EosClient = require('../../common/client/eos-client');
import SocialKeyApi = require('../../social-key/api/social-key-api');
import ActionsFactory = require('../../common/actions/actions-factory');

class MultiSignatureApi {
  public static async createMultiSignatureAccount(
    communityAuthorAccountName: string,
    communityAuthorActivePrivateKey: string,

    multiSignatureAccountName: string,
    multiSignatureOwnerPrivateKey: string,
    multiSignatureOwnerPublicKey: string,
    multiSignatureActivePublicKey: string,
  ) {
    await RegistrationApi.createNewAccountInBlockchain(
      communityAuthorAccountName,
      communityAuthorActivePrivateKey,
      multiSignatureAccountName,
      multiSignatureOwnerPublicKey,
      multiSignatureActivePublicKey,
    );

    const socialPermissionAction: IBlockchainAction = ActionsFactory.addOneUserAccountByUpdateAuthAction(
      multiSignatureAccountName,
      PermissionsDictionary.owner(),
      communityAuthorAccountName,
      PermissionsDictionary.social(),
      PermissionsDictionary.active(),
    );

    const activePermissionAction: IBlockchainAction = ActionsFactory.addOneUserAccountByUpdateAuthAction(
      multiSignatureAccountName,
      PermissionsDictionary.owner(),
      communityAuthorAccountName,
      PermissionsDictionary.active(),
      PermissionsDictionary.owner(),
    );

    const ownerPermissionAction: IBlockchainAction = ActionsFactory.addOneUserAccountByUpdateAuthAction(
      multiSignatureAccountName,
      PermissionsDictionary.owner(),
      communityAuthorAccountName,
      PermissionsDictionary.owner(),
      '',
    );

    const actions: IBlockchainAction[] = [
      socialPermissionAction,
      ...SocialKeyApi.getAssignSocialPermissionsActions(multiSignatureAccountName, PermissionsDictionary.owner()),

      activePermissionAction,
      ownerPermissionAction,
    ];

    return EosClient.sendTransaction(multiSignatureOwnerPrivateKey, actions);
  }
}

export = MultiSignatureApi;
