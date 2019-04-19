interface ObjectInterfaceRulesDto {
  [index: string]: {
    readonly type: string;
    readonly length: number;
    readonly value?: any;
  }
}

interface CheckManyObjectsOptionsDto {
  readonly exactKeysAmount: boolean;
  readonly keyIs: string;
}

export {
  ObjectInterfaceRulesDto,
  CheckManyObjectsOptionsDto,
};
