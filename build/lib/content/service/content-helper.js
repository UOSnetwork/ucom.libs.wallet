"use strict";
const moment = require("moment");
class ContentHelper {
    static getDateTimeFields(createdAt, updatedAt) {
        const data = {};
        if (createdAt) {
            data.created_at = moment().utc().format();
        }
        if (updatedAt) {
            data.updated_at = moment().utc().format();
        }
        return data;
    }
    static getUpdatedAtInsideObject() {
        return {
            updated_at: moment().utc().format(),
        };
    }
    static getMetadata(accountNameFrom, contentId, extraMetaData = {}) {
        return Object.assign({ account_from: accountNameFrom, content_id: contentId }, extraMetaData);
    }
    static checkCreatedAt(content) {
        if (!content.created_at) {
            throw new TypeError('created_at must exist inside a content');
        }
        if (!content.created_at.includes('Z')) {
            throw new TypeError('created_at be an UTC string');
        }
        const momentDate = moment(content.created_at);
        if (!momentDate.isValid()) {
            throw new TypeError(`Provided created_at value is not a valid datetime string: ${content.created_at}`);
        }
    }
}
module.exports = ContentHelper;
