import { UOS } from './currency-dictionary';

class ActionResourcesDictionary {
  public static basicResourceRam(): number {
    return 8192;
  }

  public static basicResourceNetTokensNumber(): number {
    return 1;
  }

  public static basicResourceCpuTokensNumber(): number {
    return 1;
  }

  public static basicResourceCpuTokens(): string {
    return `${this.basicResourceCpuTokensNumber()}.0000 ${UOS}`;
  }

  public static basicResourceNetTokens(): string {
    return `${this.basicResourceNetTokensNumber()}.0000 ${UOS}`;
  }
}

export = ActionResourcesDictionary;
