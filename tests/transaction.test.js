const { WalletApi } = require('../index');

const helper = require('./helper');

WalletApi.setNodeJsEnv();

const accountName = helper.getTesterAccountName();

describe('GET requests', () => {
  describe('Get info from blockchain', () => {
    describe('Positive', () => {
      it('Get account state', async () => {
        const accountState = await WalletApi.getAccountState(accountName);

        helper.checkStateStructure(accountState);
      });

      it('Get ram price', async () => {
        const bytesToBuy = 10000;

        const uosPrice = await WalletApi.getApproximateRamPriceByBytesAmount(bytesToBuy);

        expect(typeof uosPrice).toBe('number');
        expect(uosPrice).toBeGreaterThan(0);
      });

      it('getCurrentNetAndCpuStakedTokens', async () => {
        const data = await WalletApi.getCurrentNetAndCpuStakedTokens(accountName);

        expect(typeof data.cpu).toBe('number');
        expect(data.cpu).toBeGreaterThan(0);

        expect(typeof data.net).toBe('number');
        expect(data.net).toBeGreaterThan(0);

        expect(data.currency).toBe('UOS');
      });
    });

    describe('Negative', () => {
      it('Empty object if account does not exist', async () => {
        const accountName = helper.getNonExistedAccountName();

        const accountState = await WalletApi.getAccountState(accountName);

        expect(typeof accountState).toBe('object');
        expect(Object.keys(accountState).length).toBe(0);
      })
    });
  });
});



