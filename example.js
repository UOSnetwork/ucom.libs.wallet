const { WalletApi } = require('./index');

(async () => {
  const accountNameFrom = 'vlad';
  const accountNameTo = 'jane';
  const privateKey = 'vlad_private_key';
  const amount = '10';
  const memo = '';

  const sendTokensResponse = await WalletApi.sendTokens(accountNameFrom, privateKey, accountNameTo, amount, memo);
  console.dir(sendTokensResponse);

  const accountState = await WalletApi.getAccountState(accountNameFrom);
  console.log(accountState);

  const ramToByInBytes = 6000;
  const ramPrice = await WalletApi.getRamPriceByBytes(ramToByInBytes);
  console.log(ramPrice);
})();



