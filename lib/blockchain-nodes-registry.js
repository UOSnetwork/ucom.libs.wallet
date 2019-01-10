const EosClient = require('./eos-client');

const BP_STATUS__ACTIVE = 1;
const BP_STATUS__BACKUP = 2;

const TABLE_ROWS_LIMIT_ALL = 999999;
const TABLE_NAME__VOTERS        = 'voters';

const SMART_CONTRACT__EOSIO = 'eosio';

class BlockchainNodesRegistry {
  static async getBlockchainNodes() {
    const rpc = EosClient.getRpcClient();

    // noinspection JSCheckFunctionSignatures
    const [votersRows, producersSchedule, allProducers] = await Promise.all([
      this._getVotesTableRows(),
      rpc.get_producer_schedule(),
      rpc.get_producers(true, "", TABLE_ROWS_LIMIT_ALL),
    ]);

    const activeProducers = this._extractActiveProducers(producersSchedule);
    const {producerData, voters} = this._processVotersAndVotedProducers(votersRows, activeProducers);
    this._addOtherProducers(allProducers, producerData);

    return {
      producerData,
      voters,
    };
  }

  /**
   *
   * @param {Object} producersSchedule
   * @private
   */
  static _extractActiveProducers(producersSchedule) {
    const activeProducers = {};
    if (producersSchedule && producersSchedule.active && producersSchedule.active.producers) {
      producersSchedule.active.producers.forEach(producerData => {
        activeProducers[producerData.producer_name] = true;
      });
    }

    return activeProducers;
  }

  /**
   *
   * @param {Object[]} allProducers
   * @param {Object[]} producerData
   * @private
   */
  static _addOtherProducers(allProducers, producerData) {
    for (let i = 0; i < allProducers.rows.length; i++) {
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

  /**
   *
   * @param {Object} votersRows
   * @param {Object[]} activeProducers
   * @private
   */
  static _processVotersAndVotedProducers(votersRows, activeProducers) {
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

  /**
   *
   * @return {Promise<Object>}
   * @private
   */
  static async _getVotesTableRows() {
    return EosClient.getTableRowsWithBatching(
      SMART_CONTRACT__EOSIO,
      SMART_CONTRACT__EOSIO,
      TABLE_NAME__VOTERS,
    );
  }
}

module.exports = BlockchainNodesRegistry;