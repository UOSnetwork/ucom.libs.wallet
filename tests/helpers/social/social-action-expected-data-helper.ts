/* eslint-disable no-useless-escape */
import SmartContractsActionsDictionary = require('../../../src/lib/dictionary/smart-contracts-actions-dictionary');
import SmartContractsDictionary = require('../../../src/lib/dictionary/smart-contracts-dictionary');
import TransactionsPushResponseChecker = require('../common/transactions-push-response-checker');
import CommonChecker = require('../common/common-checker');

class SocialActionExpectedDataHelper {
  public static expectSocialActionDataWithoutContent(
    response: any,
    accountName: string,
    interactionType: string,
    actionJsonData: any,
  ) {
    this.expectIsSocialAction(response);
    const actual = TransactionsPushResponseChecker.getDataFromPushResponse(response);

    const expected = {
      acc: accountName,
      action_data: '',
      action_json: JSON.stringify({
        interaction: interactionType,
        data: actionJsonData,
      }),
    };

    expect(actual).toEqual(expected);
  }

  public static expectIsSocialAction(response): void {
    CommonChecker.expectNotEmpty(response);
    CommonChecker.expectNotEmpty(response.processed);
    CommonChecker.expectNotEmpty(response.processed.action_traces);

    expect(response.processed.action_traces.length).toBe(1);

    const { act } = response.processed.action_traces[0];

    // Common social transactions checker
    expect(act.account).toBe(SmartContractsDictionary.uosActivity());
    expect(act.name).toBe(SmartContractsActionsDictionary.socialAction());
  }

  static getOneUserToOtherPushResponse(
    accountNameFrom: string,
    accountNameTo: string,
    interaction: string,
  ) {
    const data = {
      acc: accountNameFrom,
      action_json: `{\"interaction\":\"${interaction}\",\"data\":{\"account_from\":\"${accountNameFrom}\",\"account_to\":\"${accountNameTo}\"}}`,
      action_data: '',
    };

    return {
      producer_block_id: null,
      receipt: {
        status: 'executed',
      },
      scheduled: false,
      action_traces: [
        {
          receipt: {
            receiver: 'uos.activity',
          },
          act: {
            account: 'uos.activity',
            name: SmartContractsActionsDictionary.socialAction(),
            authorization: [
              {
                actor: accountNameFrom,
                permission: 'active',
              },
            ],
            data,
          },
          context_free: false,
          console: '',
          producer_block_id: null,
          account_ram_deltas: [],
          except: null,
          inline_traces: [],
        },
      ],
      except: null,
    };
  }
}

export = SocialActionExpectedDataHelper;
