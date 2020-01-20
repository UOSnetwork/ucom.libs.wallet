"use strict";
class SmartContractsActionsDictionary {
    static updateAuth() {
        return 'updateauth';
    }
    static proposeMultiSignature() {
        return 'propose';
    }
    static approveMultiSignature() {
        return 'approve';
    }
    static executeMultiSignature() {
        return 'exec';
    }
    static newAccount() {
        return 'newaccount';
    }
    static buyRamBytes() {
        return 'buyrambytes';
    }
    static sellRam() {
        return 'sellram';
    }
    static transfer() {
        return 'transfer';
    }
    static voteProducer() {
        return 'voteproducer';
    }
    static withdraw() {
        return 'withdraw';
    }
    static withdrawal() {
        return 'withdrawal';
    }
    static delegateBw() {
        return 'delegatebw';
    }
    static unDelegateBw() {
        return 'undelegatebw';
    }
    static linkAuth() {
        return 'linkauth';
    }
    static setProfile() {
        return 'setprofile';
    }
    static socialAction() {
        return 'socialactndt';
    }
    static historicalSocialAction() {
        return 'histactndt';
    }
    static voteForCalculators() {
        return 'votecalc';
    }
}
module.exports = SmartContractsActionsDictionary;
