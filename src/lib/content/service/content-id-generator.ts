import uniqid from 'uniqid';

class ContentIdGenerator {
  public static getForMediaPost(): string {
    return this.getUniqId('pstms');
  }

  public static getForDirectPost(): string {
    return this.getUniqId('pstdr');
  }

  public static getForRepost(): string {
    return this.getUniqId('pstrp');
  }

  private static getUniqId(uniqIdPrefix): string {
    return uniqid(`${uniqIdPrefix}-`);
  }
}

export = ContentIdGenerator;
