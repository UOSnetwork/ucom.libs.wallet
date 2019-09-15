/* eslint-disable no-useless-escape */
import { IStringToAny, ITransactionPushResponse } from '../../../src/lib/common/interfaces/common-interfaces';

import SmartContractsActionsDictionary = require('../../../src/lib/dictionary/smart-contracts-actions-dictionary');
import SmartContractsDictionary = require('../../../src/lib/dictionary/smart-contracts-dictionary');
import TransactionsPushResponseChecker = require('../common/transactions-push-response-checker');
import CommonChecker = require('../common/common-checker');
import PermissionsDictionary = require('../../../src/lib/dictionary/permissions-dictionary');
import TransactionsPushResponseHelper = require('../common/transactions-push-response-helper');

class SocialActionExpectedDataHelper {
  public static expectTrustActionInsidePushResponse(
    pushResponse: ITransactionPushResponse,
    interaction: string,
    accountFrom: string,
    accountTo: string,
  ): void {
    const actionTrust = TransactionsPushResponseHelper.getActionByInteractionOrError(pushResponse, interaction);

    this.expectTrustActionJson(actionTrust, interaction, accountFrom, accountTo);
  }

  public static expectAutoUpdateActionInsidePushResponse(
    pushResponse: ITransactionPushResponse,
    interaction: string,
    accountFrom: string,
    blockchainId: string,
  ): void {
    CommonChecker.expectNotEmpty(blockchainId);

    const action = TransactionsPushResponseHelper.getActionByInteractionOrError(
      pushResponse,
      interaction,
    );

    this.expectAutoUpdateActionJson(action, interaction, accountFrom, blockchainId);
  }

  public static expectTrustActionJson(
    action: IStringToAny,
    interaction: string,
    accountFrom: string,
    accountTo: string,
  ): void {
    CommonChecker.expectNotEmpty(action);

    const trustActionJson = {
      interaction,
      data: {
        account_from: accountFrom,
        account_to: accountTo,
      },
    };

    const actualActionJson = JSON.parse(action.act.data.action_json);

    expect(actualActionJson).toEqual(trustActionJson);
  }

  private static expectAutoUpdateActionJson(
    action: IStringToAny,
    interaction: string,
    accountFrom: string,
    contentId: string,
  ): void {
    CommonChecker.expectNotEmpty(action);

    const trustActionJson = {
      interaction,
      data: {
        account_from: accountFrom,
        content_id:   contentId,
      },
    };

    expect(JSON.parse(action.act.data.action_json)).toEqual(trustActionJson);
  }

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

  public static getOneUserToOtherPushResponse(
    accountNameFrom: string,
    blockchainIdTo: string,
    interaction: string,
    blockchainIdKey: string = 'account_to',
    permission: string = PermissionsDictionary.active(),
  ) {
    const data = {
      acc: accountNameFrom,
      action_json: `{\"interaction\":\"${interaction}\",\"data\":{\"account_from\":\"${accountNameFrom}\",\"${blockchainIdKey}\":\"${blockchainIdTo}\"}}`,
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
                permission,
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
