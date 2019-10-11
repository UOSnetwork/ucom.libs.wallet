"use strict";
const multi_signature_actions_1 = require("../service/multi-signature-actions");
const multi_signature_validator_1 = require("../validators/multi-signature-validator");
const currency_dictionary_1 = require("../../dictionary/currency-dictionary");
const RegistrationApi = require("../../registration/api/registration-api");
const PermissionsDictionary = require("../../dictionary/permissions-dictionary");
const EosClient = require("../../common/client/eos-client");
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
const SocialTransactionsCommonFactory = require("../../social-transactions/services/social-transactions-common-factory");
const Helper = require("../../../../tests/helpers/helper");
const ContentTransactionsCommonFactory = require("../../content/service/content-transactions-common-factory");
class MultiSignatureApi {
    static async createMultiSignatureAccount(authorAccountName, authorActivePrivateKey, multiSignatureAccountName, multiSignatureOwnerPrivateKey, multiSignatureOwnerPublicKey, multiSignatureActivePublicKey, profile = {}, addSocialMembers = []) {
        await multi_signature_validator_1.MultiSignatureValidator.validateCreation(authorAccountName, multiSignatureAccountName);
        await RegistrationApi.createNewAccountInBlockchain(authorAccountName, authorActivePrivateKey, multiSignatureAccountName, multiSignatureOwnerPublicKey, multiSignatureActivePublicKey);
        const authorPermissionActions = multi_signature_actions_1.MultiSignatureActions.getAuthorPermissionActions(multiSignatureAccountName, authorAccountName);
        const socialAccounts = [
            authorAccountName,
            ...addSocialMembers,
        ];
        const socialPermissionAction = multi_signature_actions_1.MultiSignatureActions.getSocialPermissionAction(multiSignatureAccountName, socialAccounts, PermissionsDictionary.owner());
        const actions = [
            ...SocialKeyApi.getAssignSocialPermissionsActions(multiSignatureAccountName, PermissionsDictionary.owner()),
            ...authorPermissionActions,
            socialPermissionAction,
            ContentTransactionsCommonFactory.getSetProfileAction(multiSignatureAccountName, profile, PermissionsDictionary.owner()),
        ];
        return EosClient.sendTransaction(multiSignatureOwnerPrivateKey, actions);
    }
    static async executeProposal(actorAccount, actorPrivateKey, actorPermission, proposerAccount, proposalName, executerName) {
        const action = {
            account: SmartContractsDictionary.eosIoMultiSignature(),
            name: SmartContractsActionsDictionary.executeMultiSignature(),
            authorization: TransactionsBuilder.getSingleUserAuthorization(actorAccount, actorPermission),
            data: {
                proposer: proposerAccount,
                proposal_name: proposalName,
                executer: executerName,
            },
        };
        return EosClient.sendTransaction(actorPrivateKey, [action]);
    }
    static async approveProposal(actor, authPrivateKey, authPermission, proposerAccount, proposalName, approvePermission) {
        const action = {
            account: SmartContractsDictionary.eosIoMultiSignature(),
            name: SmartContractsActionsDictionary.approveMultiSignature(),
            authorization: [
                {
                    actor,
                    permission: authPermission,
                },
            ],
            data: {
                proposer: proposerAccount,
                proposal_name: proposalName,
                level: {
                    actor,
                    permission: approvePermission,
                },
            },
        };
        return EosClient.sendTransaction(authPrivateKey, [action]);
    }
    static async createTrustProposal(whoPropose, proposePrivateKey, proposePermission, requestedActor, requestedPermission, trustFrom, trustTo, expirationInDays) {
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
                            actor: requestedActor,
                            permission: requestedPermission,
                        },
                    ],
                    trx,
                },
            },
        ];
        const transaction = await EosClient.sendTransaction(proposePrivateKey, actions);
        return {
            transaction,
            proposalName,
        };
    }
    static async createChangeMembersProposal(whoPropose, proposePrivateKey, proposePermission, proposeRequestedFrom, expirationInDays = 1, multiSignatureAccount, permissionToAssign) {
        const threshold = 1;
        const actionPermission = PermissionsDictionary.active();
        const action = {
            account: SmartContractsDictionary.eosIo(),
            name: SmartContractsActionsDictionary.updateAuth(),
            authorization: [
                {
                    actor: multiSignatureAccount,
                    permission: PermissionsDictionary.active(),
                },
            ],
            data: {
                account: multiSignatureAccount,
                permission: permissionToAssign,
                parent: proposePermission,
                auth: {
                    threshold,
                    keys: [],
                    accounts: [
                        {
                            permission: {
                                actor: Helper.getBobAccountName(),
                                permission: permissionToAssign,
                            },
                            weight: 1,
                        },
                        {
                            permission: {
                                actor: Helper.getTesterAccountName(),
                                permission: permissionToAssign,
                            },
                            weight: 1,
                        },
                    ],
                    waits: [],
                },
            },
        };
        return this.createProposalWithOneRequestedAndOneAction(whoPropose, proposePrivateKey, proposePermission, proposeRequestedFrom, expirationInDays, action, actionPermission, SocialTransactionsCommonFactory.getNonceAction(whoPropose, actionPermission));
    }
    static async createTransferProposal(whoPropose, proposePrivateKey, proposePermission, proposeRequestedFrom, accountFrom, accountNameTo, expirationInDays = 1) {
        const stringAmount = TransactionSender.getUosAmountAsString(1, currency_dictionary_1.UOS);
        const action = TransactionSender.getSendTokensAction(accountFrom, accountNameTo, stringAmount, '');
        return this.createProposalWithOneRequestedAndOneAction(whoPropose, proposePrivateKey, proposePermission, proposeRequestedFrom, expirationInDays, action, PermissionsDictionary.active());
    }
    static async createProposalWithOneRequestedAndOneAction(whoPropose, proposePrivateKey, proposePermission, proposeRequestedFrom, expirationInDays = 5, action, actionPermission, nonceAction = null) {
        const proposalName = AccountNameService.createRandomAccountName();
        const seActions = await EosClient.serializeActionsByApi([action]);
        const serializedAction = _.cloneDeep(action);
        serializedAction.data = seActions[0].data;
        const trxActions = [
            serializedAction,
        ];
        // #task - dedicated method
        if (nonceAction) {
            const seActionsNonce = await EosClient.serializeActionsByApi([nonceAction]);
            const serializedActionNonce = _.cloneDeep(nonceAction);
            serializedActionNonce.data = seActionsNonce[0].data;
            trxActions.push(serializedActionNonce);
        }
        const trx = {
            // eslint-disable-next-line newline-per-chained-call
            expiration: moment().add(expirationInDays, 'days').utc().format().replace('Z', ''),
            ref_block_num: 0,
            ref_block_prefix: 0,
            max_net_usage_words: 0,
            max_cpu_usage_ms: 0,
            delay_sec: 0,
            context_free_actions: [],
            actions: trxActions,
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
                            actor: proposeRequestedFrom,
                            permission: actionPermission,
                        },
                    ],
                    trx,
                },
            },
        ];
        const transaction = await EosClient.sendTransaction(proposePrivateKey, actions);
        return {
            transaction,
            proposalName,
        };
    }
}
module.exports = MultiSignatureApi;
