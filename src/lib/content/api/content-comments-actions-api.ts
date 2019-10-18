import { Action } from 'eosjs/dist/eosjs-serialize';
import { IStringToAny } from '../../common/interfaces/common-interfaces';

import ContentHelper = require('../service/content-helper');
import InteractionsDictionary = require('../../dictionary/interactions-dictionary');
import ContentIdGenerator = require('../service/content-id-generator');
import CommonContentService = require('../service/common-content-service');

class ContentCommentsActionsApi {
  public static getCreateCommentFromOrganizationAction(
    accountName: string,
    organizationBlockchainId: string,
    parentBlockchainId: string,
    givenContent: IStringToAny,
    isReply: boolean,
  ): Action {
    const interactionName = InteractionsDictionary.createCommentFromOrganization();

    const commentBlockchainId: string = ContentIdGenerator.getForComment();
    const isNew = true;

    const { entityNameFor, metaData } = this.getEntityNameForAndMetaData(parentBlockchainId, isReply);

    return CommonContentService.getSingleSocialContentActionFromOrganization(
      accountName,
      organizationBlockchainId,
      givenContent,
      commentBlockchainId,
      isNew,
      entityNameFor,
      interactionName,
      metaData,
    );
  }

  public static getUpdateCommentFromOrganizationAction(
    accountName: string,
    organizationBlockchainId: string,
    parentBlockchainId: string,
    givenContent: IStringToAny,
    isReply: boolean,
    commentBlockchainId: string,
  ): Action {
    const interactionName = InteractionsDictionary.updateCommentFromOrganization();
    const isNew = false;

    const { entityNameFor, metaData } = this.getEntityNameForAndMetaData(parentBlockchainId, isReply);

    return CommonContentService.getSingleSocialContentActionFromOrganization(
      accountName,
      organizationBlockchainId,
      givenContent,
      commentBlockchainId,
      isNew,
      entityNameFor,
      interactionName,
      metaData,
    );
  }

  private static getEntityNameForAndMetaData(parentBlockchainId: string, isReply: boolean) {
    return {
      entityNameFor: ContentHelper.getCommentParentEntityName(isReply),
      metaData: {
        parent_content_id: parentBlockchainId,
      },
    };
  }
}

export = ContentCommentsActionsApi;
