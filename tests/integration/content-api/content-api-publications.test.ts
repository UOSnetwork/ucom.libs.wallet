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
        title:          'Cool sample post',
        description:    'Cool sample post description #winter #summer',
        leading_text:   '',
        entity_images:  {},
        entity_tags:    ['winter', 'summer'],
      };

      const { signed, contentId } = await ContentPublicationsApi.signSendPublicationToBlockchainFromUser(
        accountNameFrom,
        privateKey,
        content,
        permission,
      );

      const response = await EosClient.pushTransaction(signed);

      const expectedData = {
        acc: accountNameFrom,
        action_json: `{\"interaction\":\"create_media_post_from_account\",\"data\":{\"account_from\":\"${accountNameFrom}\",\"content_id\":\"${contentId}\"}}`,
        action_data: `{\"title\":\"Cool sample post\",\"description\":\"Cool sample post description\",\"leading_text\":\"\",\"entity_images\":{},\"entity_tags\":[\"winter\",\"summer\"],\"blockchain_id\":\"${contentId}",\"entity_name_for\":\"users     \",\"entity_blockchain_id_for\":\"${accountNameFrom}\",\"author_account_name\":\"${accountNameFrom}\",\"created_at\":\"`,
      };

      const processedData = response.processed.action_traces[0].act.data;

      expect(processedData.acc).toBe(expectedData.acc);
      expect(processedData.action_json).toBe(expectedData.action_json);
      expect(processedData.action_data).toMatch(expectedData.action_data);
    }, JEST_TIMEOUT);

    it('Send publication from organization to the blockchain', async () => {
      const content = {
        title:          'Cool sample post',
        description:    'Cool sample post description #winter #summer',
        leading_text:   '',
        entity_images:  {},
        entity_tags:    ['winter', 'summer'],
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
        acc: accountNameFrom,
        action_json: `{\"interaction\":\"create_media_post_from_organization\",\"data\":{\"account_from\":\"${accountNameFrom}\",\"content_id\":\"${contentId}\",\"organization_id_from\":\"${orgBlockchainId}\"}}`,
        action_data: `{\"title\":\"Cool sample post\",\"description\":\"Cool sample post description #winter #summer\",\"leading_text\":\"\",\"entity_images\":{},\"entity_tags\":[\"winter\",\"summer\"],\"organization_blockchain_id\":\"${orgBlockchainId}\",\"blockchain_id\":\"${contentId}\",\"entity_name_for\":\"org       \",\"entity_blockchain_id_for\":\"${orgBlockchainId}\",\"author_account_name\":\"${accountNameFrom}\",\"created_at\":\"`,
      };

      const processedData = response.processed.action_traces[0].act.data;

      expect(processedData.acc).toBe(expectedData.acc);
      expect(processedData.action_json).toBe(expectedData.action_json);
      expect(processedData.action_data).toMatch(expectedData.action_data);
    }, JEST_TIMEOUT);
  });
});

export {};
