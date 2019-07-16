/* eslint-disable no-useless-escape */
import SmartContractsActionsDictionary = require('../../../src/lib/dictionary/smart-contracts-actions-dictionary');

class SocialActionExpectedDataHelper {
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
