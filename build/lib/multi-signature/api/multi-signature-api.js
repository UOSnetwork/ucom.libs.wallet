"use strict";
const RegistrationApi = require("../../registration/api/registration-api");
const PermissionsDictionary = require("../../dictionary/permissions-dictionary");
const EosClient = require("../../common/client/eos-client");
const ActionsFactory = require("../../common/actions/actions-factory");
const SmartContractsDictionary = require("../../dictionary/smart-contracts-dictionary");
const SmartContractsActionsDictionary = require("../../dictionary/smart-contracts-actions-dictionary");
const TransactionsBuilder = require("../../service/transactions-builder");
const AccountNameService = require("../../common/services/account-name-service");
const SocialKeyApi = require("../../social-key/api/social-key-api");
const SocialTransactionsUserToUserFactory = require("../../social-transactions/services/social-transactions-user-to-user-factory");
const InteractionsDictionary = require("../../dictionary/interactions-dictionary");
const _ = require("lodash");
const moment = require("moment");
const TransactionSender = require("../../transaction-sender");
class MultiSignatureApi {
    static async createTrustProposal(whoPropose, proposePrivateKey, proposePermission, trustFrom, trustTo, expirationInDays) {
        const proposalName = AccountNameService.createRandomAccountName();
        const trustAction = SocialTransactionsUserToUserFactory.getSingleSocialAction(trustFrom, trustTo, InteractionsDictionary.trust(), PermissionsDictionary.social());
        const seActions = await EosClient.serializeActionsByApi([trustAction]);
        const trustActionSerialized = _.cloneDeep(trustAction);
        trustActionSerialized.data = seActions[0].data;
        const trx = {
            // eslint-disable-next-line newline-per-chained-call
            expiration: moment().add(expirationInDays, 'days').utc().format().replace('Z', ''),
            ref_block_num: 0,
            ref_block_prefix: 0,
            max_net_usage_words: 0,
            max_cpu_usage_ms: 0,
            delay_sec: 0,
            context_free_actions: [],
            actions: [trustActionSerialized],
            transaction_extensions: [],
        };
        const authorization = TransactionsBuilder.getSingleUserAuthorization(whoPropose, proposePermission);
        const actions = [
            {
                account: SmartContractsDictionary.eosIoMultiSignature(),
                name: SmartContractsActionsDictionary.proposeMultiSignature(),
                authorization,
                data: {
                    proposer: whoPropose,
                    proposal_name: proposalName,
                    requested: [
                        {
                            actor: trustFrom,
                            permission: PermissionsDictionary.social(),
                        },
                    ],
                    trx,
                },
            },
        ];
        return EosClient.sendTransaction(proposePrivateKey, actions);
    }
    static async createTransferProposal(whoPropose, proposePrivateKey, proposePermission, accountFrom, accountNameTo, expirationInDays = 5) {
        const proposalName = AccountNameService.createRandomAccountName();
        const stringAmount = TransactionSender.getUosAmountAsString(1, 'UOS');
        const action = TransactionSender.getSendTokensAction(accountFrom, accountNameTo, stringAmount, '');
        const seActions = await EosClient.serializeActionsByApi([action]);
        const trustActionSerialized = _.cloneDeep(action);
        trustActionSerialized.data = seActions[0].data;
        const trx = {
            // eslint-disable-next-line newline-per-chained-call
            expiration: moment().add(expirationInDays, 'days').utc().format().replace('Z', ''),
            ref_block_num: 0,
            ref_block_prefix: 0,
            max_net_usage_words: 0,
            max_cpu_usage_ms: 0,
            delay_sec: 0,
            context_free_actions: [],
            actions: [trustActionSerialized],
            transaction_extensions: [],
        };
        const authorization = TransactionsBuilder.getSingleUserAuthorization(whoPropose, proposePermission);
        const actions = [
            {
                account: SmartContractsDictionary.eosIoMultiSignature(),
                name: SmartContractsActionsDictionary.proposeMultiSignature(),
                authorization,
                data: {
                    proposer: whoPropose,
                    proposal_name: proposalName,
                    requested: [
                        {
                            actor: accountFrom,
                            permission: PermissionsDictionary.active(),
                        },
                    ],
                    trx,
                },
            },
        ];
        return EosClient.sendTransaction(proposePrivateKey, actions);
    }
    static async createMultiSignatureAccount(communityAuthorAccountName, communityAuthorActivePrivateKey, multiSignatureAccountName, multiSignatureOwnerPrivateKey, multiSignatureOwnerPublicKey, multiSignatureActivePublicKey) {
        await RegistrationApi.createNewAccountInBlockchain(communityAuthorAccountName, communityAuthorActivePrivateKey, multiSignatureAccountName, multiSignatureOwnerPublicKey, multiSignatureActivePublicKey);
        const socialPermissionAction = ActionsFactory.addOneUserAccountByUpdateAuthAction(multiSignatureAccountName, PermissionsDictionary.owner(), communityAuthorAccountName, PermissionsDictionary.social(), PermissionsDictionary.active());
        const activePermissionAction = ActionsFactory.addOneUserAccountByUpdateAuthAction(multiSignatureAccountName, PermissionsDictionary.owner(), communityAuthorAccountName, PermissionsDictionary.active(), PermissionsDictionary.owner());
        const ownerPermissionAction = ActionsFactory.addOneUserAccountByUpdateAuthAction(multiSignatureAccountName, PermissionsDictionary.owner(), communityAuthorAccountName, PermissionsDictionary.owner(), '');
        const actions = [
            socialPermissionAction,
            ...SocialKeyApi.getAssignSocialPermissionsActions(multiSignatureAccountName, PermissionsDictionary.owner()),
            activePermissionAction,
            ownerPermissionAction,
        ];
        return EosClient.sendTransaction(multiSignatureOwnerPrivateKey, actions);
    }
}
module.exports = MultiSignatureApi;
