import PermissionsDictionary = require('../../dictionary/permissions-dictionary');
import InteractionsDictionary = require('../../dictionary/interactions-dictionary');
import ContentHelper = require('../service/content-helper');
import SocialTransactionsCommonFactory = require('../../social-transactions/services/social-transactions-common-factory');
import ContentIdGenerator = require('../service/content-id-generator');

class ContentOrganizationsApi {
  public static async signCreateOrganization(
    accountNameFrom: string,
    privateKey: string,
    givenContent: any,
    permission: string = PermissionsDictionary.active(),
  ): Promise<{ signed_transaction: any, blockchain_id: string }> {
    const interactionName = InteractionsDictionary.createOrganization();

    const content = {
      ...givenContent,
      ...ContentHelper.getDateTimeFields(true, true),
    };

    return this.signSendOrganizationToBlockchain(
      accountNameFrom,
      privateKey,
      permission,
      content,
      interactionName,
    );
  }

  public static async signUpdateOrganization(
    accountNameFrom: string,
    privateKey: string,
    givenContent: any,
    organizationBlockchainId: string,
    permission: string = PermissionsDictionary.active(),
  ): Promise<any> {
    const interactionName = InteractionsDictionary.updateOrganization();

    const content = {
      ...givenContent,
      ...ContentHelper.getDateTimeFields(false, true),
    };

    const { signed_transaction } = await this.signSendOrganizationToBlockchain(
      accountNameFrom,
      privateKey,
      permission,
      content,
      interactionName,
      organizationBlockchainId,
    );

    return signed_transaction;
  }

  public static async signResendOrganizations(
    authorAccountName: string,
    historicalSenderPrivateKey: string,
    givenContent: any,
    organizationBlockchainId: string,
  ): Promise<any> {
    const interactionName = InteractionsDictionary.createOrganization();

    const content = this.getContentWithExtraFields(
      givenContent,
      organizationBlockchainId,
      authorAccountName,
    );

    ContentHelper.checkCreatedAt(content);

    return SocialTransactionsCommonFactory.getSignedResendTransaction(
      historicalSenderPrivateKey,
      interactionName,
      this.getMetadata(authorAccountName, organizationBlockchainId),
      content,
      content.created_at,
    );
  }

  private static async signSendOrganizationToBlockchain(
    authorAccountName: string,
    privateKey: string,
    permission: string,
    givenContent: any,
    interactionName: string,
    givenOrganizationBlockchainId: string | null = null,
  ): Promise<{ signed_transaction: any, blockchain_id: string }> {
    const organizationBlockchainId: string = givenOrganizationBlockchainId || ContentIdGenerator.getForOrganization();

    const content = this.getContentWithExtraFields(
      givenContent,
      organizationBlockchainId,
      authorAccountName,
    );

    const signed_transaction = await SocialTransactionsCommonFactory.getSignedTransaction(
      authorAccountName,
      privateKey,
      interactionName,
      this.getMetadata(authorAccountName, organizationBlockchainId),
      content,
      permission,
    );

    return {
      signed_transaction,
      blockchain_id: organizationBlockchainId,
    };
  }

  private static getContentWithExtraFields(
    givenContent: any,
    contentId: string,
    authorAccountName: string,
  ) {
    const data = {
      blockchain_id:            contentId,
      author_account_name:      authorAccountName,
    };

    return {
      ...givenContent,
      ...data,
    };
  }

  private static getMetadata(authorAccountName: string, organizationBlockchainId: string) {
    return {
      account_from:     authorAccountName,
      organization_id:  organizationBlockchainId,
    };
  }
}

export = ContentOrganizationsApi;
