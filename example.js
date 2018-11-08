const { WalletApi } = require('./index');

(async () => {
  /**
    Init environment:
    * @link WalletApi#initForTestEnv        - autotests only. This is default environment
    * @link WalletApi#initForStagingEnv     - for staging.u.community
    * @link WalletApi#initForProductionEnv  - for beta.u.community and new.u.community

   Get account state:
    * @link WalletApi#getAccountState

    Send tokens:
    * @link WalletApi#sendTokens

    Staking/unstaking:
    * @link WalletApi#getCurrentNetAndCpuStakedTokens - show in form
    * @link WalletApi#stakeOrUnstakeTokens - send data to this method

    Claim emission:
    * @link WalletApi#claimEmission

    Buy/Sell RAM:
    * @link WalletApi#getApproximateRamPriceByBytesAmount - set bytes from input and get approximate price in UOS to show
    * @link WalletApi#buyRam
    * @link WalletApi#sellRam
   */
})();



