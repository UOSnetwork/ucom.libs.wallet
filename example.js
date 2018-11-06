const { WalletApi } = require('./index');

(async () => {
  const accountNameFrom = 'accregistrar';
  const accountNameTo = 'vlad';
  const privateKey = '5KSSv6acEyUAm4i11Mw3qxkun8t4rTC63kWs4Heh5NVkHsf6gHe';
  const amount = '100';
  const memo = '';




  // const sendTokensResponse = await WalletApi.sendTokens(accountNameFrom, privateKey, accountNameTo, amount, memo);
  // console.dir(sendTokensResponse);

  // Check unstake - special field to

  const accountState = await WalletApi.getAccountState(accountNameTo);
  console.log(accountState);

  const ramToByInBytes = 6000;
  const ramPrice = await WalletApi.getRamPriceByBytes(ramToByInBytes);
  console.log(ramPrice);
})();



