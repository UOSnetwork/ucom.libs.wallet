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
  ): Action {
    const interactionName = InteractionsDictionary.createMediaPostFromOrganization();

    const publicationBlockchainId = ContentIdGenerator.getForMediaPost();
    const isNew = true;

    return CommonContentService.getSingleSocialContentActionFromOrganization(
      accountName,
      organizationBlockchainId,
      givenContent,
      publicationBlockchainId,
      isNew,
      entityNameFor,
      interactionName,
    );
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
    );
  }
}

export = ContentPublicationsActionsApi;
