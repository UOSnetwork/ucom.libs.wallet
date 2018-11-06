const { WalletApi } = require('./index');

(async () => {
  // const accountNameFrom = 'accregistrar';
  const accountNameTo = 'vlad';
  // const privateKey = 'private_key_here';
  // const amount = '100';
  // const memo = '';
  // const sendTokensResponse = await WalletApi.sendTokens(accountNameFrom, privateKey, accountNameTo, amount, memo);
  // console.dir(sendTokensResponse);

  /**
    Staking form workflow:
    * @link WalletApi#getCurrentNetAndCpuStakedTokens - show in form
    * @link WalletApi#stakeOrUnstakeTokens - send data to this method
  */


  const accountState = await WalletApi.getAccountState(accountNameTo);
  console.log(accountState);

  const ramToByInBytes = 6000;
  const ramPrice = await WalletApi.getRamPriceByBytes(ramToByInBytes);
  console.log(ramPrice);
})();



