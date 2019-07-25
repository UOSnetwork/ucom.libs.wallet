import PermissionsDictionary = require('../../dictionary/permissions-dictionary');
import SocialTransactionsCommonFactory = require('../../social-transactions/services/social-transactions-common-factory');
import moment = require('moment');
import ContentIdGenerator = require('../service/content-id-generator');
import InteractionsDictionary = require('../../dictionary/interactions-dictionary');

const { PostFieldsValidator } = require('ucom.libs.common').Posts.Validator;
const { EntityNames } = require('ucom.libs.common').Common.Dictionary;

class ContentPublicationsApi {
  public static async signCreatePublicationFromUser(
    accountNameFrom: string,
    privateKey: string,
    givenContent: any,
    permission: string = PermissionsDictionary.active(),
  ): Promise<{ signed_transaction: any, blockchain_id: string }> {
    const interactionName = InteractionsDictionary.createMediaPostFromAccount();
    const entityNameFor: string = EntityNames.USERS;

    const content = {
      ...givenContent,
      ...this.getDateTimeFields(true, true),
    };

    return this.signSendPublicationToBlockchain(
      accountNameFrom,
      privateKey,
      permission,
      content,
      interactionName,
      entityNameFor,
      accountNameFrom,
    );
  }

  public static async signUpdatePublicationFromUser(
    accountNameFrom: string,
    privateKey: string,
    givenContent: any,
    blockchainId: string,
    permission: string = PermissionsDictionary.active(),
  ): Promise<any> {
    const interactionName = InteractionsDictionary.updateMediaPostFromAccount();
    const entityNameFor: string = EntityNames.USERS;

    const content = {
      ...givenContent,
      updated_at: moment().utc().format(),
    };

    const { signed_transaction } = await this.signSendPublicationToBlockchain(
      accountNameFrom,
      privateKey,
      permission,
      content,
      interactionName,
      entityNameFor,
      accountNameFrom,
      {},
      blockchainId,
    );

    return signed_transaction;
  }

