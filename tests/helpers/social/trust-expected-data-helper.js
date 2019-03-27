class TrustExpectedDataHelper {
  static getOneUserToOtherPushResponse(accountNameFrom, accountNameTo) {
    return {
      "producer_block_id": null,
      "receipt": {
        "status": "executed",
      },
      "scheduled": false,
      "action_traces": [
      {
        "receipt": {
          "receiver": "uos.activity",
        },
        "act": {
          "account": "uos.activity",
          "name": "socialaction",
          "authorization": [
            {
              "actor": accountNameFrom,
              "permission": "active"
            }
          ],
          "data": {
            "acc": accountNameFrom,
            "action_json": `{\"interaction\":\"trust\",\"data\":{\"account_from\":\"${accountNameFrom}\",\"account_to\":\"${accountNameTo}\"}}`
          },
        },
        "context_free": false,
        "console": "",
        "producer_block_id": null,
        "account_ram_deltas": [],
        "except": null,
        "inline_traces": []
      }
    ],
      "except": null
    }
  }
}

module.exports = TrustExpectedDataHelper;
