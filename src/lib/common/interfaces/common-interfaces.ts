interface IStringToAny {
  [index: string]: any;
}

interface ITransactionPushResponse {
  readonly transaction_id: string;
  readonly processed: IStringToAny;
}

interface IBlockchainAction {
  account:  string,
  name:     string,
  authorization: {
    actor: string,
    permission: string,
  }[],
  data: IStringToAny,
}

export {
  ITransactionPushResponse,
  IStringToAny,
  IBlockchainAction,
};
