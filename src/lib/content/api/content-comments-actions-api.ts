import { Action } from 'eosjs/dist/eosjs-serialize';
import { IStringToAny } from '../../common/interfaces/common-interfaces';

import ContentHelper = require('../service/content-helper');
import InteractionsDictionary = require('../../dictionary/interactions-dictionary');
import ContentIdGenerator = require('../service/content-id-generator');
import SocialTransactionsCommonFactory = require('../../social-transactions/services/social-transactions-common-factory');
import TransactionsBuilder = require('../../service/transactions-builder');

class ContentCommentsActionsApi {
  public static getCreateCommentFromOrganizationAction(
    accountName: string,
    organizationBlockchainId: string,
    parentBlockchainId: string,
    givenContent: IStringToAny,
    isReply: boolean,
  ): Action {
    const parentEntityName = ContentHelper.getCommentParentEntityName(isReply);

    const interactionName = InteractionsDictionary.createCommentFromOrganization();

    const processedContent = {
      ...givenContent,
      ...ContentHelper.getDateTimeFields(true, true),
    };

    const contentId: string = ContentIdGenerator.getForComment();

    const content = ContentHelper.getContentWithExtraFields(
      processedContent,
      contentId,
      parentEntityName,
      parentBlockchainId,
      accountName,
    );

    const extraMetaData = {
      organization_id_from: organizationBlockchainId,
      parent_content_id: parentBlockchainId,
    };

    const metaData = ContentHelper.getMetadata(accountName, contentId, extraMetaData);

    const actionData = SocialTransactionsCommonFactory.getActionData(accountName, interactionName, metaData, content);

    return TransactionsBuilder.getSingleSocialUserAction(accountName, actionData);
  }
}

export = ContentCommentsActionsApi;
