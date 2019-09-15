import { ITransactionPushResponse } from '../../../src/lib/common/interfaces/common-interfaces';

class TransactionsPushResponseHelper {
  public static getActionByInteractionOrError(response: ITransactionPushResponse, interaction: string) {
    const action = response.processed.action_traces.find((item) => item.act.data.action_json.includes(interaction));

    if (!action) {
      throw new TypeError(`There is no such action with interaction: ${interaction}`);
    }

    return action;
  }
}

export = TransactionsPushResponseHelper;
