import ConfigStorage = require('./config-storage');

const TEST_ENV        = 'test';
const STAGING_ENV     = 'staging';
const PRODUCTION_ENV  = 'production';

let isNode  = false;
let env     = TEST_ENV;

class ConfigService {
  public static getConfig(): any {
    return ConfigStorage[env];
  }

  /**
   *
   * @return {void}
   */
  public static initNodeJsEnv() {
    isNode = true;
  }

  public static initForTestEnv(): void {
    env = TEST_ENV;
  }

  public static initForStagingEnv(): void {
    env = STAGING_ENV;
  }

  public static initForProductionEnv(): void {
    env = PRODUCTION_ENV;
  }

  public static isNode(): boolean {
    return isNode;
  }
}

export = ConfigService;
