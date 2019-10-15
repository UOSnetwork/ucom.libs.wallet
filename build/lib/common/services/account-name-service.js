"use strict";
const ACCOUNT_NAME_LENGTH = 12;
class AccountNameService {
    static createRandomAccountName() {
        let text = '';
        const possible = 'abcdefghijklmnopqrstuvwxyz12345';
        for (let i = 0; i < ACCOUNT_NAME_LENGTH; i += 1) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}
module.exports = AccountNameService;
