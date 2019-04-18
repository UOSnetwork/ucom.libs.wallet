import UosAccountsPropertiesApi = require('../../uos-accounts-properties/uos-accounts-properties-api');

const EosClient = require('../../eos-client');

const BP_STATUS__ACTIVE = 1;
const BP_STATUS__BACKUP = 2;

const TABLE_ROWS_LIMIT_ALL = 1000;
const TABLE_NAME__VOTERS   = 'voters';

const SMART_CONTRACT__EOSIO = 'eosio';

class BlockProducersService {
  public static async getBlockProducers() {
    const rpc = EosClient.getRpcClient();

    const [votersRows, producersSchedule, allProducers, uosAccounts] = await Promise.all([
      this.getVotesTableRows(),
      rpc.get_producer_schedule(),
      rpc.get_producers(true, '', TABLE_ROWS_LIMIT_ALL),
      UosAccountsPropertiesApi.getAllAccountsTableRows(),
    ]);

    const activeProducers = this.extractActiveProducers(producersSchedule);
    const { producerData, voters } = this.processVotersAndVotedProducers(votersRows, activeProducers, uosAccounts);
    this.addOtherProducers(allProducers, producerData);

    return {
      producerData,
      voters,
    };
  }

  private static extractActiveProducers(producersSchedule) {
    const activeProducers = {};
    if (producersSchedule && producersSchedule.active && producersSchedule.active.producers) {
      producersSchedule.active.producers.forEach(producerData => {
        activeProducers[producerData.producer_name] = true;
      });
    }

    return activeProducers;
  }

  private static addOtherProducers(allProducers, producerData): void {
    for (let i = 0; i < allProducers.rows.length; i += 1) {
      const producerSet = allProducers.rows[i];

      if (producerData[producerSet.owner]) {
        continue;
      }

      producerData[producerSet.owner] = {
        title:        producerSet.owner,
        votes_count:  0,
        votes_amount: 0,
        currency:     'UOS',
        bp_status:    BP_STATUS__BACKUP,
      };
    }
  }

  private static processVotersAndVotedProducers(
    votersRows,
    activeProducers,
    // @ts-ignore
    uosAccounts,
  ) {
    const voters = {};
    const producerData = {};

    for (let i = 0; i < votersRows.length; i++) {
      const voter = votersRows[i];

      voter.producers.forEach(producer => {
        if (!producerData[producer]) {
          producerData[producer] = {
            title:        producer,
            votes_count:  0,
            votes_amount: 0,
            currency:     'UOS',
            bp_status:    activeProducers[producer] ? BP_STATUS__ACTIVE : BP_STATUS__BACKUP,
          };
        }

        producerData[producer].votes_count++;
        producerData[producer].votes_amount += +voter.staked / 10000;
      });

      voters[voter.owner] = voter;
    }

    return {
      producerData,
      voters,
    }
  }

  private static async getVotesTableRows(): Promise<any> {
    return EosClient.getTableRowsWithBatching(
      SMART_CONTRACT__EOSIO,
      SMART_CONTRACT__EOSIO,
      TABLE_NAME__VOTERS,
      'owner',
      500,
    );
  }
}

export = BlockProducersService;
