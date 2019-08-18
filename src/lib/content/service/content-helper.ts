import moment = require('moment');

class ContentHelper {
  public static getDateTimeFields(createdAt: boolean, updatedAt: boolean) {
    const data: any = {};

    if (createdAt) {
      data.created_at = moment().utc().format();
    }

    if (updatedAt) {
      data.updated_at = moment().utc().format();
    }

    return data;
  }

  public static getUpdatedAtInsideObject() {
    return {
      updated_at: moment().utc().format(),
    };
  }

  public static getMetadata(
    accountNameFrom: string,
    contentId: string,
    extraMetaData: any = {},
  ) {
    return {
      account_from: accountNameFrom,
      content_id: contentId,
      ...extraMetaData,
    };
  }

  public static checkCreatedAt(content): void {
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

export = ContentHelper;
