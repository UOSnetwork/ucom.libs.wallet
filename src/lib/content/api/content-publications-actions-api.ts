import { Action } from 'eosjs/dist/eosjs-serialize';
import { EntityNames } from 'ucom.libs.common';
import { IStringToAny } from '../../common/interfaces/common-interfaces';

import InteractionsDictionary = require('../../dictionary/interactions-dictionary');
import SocialTransactionsCommonFactory = require('../../social-transactions/services/social-transactions-common-factory');
import TransactionsBuilder = require('../../service/transactions-builder');
import ContentHelper = require('../service/content-helper');
import ContentIdGenerator = require('../service/content-id-generator');

class ContentPublicationsActionsApi {
  private static getProcessedContentForOrganization(
    accountName: string,
    givenContent: IStringToAny,
    organizationBlockchainId: string,
    givenContentId: string | null = null,
  ): IStringToAny {
    const dateTime = givenContentId ? ContentHelper.getDateTimeFields(false, true)
      :  ContentHelper.getDateTimeFields(true, true);

    const processedContent = {
      ...givenContent,
      ...dateTime,
      organization_blockchain_id: organizationBlockchainId,
    };

    const contentId: string = givenContentId || ContentIdGenerator.getForMediaPost();
    const content = ContentHelper.getContentWithExtraFields(
      processedContent,
      contentId,
      EntityNames.ORGANIZATIONS,
      organizationBlockchainId,
      accountName,
    );

    const extraMetaData = { organization_id_from: organizationBlockchainId };
    const metaData = ContentHelper.getMetadata(accountName, contentId, extraMetaData);

    return {
      content,
      metaData,
    };
  }

  public static getCreatePublicationFromOrganizationAction(
    accountName: string,
    orgBlockchainId: string,
    givenContent: IStringToAny,
  ): Action {
    const interactionName = InteractionsDictionary.createMediaPostFromOrganization();

    return this.getSingleSocialUserActionFromOrganization(accountName, orgBlockchainId, givenContent, interactionName);
  }

  public static getUpdatePublicationFromOrganizationAction(
    accountName: string,
    organizationsBlockchainId: string,
    givenContent: IStringToAny,
    publicationBlockchainId: string,
  ): Action {
    const interactionName = InteractionsDictionary.updateMediaPostFromOrganization();

    return this.getSingleSocialUserActionFromOrganization(
      accountName,
      organizationsBlockchainId,
      givenContent,
      interactionName,
      publicationBlockchainId,
    );
  }

  private static getSingleSocialUserActionFromOrganization(
    accountName: string,
    organizationBlockchainId: string,
    givenContent: IStringToAny,
    interactionName: string,
    givenContentId: string | null = null,
  ): Action {
    const { content, metaData } =
      this.getProcessedContentForOrganization(accountName, givenContent, organizationBlockchainId, givenContentId);

    const actionData = SocialTransactionsCommonFactory.getActionData(accountName, interactionName, metaData, content);

    return TransactionsBuilder.getSingleSocialUserAction(accountName, actionData);
  }
}

export = ContentPublicationsActionsApi;
