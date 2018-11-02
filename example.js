const { WalletApi } = require('./index');

const accountName = 'vlad';

(async () => {

  const accountState = await WalletApi.getAccountState(accountName);
  console.log(accountState);

  const ramToByInBytes = 6000;
  const ramPrice = await WalletApi.getRamPriceByBytes(ramToByInBytes);
  console.log(ramPrice);
})();



