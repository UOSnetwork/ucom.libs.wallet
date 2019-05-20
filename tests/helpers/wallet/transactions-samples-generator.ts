class TransactionsSamplesGenerator {
  public static getVoteForCalculatorsSample(accountNameFrom: string): any {
    return {
      action_traces: [
        {
          receipt: {
            receiver: 'eosio',
          },
          act: {
            account: 'eosio',
            name: 'votecalc',
            authorization: [
              {
                actor: accountNameFrom,
                permission: 'active',
              },
            ],
            data: {
              voter: accountNameFrom,
              calculators: [
                'initcalc1111',
                'initcalc1115',
              ],
            },
            // hex_data: '904cdcc9c49d4cdc02104208281a94dd74504208281a94dd74',
          },
          context_free: false,
          console: '',
          producer_block_id: null,
          except: null,
          inline_traces: [],
        },
      ],
    };
  }

  public static getVoteForCalculatorsEmptySample(accountNameFrom: string): any {
    return {
      action_traces: [
        {
          receipt: {
            receiver: 'eosio',
          },
          act: {
            account: 'eosio',
            name: 'votecalc',
            authorization: [
              {
                actor: accountNameFrom,
                permission: 'active',
              },
            ],
            data: {
              voter: accountNameFrom,
              calculators: [],
            },
            // hex_data: '904cdcc9c49d4cdc00',
          },
          context_free: false,
          console: '',
          producer_block_id: null,
          except: null,
          inline_traces: [],
        },
      ],
    };
  }
}

export = TransactionsSamplesGenerator;
