interface IStringToAny {
  [index: string]: any;
}

interface ITransactionPushResponse {
  readonly transaction_id: string;
  readonly processed: IStringToAny;
}

export {
  ITransactionPushResponse,
  IStringToAny,
};
