"use strict";
const TEST_ENV = 'test';
const STAGING_ENV = 'staging';
const PRODUCTION_ENV = 'production';
let isNode = false;
let env = TEST_ENV;
const configStorage = require('./default');
class ConfigService {
    static getConfig() {
        return configStorage[env];
    }
    /**
     *
     * @return {void}
     */
    static initNodeJsEnv() {
        isNode = true;
    }
    static initForTestEnv() {
        env = TEST_ENV;
    }
    static initForStagingEnv() {
        env = STAGING_ENV;
    }
    static initForProductionEnv() {
        env = PRODUCTION_ENV;
    }
    static isNode() {
        return isNode;
    }
}
module.exports = ConfigService;
