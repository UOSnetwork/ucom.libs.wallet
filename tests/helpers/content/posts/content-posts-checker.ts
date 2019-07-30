/* eslint-disable no-useless-escape */
import ContentPostsGenerator = require('./content-posts-generator');
import SmartContractsActionsDictionary = require('../../../../src/lib/dictionary/smart-contracts-actions-dictionary');

class ContentPostsChecker {
  public static checkPostPushingFromUserResponse(
    response: any,
    accountNameFrom: string,
    interactionName: string,
    contentId: string,
  ): void {
    const samplePost = ContentPostsGenerator.getSamplePostInputFields();

    const expectedData = {
      acc: accountNameFrom,
      action_json: `{\"interaction\":\"${interactionName}\",\"data\":{\"account_from\":\"${accountNameFrom}\",\"content_id\":\"${contentId}\"}}`,
      // #task - some fields are hardcoded
      action_data: `{\"title\":\"${samplePost.title}\",\"description\":\"${samplePost.description}\",\"leading_text\":\"${samplePost.leading_text}\",\"entity_images\":{},\"entity_tags\":[\"winter\",\"summer\"],`,
    };

    const expectedActName = SmartContractsActionsDictionary.socialAction();
    this.checkProcessedResponsePart(response, expectedData, expectedActName);
  }

  public static checkPostPushingFromOrganizationResponse(
    response: any,
    accountNameFrom: string,
    interactionName: string,
    contentId: string,
    orgBlockchainId: string,
  ): void {
    const expectedData = {
      acc: accountNameFrom,
      action_json: `{\"interaction\":\"${interactionName}\",\"data\":{\"account_from\":\"${accountNameFrom}\",\"content_id\":\"${contentId}\",\"organization_id_from\":\"${orgBlockchainId}\"}}`,
      action_data: '{\"title\":\"Cool sample post\",\"description\":\"Cool sample post description #winter #summer\",\"leading_text\":\"\",\"entity_images\":{},\"entity_tags\":[\"winter\",\"summer\"],',
    };

    const expectedActName = SmartContractsActionsDictionary.socialAction();
    this.checkProcessedResponsePart(response, expectedData, expectedActName);
  }

  public static checkResendPostPushingFromUserResponse(
    response: any,
    acc: string,
    accountNameFrom: string,
    interactionName: string,
    blockchainId: string,
    createdAt: string,
  ): void {
    const samplePost = ContentPostsGenerator.getSamplePostInputFields();

    const expectedData = {
      acc,
      action_json: `{\"interaction\":\"${interactionName}\",\"data\":{\"account_from\":\"${accountNameFrom}\",\"content_id\":\"${blockchainId}\"}}`,
      // #task - some fields are hardcoded
      action_data: `{\"title\":\"${samplePost.title}\",\"description\":\"${samplePost.description}\",\"leading_text\":\"${samplePost.leading_text}\",\"entity_images\":{},\"entity_tags\":[\"winter\",\"summer\"],\"created_at\":\"${createdAt}\",\"blockchain_id\":\"${blockchainId}\",\"entity_name_for\":\"users     \",\"entity_blockchain_id_for\":\"${accountNameFrom}\",\"author_account_name\":\"${accountNameFrom}\"}`,
    };

    const expectedActName = SmartContractsActionsDictionary.historicalSocialAction();
    this.checkProcessedResponsePart(response, expectedData, expectedActName, createdAt);
  }

  public static checkResendPostPushingFromOrganization(
    response: any,
    acc: string,
    accountNameFrom: string,
    interactionName: string,
    blockchainId: string,
    orgBlockchainId: string,
    createdAt: string,
  ): void {
    const samplePost = ContentPostsGenerator.getSamplePostInputFields();

    const expectedData = {
      acc,
      action_json: `{\"interaction\":\"${interactionName}\",\"data\":{\"account_from\":\"${accountNameFrom}\",\"content_id\":\"${blockchainId}\",\"organization_id_from\":\"${orgBlockchainId}\"}}`,
      action_data: `{\"title\":\"${samplePost.title}\",\"description\":\"${samplePost.description}\",\"leading_text\":\"${samplePost.leading_text}\",\"entity_images\":{},\"entity_tags\":[\"winter\",\"summer\"],\"created_at\":\"${createdAt}\",\"organization_blockchain_id\":\"${orgBlockchainId}\",\"blockchain_id\":\"${blockchainId}\",\"entity_name_for\":\"org       \",\"entity_blockchain_id_for\":\"${orgBlockchainId}\",\"author_account_name\":\"${accountNameFrom}\"}`,
    };

    const expectedActName = SmartContractsActionsDictionary.historicalSocialAction();

    this.checkProcessedResponsePart(response, expectedData, expectedActName, createdAt);
  }

  private static checkProcessedResponsePart(
    response,
    expectedData,
    expectedActName: string,
    createdAt: string | null = null,
  ): void {
    const { action_traces } = response.processed;
    expect(action_traces.length).toBe(1);

    const { act } = action_traces[0];
    expect(act.name).toBe(expectedActName);

    const { data } = act;

    expect(data.acc).toBe(expectedData.acc);
    expect(data.action_json).toBe(expectedData.action_json);
    expect(data.action_data).toMatch(expectedData.action_data);

    if (createdAt !== null) {
      expect(data.timestamp).toBe(createdAt);
    }
  }
}

export = ContentPostsChecker;
