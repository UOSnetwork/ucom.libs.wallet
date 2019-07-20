import _ from 'lodash';

import PermissionsDictionary = require('../../dictionary/permissions-dictionary');
import SocialTransactionsCommonFactory = require('../../social-transactions/services/social-transactions-common-factory');
import moment = require('moment');
import ContentIdGenerator = require('../service/content-id-generator');
import InteractionsDictionary = require('../../dictionary/interactions-dictionary');

const { PostFieldsValidator } = require('ucom.libs.common').Posts.Validator;
const { EntityNames } = require('ucom.libs.common').Common.Dictionary;

class ContentPublicationsApi {
  public static async signSendPublicationToBlockchainFromUser(
    accountNameFrom: string,
    privateKey: string,
    givenContent: any,
    permission: string = PermissionsDictionary.active(),
  ): Promise<{ signed: any, contentId: string }> {
    const interactionName = InteractionsDictionary.createMediaPostFromAccount();
    const entityNameFor: string = EntityNames.USERS;

    return this.signSendPublicationToBlockchain(
      accountNameFrom,
      privateKey,
      permission,
      givenContent,
      interactionName,
      entityNameFor,
      accountNameFrom,
    );
  }


  public static async signSendPublicationToBlockchainFromOrganization(
    accountNameFrom: string,
    privateKey: string,
    orgBlockchainId: string,
    givenContent: any,
    permission: string = PermissionsDictionary.active(),
  ): Promise<{ signed: any, contentId: string }> {
    const interactionName = InteractionsDictionary.createMediaPostFromOrganization();
    const entityNameFor: string = EntityNames.ORGANIZATIONS;
    const extraMetaData = {
      organization_id_from: orgBlockchainId,
    };

    const content = {
      ...givenContent,
      organization_blockchain_id: orgBlockchainId,
    };

    return this.signSendPublicationToBlockchain(
      accountNameFrom,
      privateKey,
      permission,
      content,
      interactionName,
      entityNameFor,
      orgBlockchainId,
      extraMetaData,
    );
  }

  private static async signSendPublicationToBlockchain(
    accountNameFrom: string,
    privateKey: string,
    permission: string,
    givenContent: any,
    interactionName: string,
    entityNameFor: string,
    entityBlockchainIdFor: string,
    extraMetaData: any = {},
  ): Promise<{ signed: any, contentId: string }> {
    if (_.isEmpty(givenContent)) {
      throw new TypeError('Content is empty');
    }

    const contentId: string = ContentIdGenerator.getForMediaPost();

    const content = {
      ...givenContent,
      ...this.getExtraFields(contentId, entityNameFor, entityBlockchainIdFor, accountNameFrom),
    };

    const { error } = PostFieldsValidator.validatePublicationFromEntity(content, entityNameFor);

    if (error !== null) {
      throw new TypeError(JSON.stringify(error));
    }

    const metaData = {
      account_from: accountNameFrom,
      content_id: contentId,
      ...extraMetaData,
    };

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

  private static getExtraFields(
    contentId: string,
    entityNameFor: string,
    entityBlockchainIdFor: string,
    authorAccountName: string,
  ) {
    const dateTime: string = moment().utc().format();

    return {
      blockchain_id:            contentId,
      entity_name_for:          entityNameFor,
      entity_blockchain_id_for: entityBlockchainIdFor,
      author_account_name:      authorAccountName,

      created_at:               dateTime,
      updated_at:               dateTime,
    };
  }
}

export = ContentPublicationsApi;
