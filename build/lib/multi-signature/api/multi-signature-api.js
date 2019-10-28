"use strict";
const multi_signature_actions_1 = require("../service/multi-signature-actions");
const multi_signature_validator_1 = require("../validators/multi-signature-validator");
const currency_dictionary_1 = require("../../dictionary/currency-dictionary");
const account_data_helper_1 = require("../../account/helpers/account-data-helper");
const array_helper_1 = require("../../helpers/array-helper");
const transaction_dictionary_1 = require("../../dictionary/transaction-dictionary");
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
const ContentTransactionsCommonFactory = require("../../content/service/content-transactions-common-factory");
const BlockchainRegistry = require("../../blockchain-registry");
const MultiSignatureWorkflow = require("../service/multi-signature-workflow");
const ContentApi = require("../../content/api/content-api");
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
    static async areSocialMembersChanged(multiSignatureAccountName, addSocialMembers) {
        const accountData = await BlockchainRegistry.getRawAccountData(multiSignatureAccountName);
        const socialMembers = account_data_helper_1.extractAccountsFromMultiSignaturePermission(accountData, PermissionsDictionary.social());
        const difference = array_helper_1.symmetricDifference(socialMembers, addSocialMembers);
        return difference.length > 0;
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
    static async updateProfile(actorAccountName, actorPrivateKey, proposePermission, multiSignatureAccount, profile) {
        await ContentApi.isEnoughRamOrException(multiSignatureAccount, profile);
        const actions = [
            ContentTransactionsCommonFactory.getSetProfileAction(multiSignatureAccount, profile, proposePermission),
        ];
        return this.proposeApproveAndExecuteByProposer(actorAccountName, actorPrivateKey, proposePermission, actions);
    }
    static async createAndExecuteProfileUpdateAndSocialMembers(accountName, activePrivateKey, multiSignatureAccount, profile, socialMembers) {
        const permission = PermissionsDictionary.active();
        await ContentApi.isEnoughRamOrException(multiSignatureAccount, profile);
        const actions = [
            ContentTransactionsCommonFactory.getSetProfileAction(multiSignatureAccount, profile, permission),
            multi_signature_actions_1.MultiSignatureActions.getSocialPermissionAction(multiSignatureAccount, socialMembers, permission),
            SocialTransactionsCommonFactory.getNonceAction(multiSignatureAccount, permission),
        ];
        return this.proposeApproveAndExecuteByProposer(accountName, activePrivateKey, permission, actions);
    }
    static async changeSocialMembers(accountName, activePrivateKey, multiSignatureAccount, socialMembers) {
        const permission = PermissionsDictionary.active();
        const actions = [
            multi_signature_actions_1.MultiSignatureActions.getSocialPermissionAction(multiSignatureAccount, socialMembers, permission),
            SocialTransactionsCommonFactory.getNonceAction(multiSignatureAccount, permission),
        ];
        return this.proposeApproveAndExecuteByProposer(accountName, activePrivateKey, permission, actions);
    }
    static async createTransferProposal(whoPropose, proposePrivateKey, proposePermission, proposeRequestedFrom, accountFrom, accountNameTo) {
        const stringAmount = TransactionSender.getUosAmountAsString(1, currency_dictionary_1.UOS);
        const action = TransactionSender.getSendTokensAction(accountFrom, accountNameTo, stringAmount, '');
        return this.pushProposal(whoPropose, proposePrivateKey, proposePermission, [proposeRequestedFrom], [action], PermissionsDictionary.active());
    }
    static async proposeApproveAndExecuteByProposer(account, privateKey, permission, actionsOfMultiSignature) {
        if (!Array.isArray(actionsOfMultiSignature)) {
            throw new TypeError('actionsOfMultiSignature parameter type must be an array');
        }
        const { proposalName, transaction: proposeResponse } = await this.pushProposal(account, privateKey, permission, [account], actionsOfMultiSignature, permission);
        const approveResponse = await MultiSignatureWorkflow.approveProposal(account, privateKey, permission, account, proposalName, permission);
        const executeResponse = await MultiSignatureWorkflow.executeProposal(account, privateKey, permission, account, proposalName, account);
        return {
            proposalName,
            proposeResponse,
            approveResponse,
            executeResponse,
        };
    }
    static async pushProposal(whoPropose, proposePrivateKey, proposePermission, accountsToApprove, givenActions, actionPermission) {
        const proposalName = AccountNameService.createRandomAccountName();
        const trxActions = _.cloneDeep(givenActions);
        const seActions = await EosClient.serializeActionsByApi(givenActions);
        for (const [i, element] of trxActions.entries()) {
            element.data = seActions[i].data;
        }
        const trx = {
            // eslint-disable-next-line newline-per-chained-call
            expiration: moment().add(transaction_dictionary_1.MULTI_SIGNATURE_EXPIRATION_IN_DAYS, 'days').utc().format().replace('Z', ''),
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
        const requested = this.getRequestedFromAccountNames(accountsToApprove, actionPermission);
        const actions = [
            {
                account: SmartContractsDictionary.eosIoMultiSignature(),
                name: SmartContractsActionsDictionary.proposeMultiSignature(),
                authorization,
                data: {
                    proposer: whoPropose,
                    proposal_name: proposalName,
                    requested,
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
    static getRequestedFromAccountNames(accountNames, permission) {
        return accountNames.map((actor) => ({ actor, permission }));
    }
}
module.exports = MultiSignatureApi;
