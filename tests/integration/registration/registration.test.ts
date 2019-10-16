import Helper = require('../../helpers/helper');
import RegistrationApi = require('../../../src/lib/registration/api/registration-api');
import BlockchainRegistry = require('../../../src/lib/blockchain-registry');
import CommonChecker = require('../../helpers/common/common-checker');

Helper.initForEnvByProcessVariable();

const JEST_TIMEOUT = 30000;

it('Registration', async () => {
  const data = RegistrationApi.generateRandomDataForRegistration();

  const response = await RegistrationApi.createNewAccountInBlockchain(
    Helper.getCreatorAccountName(),
    Helper.getCreatorPrivateKey(),
    data.accountName,
    data.ownerPublicKey,
    data.activePublicKey,
  );

  CommonChecker.expectNotEmpty(response.transaction_id);
  CommonChecker.expectNotEmpty(response.processed);

  const state = await BlockchainRegistry.getRawAccountData(data.accountName);

  CommonChecker.expectNotEmpty(state);
}, JEST_TIMEOUT);

export {};
