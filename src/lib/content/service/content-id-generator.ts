import uniqid from 'uniqid';

class ContentIdGenerator {
  public static getForMediaPost(): string {
    const uniqIdPrefix = 'pstms';

    return uniqid(`${uniqIdPrefix}-`);
  }
}

export = ContentIdGenerator;
