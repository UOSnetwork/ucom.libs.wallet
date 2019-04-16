const TEST_ENV        = 'test';
const STAGING_ENV     = 'staging';
const PRODUCTION_ENV  = 'production';

let isNode  = false;
let env     = TEST_ENV;

const configStorage = require('./default.json');

class ConfigService {
  public static getConfig(): any {
    return configStorage[env];
  }

  /**
   *
   * @return {void}
   */
  static initNodeJsEnv() {
    isNode = true;
  }

  static initForTestEnv(): void {
    env = TEST_ENV;
  }

  static initForStagingEnv(): void {
    env = STAGING_ENV;
  }

  static initForProductionEnv(): void {
    env = PRODUCTION_ENV;
  }

  public static isNode(): boolean {
    return isNode;
  }
}

export = ConfigService;
