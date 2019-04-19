"use strict";
const BP_STATUS__ACTIVE = 1;
const BP_STATUS__BACKUP = 2;
const BP_STATUS__INACTIVE = 3;
const ACTIVE_NUMBER = 21;
class BlockchainNodesDictionary {
    static activeNumber() {
        return ACTIVE_NUMBER;
    }
    static statusActive() {
        return BP_STATUS__ACTIVE;
    }
    static statusBackup() {
        return BP_STATUS__BACKUP;
    }
    static statusInactive() {
        return BP_STATUS__INACTIVE;
    }
    static getBackupOrInactive(node) {
        if (typeof node.is_active === 'undefined') {
            throw new TypeError(`Node must have a field is_active: ${JSON.stringify(node)}`);
        }
        return node.is_active === 1 ? this.statusBackup() : this.statusInactive();
    }
}
module.exports = BlockchainNodesDictionary;
