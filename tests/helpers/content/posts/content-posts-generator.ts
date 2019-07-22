class ContentPostsGenerator {
  public static getSamplePostInputFields(): any {
    return {
      title:          'Cool sample post',
      description:    'Cool sample post description #winter #summer',
      leading_text:   '',
      entity_images:  {},
      entity_tags:    ['winter', 'summer'],
    };
  }

  public static getSamplePostBlockchainId(): string {
    return 'pstms-12345';
  }
}

export = ContentPostsGenerator;
