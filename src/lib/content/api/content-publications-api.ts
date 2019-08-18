import PermissionsDictionary = require('../../dictionary/permissions-dictionary');
import SocialTransactionsCommonFactory = require('../../social-transactions/services/social-transactions-common-factory');
import moment = require('moment');
import ContentIdGenerator = require('../service/content-id-generator');
import InteractionsDictionary = require('../../dictionary/interactions-dictionary');
import ContentHelper = require('../service/content-helper');

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
      ...ContentHelper.getDateTimeFields(true, true),
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

  public static async signCreateCommentFromUser(
    accountNameFrom: string,
    privateKey: string,
    parentContentBlockchainId: string,
    givenContent: any,
    isReply: boolean,
    permission: string = PermissionsDictionary.active(),
  ): Promise<{ signed_transaction: any, blockchain_id: string }> {
    const parentEntityName = this.getCommentParentEntityName(isReply);

    const interactionName = InteractionsDictionary.createCommentFromAccount();

    const content = {
      ...givenContent,
      ...ContentHelper.getDateTimeFields(true, true),
    };

    return this.signSendCommentToBlockchain(
      accountNameFrom,
      privateKey,
      permission,
      content,
      interactionName,
      parentEntityName,
      parentContentBlockchainId,
    );
  }

  public static async signResendCommentFromAccount(
    authorAccountName: string,
    historicalSenderPrivateKey: string,
    givenContent: any,
    blockchainId: string,
    parentContentBlockchainId: string,
    isReply: boolean,
  ): Promise<any> {
    const interactionName = InteractionsDictionary.createCommentFromAccount();
    const parentEntityName = this.getCommentParentEntityName(isReply);

    const extraMetadata = {
      parent_content_id: parentContentBlockchainId,
    };

    return this.signResendPublicationToBlockchain(
      authorAccountName,
      historicalSenderPrivateKey,
      givenContent,
      interactionName,
      parentEntityName,
      parentContentBlockchainId,
      extraMetadata,
      blockchainId,
    );
  }

  public static async signCreateCommentFromOrganization(
    accountNameFrom: string,
    privateKey: string,
    parentContentBlockchainId: string,
    organizationBlockchainId: string,
    givenContent: any,
    isReply: boolean,
    permission: string = PermissionsDictionary.active(),
  ): Promise<{ signed_transaction: any, blockchain_id: string }> {
    const parentEntityName = this.getCommentParentEntityName(isReply);

    const interactionName = InteractionsDictionary.createCommentFromOrganization();

    const content = {
      ...givenContent,
      ...ContentHelper.getDateTimeFields(true, true),
    };

    const extraMetaData = {
      organization_id_from: organizationBlockchainId,
    };

    return this.signSendCommentToBlockchain(
      accountNameFrom,
      privateKey,
      permission,
      content,
      interactionName,
      parentEntityName,
      parentContentBlockchainId,
      extraMetaData,
    );
  }

  public static async signResendCommentFromOrganization(
    authorAccountName: string,
    historicalSenderPrivateKey: string,
    givenContent: any,
    blockchainId: string,
    parentContentBlockchainId: string,
    organizationBlockchainId: string,
    isReply: boolean,
  ): Promise<any> {
    const interactionName = InteractionsDictionary.createCommentFromOrganization();
    const parentEntityName = this.getCommentParentEntityName(isReply);

    const extraMetadata = {
      parent_content_id:    parentContentBlockchainId,
      organization_id_from: organizationBlockchainId,
    };

    return this.signResendPublicationToBlockchain(
      authorAccountName,
      historicalSenderPrivateKey,
      givenContent,
      interactionName,
      parentEntityName,
      parentContentBlockchainId,
      extraMetadata,
      blockchainId,
    );
  }

  public static async signCreateDirectPostForAccount(
    accountNameFrom: string,
    privateKey: string,
    accountNameTo: string,
    givenContent: any,
    permission: string = PermissionsDictionary.active(),
  ): Promise<{ signed_transaction: any, blockchain_id: string }> {
    const interactionName: string = InteractionsDictionary.createDirectPostForAccount();
    const entityNameFor: string   = EntityNames.USERS;

    const extraMetadata = {
      account_to: accountNameTo,
    };

    const content = {
      ...givenContent,
      ...ContentHelper.getDateTimeFields(true, true),
    };

    return this.signSendDirectPostToBlockchain(
      accountNameFrom,
      privateKey,
      permission,
      content,
      interactionName,
      entityNameFor,
      accountNameTo,
      extraMetadata,
    );
  }

  public static async signCreateRepostPostForAccount(
    accountNameFrom: string,
    privateKey: string,
    parentContentId: string,
    givenContent: any,
    permission: string = PermissionsDictionary.active(),
  ): Promise<{ signed_transaction: any, blockchain_id: string }> {
    const interactionName: string = InteractionsDictionary.createRepostFromAccount();
    const entityNameFor: string   = EntityNames.USERS;

    const extraMetaData = {
      parent_content_id: parentContentId,
    };

    const contentId: string = ContentIdGenerator.getForRepost();

    const givenContentWithExtraFields = this.getContentWithExtraFields(
      givenContent,
      contentId,
      entityNameFor,
      accountNameFrom,
      accountNameFrom,
    );

    const content = {
      ...givenContentWithExtraFields,
      ...ContentHelper.getDateTimeFields(true, true),
    };

    // #task - add validator like for publication (media post)

    const metaData = ContentHelper.getMetadata(accountNameFrom, contentId, extraMetaData);

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

  public static async signCreateDirectPostForOrganization(
    accountNameFrom: string,
    organizationBlockchainIdTo: string,
    privateKey: string,
    givenContent: any,
    permission: string = PermissionsDictionary.active(),
  ): Promise<{ signed_transaction: any, blockchain_id: string }> {
    const interactionName: string = InteractionsDictionary.createDirectPostForOrganization();
    const entityNameFor: string   = EntityNames.ORGANIZATIONS;

    const extraMetadata = {
      organization_id_to: organizationBlockchainIdTo,
    };

    const content = {
      ...givenContent,
      ...ContentHelper.getDateTimeFields(true, true),
    };

    return this.signSendDirectPostToBlockchain(
      accountNameFrom,
      privateKey,
      permission,
      content,
      interactionName,
      entityNameFor,
      organizationBlockchainIdTo,
      extraMetadata,
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

  public static async signUpdateDirectPostForAccount(
    accountNameFrom: string,
    privateKey: string,
    accountNameTo: string,
    givenContent: any,
    blockchainId: string,
    permission: string = PermissionsDictionary.active(),
  ): Promise<any> {
    const interactionName = InteractionsDictionary.updateDirectPostForAccount();
    const entityNameFor: string = EntityNames.USERS;

    const content = {
      ...givenContent,
      updated_at: moment().utc().format(),
    };

    const extraMetadata = {
      account_to: accountNameTo,
    };

    const { signed_transaction } = await this.signSendDirectPostToBlockchain(
      accountNameFrom,
      privateKey,
      permission,
      content,
      interactionName,
      entityNameFor,
      accountNameTo,
      extraMetadata,
      blockchainId,
    );

    return signed_transaction;
  }

  public static async signUpdateDirectPostForOrganization(
    accountNameFrom: string,
    privateKey: string,
    organizationBlockchainIdTo: string,
    givenContent: any,
    blockchainId: string,
    permission: string = PermissionsDictionary.active(),
  ): Promise<any> {
    const interactionName = InteractionsDictionary.updateDirectPostForOrganization();
    const entityNameFor: string = EntityNames.ORGANIZATIONS;

    const content = {
      ...givenContent,
      updated_at: moment().utc().format(),
    };

    const extraMetadata = {
      organization_id_to: organizationBlockchainIdTo,
    };

    const { signed_transaction } = await this.signSendDirectPostToBlockchain(
      accountNameFrom,
      privateKey,
      permission,
      content,
      interactionName,
      entityNameFor,
      organizationBlockchainIdTo,
      extraMetadata,
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
      ...ContentHelper.getDateTimeFields(true, true),
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

  public static async signResendDirectPostsToAccount(
    authorAccountName: string,
    historicalSenderPrivateKey: string,
    accountNameTo: string,
    givenContent: any,
    blockchainId: string,
  ): Promise<any> {
    const interactionName = InteractionsDictionary.createDirectPostForAccount();
    const entityNameFor: string = EntityNames.USERS;

    const extraMetadata = {
      account_to: accountNameTo,
    };

    return this.signResendPublicationToBlockchain(
      authorAccountName,
      historicalSenderPrivateKey,
      givenContent,
      interactionName,
      entityNameFor,
      accountNameTo,
      extraMetadata,
      blockchainId,
    );
  }

  public static async signResendReposts(
    authorAccountName: string,
    historicalSenderPrivateKey: string,
    parentBlockchainId,
    givenContent: any,
    blockchainId: string,
  ): Promise<any> {
    const interactionName = InteractionsDictionary.createRepostFromAccount();
    const entityNameFor: string = EntityNames.USERS;

    const extraMetadata = {
      parent_content_id: parentBlockchainId,
    };

    return this.signResendPublicationToBlockchain(
      authorAccountName,
      historicalSenderPrivateKey,
      givenContent,
      interactionName,
      entityNameFor,
      authorAccountName,
      extraMetadata,
      blockchainId,
    );
  }

  public static async signResendDirectPostsToOrganization(
    authorAccountName: string,
    historicalSenderPrivateKey: string,
    organizationBlockchainId: string,
    givenContent: any,
    blockchainId: string,
  ): Promise<any> {
    const interactionName = InteractionsDictionary.createDirectPostForOrganization();
    const entityNameFor: string = EntityNames.ORGANIZATIONS;

    const extraMetadata = {
      organization_id_to: organizationBlockchainId,
    };

    return this.signResendPublicationToBlockchain(
      authorAccountName,
      historicalSenderPrivateKey,
      givenContent,
      interactionName,
      entityNameFor,
      organizationBlockchainId,
      extraMetadata,
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

    const metaData = ContentHelper.getMetadata(accountNameFrom, contentId, extraMetaData);

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

  private static async signSendCommentToBlockchain(
    accountNameFrom: string,
    privateKey: string,
    permission: string,
    givenContent: any,
    interactionName: string,
    parentEntityName: string,
    parentBlockchainId: string,
    givenExtraMetaData: any = {},
  ): Promise<{ signed_transaction: any, blockchain_id: string }> {
    const contentId: string = ContentIdGenerator.getForComment();

    const content = this.getContentWithExtraFields(
      givenContent,
      contentId,
      parentEntityName,
      parentBlockchainId,
      accountNameFrom,
    );

    const extraMetaData = {
      ...givenExtraMetaData,
      parent_content_id: parentBlockchainId,
    };

    const metaData = ContentHelper.getMetadata(accountNameFrom, contentId, extraMetaData);

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

  private static async signSendDirectPostToBlockchain(
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
    const contentId: string = givenContentId || ContentIdGenerator.getForDirectPost();

    const content = this.getContentWithExtraFields(
      givenContent,
      contentId,
      entityNameFor,
      entityBlockchainIdFor,
      accountNameFrom,
    );

    // #task - add validator like for publication (media post)

    const metaData = ContentHelper.getMetadata(accountNameFrom, contentId, extraMetaData);

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

    const metaData = ContentHelper.getMetadata(contentAuthorAccountName, contentId, extraMetaData);

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


  private static getCommentParentEntityName(isReply: boolean): string {
    return isReply ? EntityNames.COMMENTS : EntityNames.POSTS;
  }
}

export = ContentPublicationsApi;
