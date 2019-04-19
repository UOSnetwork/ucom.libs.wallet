"use strict";
const BP_STATUS__ACTIVE = 1;
const BP_STATUS__BACKUP = 2;
class BlockchainNodesStatusesDictionary {
    static statusActive() {
        return BP_STATUS__ACTIVE;
    }
    static statusBackup() {
        return BP_STATUS__BACKUP;
    }
}
module.exports = BlockchainNodesStatusesDictionary;
