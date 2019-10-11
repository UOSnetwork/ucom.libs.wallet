"use strict";
class PermissionsDictionary {
    static owner() {
        return 'owner';
    }
    static active() {
        return 'active';
    }
    static social() {
        return 'social';
    }
    static getParent(permission) {
        const map = {
            owner: '',
            active: this.owner(),
            social: this.active(),
        };
        if (typeof map[permission] === 'undefined') {
            throw new TypeError(`There is no parent permission for: ${permission}`);
        }
        return map[permission];
    }
}
module.exports = PermissionsDictionary;