// const { TransactionFactory, TransactionSender } = require('../index');
// TransactionFactory.initForTestEnv();
// TransactionSender.initForTestEnv();
//
// const helper = require('./transactions-helper');
//
// const senderAccountName       = helper.getSenderAccountName();
// const senderActivePrivateKey  = helper.getSenderActivePrivateKey();
//
// describe('Transaction tests', () => {
//   describe('Content creation', () => {
//     it('User creates repost for existing post', async () => {
//       const signedString = await TransactionFactory.getSignedUserCreatesRepostOtherPost(
//         senderAccountName,
//         senderActivePrivateKey,
//         'new_repost_blockchain_id',
//         'parent_post_blockchain_id',
//       );
//
//       const signed = JSON.parse(signedString);
//
//       expect(signed).toMatchObject(helper.getSampleTransactionUserCreatesRepostForOtherPost());
//       const data = await TransactionSender.pushTransaction(signed.transaction);
//
//       expect(data).toMatchObject(helper.getSamplePushResultUserCreatesRepostOfOtherPost());
//     }, 10000);
//
//     describe('Direct post', () => {
//       it('User creates direct post for other user', async () => {
//
//         const accountNameTo = 'samplaccount';
//         const blockchainId  = 'sample_blockchain_id';
//
//         const signedString = await TransactionFactory.getSignedDirectPostCreationForUser(
//           senderAccountName,
//           senderActivePrivateKey,
//           accountNameTo,
//           blockchainId
//         );
//
//         const signed = JSON.parse(signedString);
//
//         expect(signed).toMatchObject(helper.getSampleUserCreatesDirectPostOnOtherUser());
//         const data = await TransactionSender.pushTransaction(signed.transaction);
//         expect(data).toMatchObject(helper.getSamplePushResultForUserCreatesDirectPostOnOtherUser());
//
//       }, 10000);
//
//       it('User creates direct post for org', async () => {
//         const organizationIdTo = 'sample_organization_blockchain_id';
//         const blockchainId  = 'sample_content_blockchain_id';
//
//         const signedString = await TransactionFactory.getSignedDirectPostCreationForOrg(
//           senderAccountName,
//           senderActivePrivateKey,
//           organizationIdTo,
//           blockchainId
//         );
//
//         const signed = JSON.parse(signedString);
//         expect(signed).toMatchObject(helper.getSampleUserCreatesDirectPostOnOrg());
//         const data = await TransactionSender.pushTransaction(signed.transaction);
//
//         expect(data).toMatchObject(helper.getSamplePushResultForUserCreatesDirectPostOnOrg());
//       }, 10000);
//     });
//   });
//
//   describe('User to content voting', () => {
//       it('User upvotes content', async () => {
//         const signedString = await TransactionFactory.getSignedUserUpvotesContent(
//           senderAccountName,
//           senderActivePrivateKey,
//           'sample_blockchain_id'
//         );
//
//         const signed = JSON.parse(signedString);
//
//         expect(signed).toMatchObject(helper.getSampleUserUpvotesContent());
//         const data = await TransactionSender.pushTransaction(signed.transaction);
//
//         expect(data).toMatchObject(helper.getSamplePushResultForUserUpvotesContent());
//       }, 10000);
//
//       it('User downvotes content', async () => {
//         const signedString = await TransactionFactory.getSignedUserDownvotesContent(
//           senderAccountName,
//           senderActivePrivateKey,
//           'sample_blockchain_id'
//         );
//
//         const signed = JSON.parse(signedString);
//
//         expect(signed).toMatchObject(helper.getSampleUserDownvotesContent());
//         const data = await TransactionSender.pushTransaction(signed.transaction);
//
//         expect(data).toMatchObject(helper.getSamplePushResultForUserDownvotesContent());
//       }, 10000);
//   });
//
//
//   describe('Organization related transactions', function () {
//     describe('User - organization interaction', () => {
//       it('should create valid transaction - user follows organization', async () => {
//         const signedString = await TransactionFactory.getSignedUserFollowsOrg(
//           senderAccountName,
//           senderActivePrivateKey,
//           'sample_org_blockchain_id'
//         );
//
//         const signed = JSON.parse(signedString);
//
//         expect(signed).toMatchObject(helper.getSampleTransactionUserFollowsOrganization());
//         const data = await TransactionSender.pushTransaction(signed.transaction);
//
//         expect(data).toMatchObject(helper.getSamplePushResultForUserFollowsOrg());
//       }, 10000);
//
//       it('should create valid transaction - user unfollows organization', async () => {
//         const signedString = await TransactionFactory.getSignedUserUnfollowsOrg(
//           senderAccountName,
//           senderActivePrivateKey,
//           'sample_org_blockchain_id'
//         );
//
//         const signed = JSON.parse(signedString);
//
//         expect(signed).toMatchObject(helper.getSampleTransactionUserUnfollowsOrganization());
//         const data = await TransactionSender.pushTransaction(signed.transaction);
//
//         expect(data).toMatchObject(helper.getSamplePushResultForUserUnfollowsOrg());
//       }, 10000);
//     });
//     describe('Organization creates content', () => {
//       it('Organization Media posts.', async () => {
//         const signedString = await TransactionFactory.getSignedOrganizationCreatesMediaPost(
//           senderAccountName,
//           senderActivePrivateKey,
//           'sample_org_blockchain_id',
//           'sample_post_blockchain_id'
//         );
//
//         const signed = JSON.parse(signedString);
//
//         expect(signed).toMatchObject(helper.getSampleTransactionForMediaPost());
//         const data = await TransactionSender.pushTransaction(signed.transaction);
//
//         expect(data).toMatchObject(helper.getSamplePushResultForMediaPost());
//       }, 10000);
//
//       it('Organization Post-offer.', async () => {
//         const signedString = await TransactionFactory.getSignedOrganizationCreatesPostOffer(
//           senderAccountName,
//           senderActivePrivateKey,
//           'sample_org_blockchain_id',
//           'sample_post_blockchain_id'
//         );
//
//         const signed = JSON.parse(signedString);
//
//         expect(signed).toMatchObject(helper.getSampleTransactionForPostOffer());
//         const data = await TransactionSender.pushTransaction(signed.transaction);
//
//         expect(data).toMatchObject(helper.getSamplePushResultForPostOffer());
//       }, 10000);
//
//       it('comment on post creation - should create valid transaction', async () => {
//         const signedString = await TransactionFactory.getSignedOrganizationCreatesCommentOnPost(
//           senderAccountName,
//           senderActivePrivateKey,
//           'sample_org_blockchain_id',
//           'sample_new_comment_blockchain_id',
//           'sample_parent_post_blockchain_id'
//         );
//
//         const signed = JSON.parse(signedString);
//
//         expect(signed).toMatchObject(helper.getSampleTransactionForOrgCreatesCommentOnPost());
//         const data = await TransactionSender.pushTransaction(signed.transaction);
//
//         expect(data).toMatchObject(helper.getSamplePushResultForOrgCreatesCommentOnPost());
//       }, 10000);
//
//       it('comment on comment creation - should create valid transaction', async () => {
//         const signedString = await TransactionFactory.getSignedOrganizationCreatesCommentOnComment(
//           senderAccountName,
//           senderActivePrivateKey,
//           'sample_org_blockchain_id',
//           'sample_new_comment_blockchain_id',
//           'sample_parent_comment_blockchain_id'
//         );
//
//         const signed = JSON.parse(signedString);
//         expect(signed).toMatchObject(helper.getSampleTransactionForOrgCreatesCommentOnComment());
//         const data = await TransactionSender.pushTransaction(signed.transaction);
//
//         expect(data).toMatchObject(helper.getSamplePushResultForOrgCreatesCommentOnComment());
//       }, 10000);
//     });
//
//     describe('User creates organization', () => {
//       it('should create valid create organization signature and push it successfully', async () => {
//         const signedString = await TransactionFactory.createSignedUserCreatesOrganization(
//           senderAccountName,
//           senderActivePrivateKey,
//           'sample_blockchain_id'
//         );
//
//         const signed = JSON.parse(signedString);
//
//         expect(signed).toMatchObject(helper.getExpectedNewOrganizationCreationTransaction());
//         const data = await TransactionSender.pushTransaction(signed.transaction);
//
//         expect(data).toMatchObject(helper.getExpectedCreateOrganizationTransactionPushResponse());
//       }, 20000);
//     });
//   });
//
//   describe('User direct actions related transactions', () => {
//     describe('User creates posts', () => {
//       it('User himself media posts.', async () => {
//         const signedString = await TransactionFactory.getSignedUserHimselfCreatesMediaPost(
//           senderAccountName,
//           senderActivePrivateKey,
//           'new_media_post_blockchain_id'
//         );
//
//         const signed = JSON.parse(signedString);
//
//         expect(signed).toMatchObject(helper.getSampleTransactionUserHimselfCreatesMediaPost());
//         const data = await TransactionSender.pushTransaction(signed.transaction);
//
//         expect(data).toMatchObject(helper.getSamplePushResultUserHimselfCreatesMediaPost());
//       }, 10000);
//
//       it('User himself post-offer.', async () => {
//         const signedString = await TransactionFactory.getSignedUserHimselfCreatesPostOffer(
//           senderAccountName,
//           senderActivePrivateKey,
//           'new_post_offer_blockchain_id'
//         );
//
//         const signed = JSON.parse(signedString);
//
//         expect(signed).toMatchObject(helper.getSampleTransactionUserHimselfCreatesPostOffer());
//         const data = await TransactionSender.pushTransaction(signed.transaction);
//
//         expect(data).toMatchObject(helper.getSamplePushResultUserHimselfCreatesPostOffer());
//       }, 10000);
//     });
//
//     describe('User creates comments', () => {
//       it('Create comment directly for post - should create valid transaction', async () => {
//         const signedString = await TransactionFactory.getSignedUserHimselfCreatesCommentOnPost(
//           senderAccountName,
//           senderActivePrivateKey,
//           'sample_new_comment_blockchain_id',
//           'sample_parent_post_blockchain_blockchain_id'
//         );
//
//         const signed = JSON.parse(signedString);
//
//         expect(signed).toMatchObject(helper.getSampleTransactionForUserHimselfCreatesCommentOnPost());
//         const data = await TransactionSender.pushTransaction(signed.transaction);
//
//         expect(data).toMatchObject(helper.getSamplePushResultForUserHimselfCreatesCommentOnPost());
//       }, 20000);
//
//       it('comment on comment creation - should create valid transaction', async () => {
//         const signedString = await TransactionFactory.getSignedUserHimselfCreatesCommentOnComment(
//           senderAccountName,
//           senderActivePrivateKey,
//           'sample_new_comment_blockchain_id',
//           'sample_parent_comment_blockchain_id'
//         );
//
//         const signed = JSON.parse(signedString);
//         expect(signed).toMatchObject(helper.getSampleTransactionForUserHimselfCreatesCommentOnComment());
//         const data = await TransactionSender.pushTransaction(signed.transaction);
//
//         expect(data).toMatchObject(helper.getSamplePushResultForUserHimselfCreatesCommentOnComment());
//       }, 20000);
//     });
//   });
//
//   describe('User follows-unfollows other user', () => {
//     it('should create valid user-to-user signed transaction and push it successfully', async () => {
//       const recipientAccountName = 'jane';
//
//       const signedString = await TransactionFactory.getSignedUserFollowsUser(
//         senderAccountName,
//         senderActivePrivateKey,
//         recipientAccountName
//       );
//
//       const signed = JSON.parse(signedString);
//
//       expect(signed).toMatchObject(helper.getUserToUserExpectedTransaction());
//
//       const data = await TransactionSender.pushTransaction(signed.transaction);
//
//       expect(data).toMatchObject(helper.getExpectedUserFollowsUserTransactionPushResponse());
//     }, 10000)
//   });
// });