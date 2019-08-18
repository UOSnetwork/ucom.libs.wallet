class ContentOrganizationsGenerator {
  public static getFormFields(): any {
    return {
      title: 'New organization title',
      about: 'About new organization',
      nickname: 'new-org-nickname',
      personal_website_url: 'http://example.com',
      entity_images: '{}',

      partnership_sources: [],
      social_networks: [],

      // List of account_names without board status (accepted, pending, etc). Without author
      users_team: [],
    };
  }

  public static getCreatedAt(): string {
    return '2019-07-24T06:41:28Z';
  }

  public static getBlockchainId(): string {
    return 'org-12345';
  }
}

export = ContentOrganizationsGenerator;
