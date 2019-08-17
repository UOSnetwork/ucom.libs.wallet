class ContentCommentsGenerator {
  public static getCommentInputFields(): any {
    return {
      description:                'New comment description',
      path:                       [1],
      depth:                      0,
      entity_images:              '{}',
    };
  }

  public static getSampleCommentInputCreatedAt(): string {
    return '2019-07-24T06:41:28Z';
  }

  public static getSampleCommentBlockchainId(): string {
    return 'cmmt-12345';
  }
}

export = ContentCommentsGenerator;
