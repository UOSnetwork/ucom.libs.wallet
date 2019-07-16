import _ from 'lodash';
import uniqid from 'uniqid';

import PermissionsDictionary = require('../../dictionary/permissions-dictionary');
import SocialTransactionsCommonFactory = require('../../social-transactions/services/social-transactions-common-factory');

class ContentPublicationsApi {
  public static async signSendPublicationToBlockchainFromUser(
    accountNameFrom: string,
    privateKey: string,
    content: any,
    permission: string = PermissionsDictionary.active(),
  ): Promise<{ signed: any, contentId: string }> {
    if (_.isEmpty(content)) {
      throw new TypeError('Content is empty');
    }

    const uniqIdPrefix = 'pstms'; // TODO - move to the dictionary

    const metaData = {
      account_from: accountNameFrom,
      content_id: uniqid(`${uniqIdPrefix}-`), // TODO - generator to the separate service
    };

    // TODO - to the dictionary
    const interactionName = 'create_media_post_from_account';

    const signed = await SocialTransactionsCommonFactory.getSignedTransaction(
      accountNameFrom,
      privateKey,
      interactionName,
      metaData,
      content,
      permission,
    );

    return {
      signed,
      contentId: metaData.content_id,
    };
  }

  // TODO - refactoring. Almost the same as publication from User
  public static async signSendPublicationToBlockchainFromOrganization(
    accountNameFrom: string,
    privateKey: string,
    orgBlockchainId: string,
    content: any,
    permission: string = PermissionsDictionary.active(),
  ): Promise<{ signed: any, contentId: string }> {
    if (_.isEmpty(content)) {
      throw new TypeError('Content is empty');
    }

    const uniqIdPrefix = 'pstms'; // TODO - move to the dictionary

    const metaData = {
      account_from: accountNameFrom,
      content_id: uniqid(`${uniqIdPrefix}-`), // TODO - generator to the separate service
      organization_id_from: orgBlockchainId,
    };

    // TODO - to the dictionary
    const interactionName = 'create_media_post_from_organization';

    const signed = await SocialTransactionsCommonFactory.getSignedTransaction(
      accountNameFrom,
      privateKey,
      interactionName,
      metaData,
      content,
      permission,
    );

    return {
      signed,
      contentId: metaData.content_id,
    };
  }
}

export = ContentPublicationsApi;
