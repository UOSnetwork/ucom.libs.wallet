class ActionResourcesDictionary {
  public static UOS(): string {
    return 'UOS';
  }

  public static basicResourceRam(): number {
    return 8192;
  }

  public static basicResourceCpuTokens(): string {
    return `1.0000 ${this.UOS()}`;
  }

  public static basicResourceNetTokens(): string {
    return `1.0000 ${this.UOS()}`;
  }
}

export = ActionResourcesDictionary;
