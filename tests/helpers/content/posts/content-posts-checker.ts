/* eslint-disable no-useless-escape */
import ContentPostsGenerator = require('./content-posts-generator');

class ContentPostsChecker {
  public static checkSamplePostPushingFromUserResponse(
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
      action_data: `{\"title\":\"${samplePost.title}\",\"description\":\"${samplePost.description}\",\"leading_text\":\"${samplePost.leading_text}\",\"entity_images\":{},\"entity_tags\":[\"winter\",\"summer\"],\"blockchain_id\":\"${contentId}",\"entity_name_for\":\"users     \",\"entity_blockchain_id_for\":\"${accountNameFrom}\",\"author_account_name\":\"${accountNameFrom}\",\"created_at\":\"`,
    };

    const processedData = response.processed.action_traces[0].act.data;

    expect(processedData.acc).toBe(expectedData.acc);
    expect(processedData.action_json).toBe(expectedData.action_json);
    expect(processedData.action_data).toMatch(expectedData.action_data);
  }

  public static checkSamplePostPushingFromOrganizationResponse(
    response: any,
    accountNameFrom: string,
    interactionName: string,
    contentId: string,
    orgBlockchainId: string,
  ): void {
    const expectedData = {
      acc: accountNameFrom,
      action_json: `{\"interaction\":\"${interactionName}\",\"data\":{\"account_from\":\"${accountNameFrom}\",\"content_id\":\"${contentId}\",\"organization_id_from\":\"${orgBlockchainId}\"}}`,
      action_data: `{\"title\":\"Cool sample post\",\"description\":\"Cool sample post description #winter #summer\",\"leading_text\":\"\",\"entity_images\":{},\"entity_tags\":[\"winter\",\"summer\"],\"organization_blockchain_id\":\"${orgBlockchainId}\",\"blockchain_id\":\"${contentId}\",\"entity_name_for\":\"org       \",\"entity_blockchain_id_for\":\"${orgBlockchainId}\",\"author_account_name\":\"${accountNameFrom}\",\"created_at\":\"`,
    };

    const processedData = response.processed.action_traces[0].act.data;

    expect(processedData.acc).toBe(expectedData.acc);
    expect(processedData.action_json).toBe(expectedData.action_json);
    expect(processedData.action_data).toMatch(expectedData.action_data);
  }
}

export = ContentPostsChecker;
