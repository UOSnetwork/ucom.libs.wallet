import { JEST_TIMEOUT_DEBUG } from '../../helpers/jest/jest-dictionary';

import Helper = require('../../helpers/helper');
import CommonChecker = require('../../helpers/common/common-checker');
import PermissionsDictionary = require('../../../src/lib/dictionary/permissions-dictionary');
import MultiSignatureWorkflow = require('../../../src/lib/multi-signature/service/multi-signature-workflow');
import MultiSignatureApi = require('../../../src/lib/multi-signature/api/multi-signature-api');

Helper.initForEnvByProcessVariable();

const janeAccoutName = Helper.getAccountNameTo();

it('Smoke - trust user using multi-signature', async () => {
  // const expirationInDays = 1;
  // @ts-ignore
  const multiSignatureAccountData = {
    // accountName: 'ih2jwtakzjft', // with active threshold 2
    accountName: 'tyvknaqf3het', // with propose and approve as social
  };

  const { proposalName } = await MultiSignatureApi.createTrustProposal(
    Helper.getAliceAccountName(),
    Helper.getAlicePrivateKey(),
    PermissionsDictionary.social(),
    Helper.getBobAccountName(),
    PermissionsDictionary.social(),
    multiSignatureAccountData.accountName,
    janeAccoutName,
    1,
  );

  await MultiSignatureWorkflow.approveProposal(
    Helper.getBobAccountName(),
    Helper.getBobPrivateKey(),
    PermissionsDictionary.social(),
    Helper.getAliceAccountName(),
    proposalName,
    PermissionsDictionary.social(),
  );

  // @ts-ignore
  const response = await MultiSignatureWorkflow.executeProposal(
    Helper.getAliceAccountName(),
    Helper.getAlicePrivateKey(),
    PermissionsDictionary.social(),
    Helper.getAliceAccountName(),
    proposalName,
    Helper.getAliceAccountName(),
  );

  CommonChecker.expectNotEmpty(response);
}, JEST_TIMEOUT_DEBUG);

export {};
