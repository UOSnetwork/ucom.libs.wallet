class PermissionsDictionary {
  public static owner(): string {
    return 'owner';
  }

  public static active(): string {
    return 'active';
  }

  public static social(): string {
    return 'social';
  }

  public static getParent(permission: string): string {
    const map = {
      owner: '',
      active: this.owner(),
      social: this.active(),
    };

    if (typeof map[permission] === 'undefined') {
      throw new TypeError(`There is no parent permission for: ${permission}`);
    }

    return map[permission];
  }
}

export = PermissionsDictionary;
