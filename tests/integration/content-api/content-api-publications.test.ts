/* eslint-disable security/detect-object-injection,no-useless-escape */
import Helper = require('../../helpers/helper');
import PermissionsDictionary = require('../../../src/lib/dictionary/permissions-dictionary');
import ContentPublicationsApi = require('../../../src/lib/content/api/content-publications-api');
import EosClient = require('../../../src/lib/common/client/eos-client');

const JEST_TIMEOUT = 15000;

describe('Send profile and get profile status', () => {
  Helper.initForEnvByProcessVariable();

  const accountNameFrom = Helper.getTesterAccountName();
  const privateKey      = Helper.getTesterAccountPrivateKey();
  const permission      = PermissionsDictionary.active();

  describe('Positive', () => {
    it('Send publication from User to the blockchain', async () => {
      const content = {
        title: 'Cool sample post',
        description: 'Cool sample post description',
      };

      const { signed, contentId } = await ContentPublicationsApi.signSendPublicationToBlockchainFromUser(
        accountNameFrom,
        privateKey,
        content,
        permission,
      );

      const response = await EosClient.pushTransaction(signed);

      const expectedData = {
        acc: 'vladvladvlad',
        action_json: `{\"interaction\":\"create_media_post_from_account\",\"data\":{\"account_from\":\"vladvladvlad\",\"content_id\":\"${contentId}\"}}`,
        action_data: '{\"title\":\"Cool sample post\",\"description\":\"Cool sample post description\"}',
      };

      expect(response.processed.action_traces[0].act.data).toMatchObject(expectedData);
    }, JEST_TIMEOUT);

    it('Send publication from organization to the blockchain', async () => {
      const content = {
        title: 'Cool sample post',
        description: 'Cool sample post description',
      };

      const orgBlockchainId = 'org-12345';

      const { signed, contentId } = await ContentPublicationsApi.signSendPublicationToBlockchainFromOrganization(
        accountNameFrom,
        privateKey,
        orgBlockchainId,
        content,
        permission,
      );

      const response = await EosClient.pushTransaction(signed);

      const expectedData = {
        acc: 'vladvladvlad',
        action_json: `{\"interaction\":\"create_media_post_from_organization\",\"data\":{\"account_from\":\"vladvladvlad\",\"content_id\":\"${contentId}\",\"organization_id_from\":\"${orgBlockchainId}\"}}`,
        action_data: '{\"title\":\"Cool sample post\",\"description\":\"Cool sample post description\"}',
      };

      expect(response.processed.action_traces[0].act.data).toMatchObject(expectedData);
    }, JEST_TIMEOUT);
  });
});

export {};
