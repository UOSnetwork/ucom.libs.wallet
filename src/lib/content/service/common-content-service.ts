import { IStringToAny } from '../../common/interfaces/common-interfaces';

import ContentHelper = require('./content-helper');
import SocialTransactionsCommonFactory = require('../../social-transactions/services/social-transactions-common-factory');
import TransactionsBuilder = require('../../service/transactions-builder');

class CommonContentService {
  public static getSingleSocialContentActionFromOrganization(
    accountName: string,
    organizationBlockchainId: string,
    givenContent: IStringToAny,
    contentBlockchainId: string,
    isNew: boolean,
    entityNameFor: string,
    interactionName: string,
    givenExtraMetaData: IStringToAny = {},
  ) {
    const extraMetaData = {
      organization_id_from: organizationBlockchainId,
      ...givenExtraMetaData,
    };

    const processedContent = {
      ...givenContent,
      ...ContentHelper.getDateTimeFields(isNew, true),
      organization_blockchain_id: organizationBlockchainId,
    };


    const content = ContentHelper.getContentWithExtraFields(
      processedContent,
      contentBlockchainId,
      entityNameFor,
      organizationBlockchainId,
      accountName,
    );


    const metaData = ContentHelper.getMetadata(accountName, contentBlockchainId, extraMetaData);

    const actionData = SocialTransactionsCommonFactory.getActionData(accountName, interactionName, metaData, content);

    return TransactionsBuilder.getSingleSocialUserAction(accountName, actionData);
  }
}

export = CommonContentService;
