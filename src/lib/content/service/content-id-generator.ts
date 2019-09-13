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

  public static getForAutoUpdatePost(): string {
    return this.getUniqId('psttp');
  }

  public static getForComment(): string {
    return this.getUniqId('cmmnt');
  }

  public static getForOrganization(): string {
    return this.getUniqId('org');
  }

  private static getUniqId(uniqIdPrefix): string {
    return uniqid(`${uniqIdPrefix}-`);
  }
}

export = ContentIdGenerator;