  public static async signCreatePublicationFromOrganization(
    accountNameFrom: string,
    privateKey: string,
    orgBlockchainId: string,
    givenContent: any,
    permission: string = PermissionsDictionary.active(),
  ): Promise<{ signed_transaction: any, blockchain_id: string }> {
    const interactionName = InteractionsDictionary.createMediaPostFromOrganization();
    const entityNameFor: string = EntityNames.ORGANIZATIONS;
    const extraMetaData = {
      organization_id_from: orgBlockchainId,
    };

    const content = {
      ...givenContent,
      ...this.getDateTimeFields(true, true),
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

  public static async signUpdatePublicationFromOrganization(
    accountNameFrom: string,
    privateKey: string,
    orgBlockchainId: string,
    givenContent: any,
    blockchainId: string,
    permission: string = PermissionsDictionary.active(),
  ): Promise<any> {
    const interactionName = InteractionsDictionary.updateMediaPostFromOrganization();
    const entityNameFor: string = EntityNames.ORGANIZATIONS;
    const extraMetaData = {
      organization_id_from: orgBlockchainId,
    };

    const content = {
      ...givenContent,
      organization_blockchain_id: orgBlockchainId,
      updated_at: moment().utc().format(),
    };

    const { signed_transaction } = await this.signSendPublicationToBlockchain(
      accountNameFrom,
      privateKey,
      permission,
      content,
      interactionName,
      entityNameFor,
      orgBlockchainId,
      extraMetaData,
      blockchainId,
    );

    return signed_transaction;
  }

  public static async signResendPublicationFromUser(
    authorAccountName: string,
    historicalSenderPrivateKey: string,
    givenContent: any,
    blockchainId: string,
  ): Promise<any> {
    const interactionName = InteractionsDictionary.createMediaPostFromAccount();
    const entityNameFor: string = EntityNames.USERS;

    return this.signResendPublicationToBlockchain(
      authorAccountName,
      historicalSenderPrivateKey,
      givenContent,
      interactionName,
      entityNameFor,
      authorAccountName,
      {},
      blockchainId,
    );
  }

  public static async signResendPublicationFromOrganization(
    authorAccountName: string,
    historicalSenderPrivateKey: string,
    orgBlockchainId: string,
    givenContent: any,
    blockchainId: string,
  ): Promise<any> {
    const interactionName = InteractionsDictionary.createMediaPostFromOrganization();
    const entityNameFor: string = EntityNames.ORGANIZATIONS;
    const extraMetaData = {
      organization_id_from: orgBlockchainId,
    };

    const content = {
      ...givenContent,
      organization_blockchain_id: orgBlockchainId,
    };

    return this.signResendPublicationToBlockchain(
      authorAccountName,
      historicalSenderPrivateKey,
      content,
      interactionName,
      entityNameFor,
      orgBlockchainId,
      extraMetaData,
      blockchainId,
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
    givenContentId: string | null = null,
  ): Promise<{ signed_transaction: any, blockchain_id: string }> {
    const contentId: string = givenContentId || ContentIdGenerator.getForMediaPost();
    const content = this.getContentWithExtraFields(
      givenContent,
      contentId,
      entityNameFor,
      entityBlockchainIdFor,
      accountNameFrom,
    );

    const { error } = PostFieldsValidator.validatePublicationFromEntity(content, entityNameFor);

    if (error !== null) {
      throw new TypeError(JSON.stringify(error));
    }

    const metaData = this.getMetadata(accountNameFrom, contentId, extraMetaData);

    const signed_transaction = await SocialTransactionsCommonFactory.getSignedTransaction(
      accountNameFrom,
      privateKey,
      interactionName,
      metaData,
      content,
      permission,
    );

    return {
      signed_transaction,
      blockchain_id: metaData.content_id,
    };
  }

  private static async signResendPublicationToBlockchain(
    contentAuthorAccountName: string,
    privateKey: string,
    givenContent: any,
    interactionName: string,
    entityNameFor: string,
    entityBlockchainIdFor: string,
    extraMetaData: any = {},
    contentId: string,
  ): Promise<{ signed_transaction: any, blockchain_id: string }> {
    const content = this.getContentWithExtraFields(
      givenContent,
      contentId,
      entityNameFor,
      entityBlockchainIdFor,
      contentAuthorAccountName,
    );

    if (!content.created_at) {
      throw new TypeError('created_at must exist inside a content');
    }

    if (!content.created_at.includes('Z')) {
      throw new TypeError('created_at be an UTC string');
    }

    const momentDate = moment(content.created_at);
    if (!momentDate.isValid()) {
      throw new TypeError(`Provided created_at value is not a valid datetime string: ${content.created_at}`);
    }

    const metaData = this.getMetadata(contentAuthorAccountName, contentId, extraMetaData);

    return SocialTransactionsCommonFactory.getSignedResendTransaction(
      privateKey,
      interactionName,
      metaData,
      content,
      content.created_at,
    );
  }

  private static getContentWithExtraFields(
    givenContent: any,
    contentId: string,
    entityNameFor: string,
    entityBlockchainIdFor: string,
    authorAccountName: string,
  ) {
    const data = {
      blockchain_id:            contentId,
      entity_name_for:          entityNameFor,
      entity_blockchain_id_for: entityBlockchainIdFor,
      author_account_name:      authorAccountName,
    };

    return {
      ...givenContent,
      ...data,
    };
  }

  private static getDateTimeFields(createdAt: boolean, updatedAt: boolean) {
    const data: any = {};

    if (createdAt) {
      data.created_at = moment().utc().format();
    }

    if (updatedAt) {
      data.updated_at = moment().utc().format();
    }

    return data;
  }

  private static getMetadata(
    accountNameFrom: string,
    contentId: string,
    extraMetaData: any,
  ) {
    return {
      account_from: accountNameFrom,
      content_id: contentId,
      ...extraMetaData,
    };
  }
}

export = ContentPublicationsApi;
