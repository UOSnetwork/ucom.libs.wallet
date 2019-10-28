import { Action } from 'eosjs/dist/eosjs-serialize';
import { EntityNames } from 'ucom.libs.common';
import { IStringToAny } from '../../common/interfaces/common-interfaces';

import InteractionsDictionary = require('../../dictionary/interactions-dictionary');
import ContentIdGenerator = require('../service/content-id-generator');
import CommonContentService = require('../service/common-content-service');

const entityNameFor = EntityNames.ORGANIZATIONS;

class ContentPublicationsActionsApi {
  public static getCreatePublicationFromOrganizationAction(
    accountName: string,
    organizationBlockchainId: string,
    givenContent: IStringToAny,
  ): { blockchain_id: string, action: Action } {
    const interactionName = InteractionsDictionary.createMediaPostFromOrganization();

    const publicationBlockchainId = ContentIdGenerator.getForMediaPost();
    const isNew = true;

    const action = CommonContentService.getSingleSocialContentActionFromOrganization(
      accountName,
      organizationBlockchainId,
      givenContent,
      publicationBlockchainId,
      isNew,
      entityNameFor,
      interactionName,
      organizationBlockchainId,
    );

    return {
      action,
      blockchain_id: publicationBlockchainId,
    };
  }

  public static getUpdatePublicationFromOrganizationAction(
    accountName: string,
    organizationBlockchainId: string,
    givenContent: IStringToAny,
    publicationBlockchainId: string,
  ): Action {
    const interactionName = InteractionsDictionary.updateMediaPostFromOrganization();
    const isNew = false;

    return CommonContentService.getSingleSocialContentActionFromOrganization(
      accountName,
      organizationBlockchainId,
      givenContent,
      publicationBlockchainId,
      isNew,
      entityNameFor,
      interactionName,
      organizationBlockchainId,
    );
  }
}

export = ContentPublicationsActionsApi;
