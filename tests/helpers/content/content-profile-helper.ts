import ContentApi = require('../../../src/lib/content/api/content-api');
import EosClient = require('../../../src/lib/common/client/eos-client');
import TransactionsPushResponseChecker = require('../common/transactions-push-response-checker');

class ContentProfileHelper {
  public static async signAndPushUpdateProfile(accountNameFrom: string, privateKey: string, profile: any) {
    const signed = await ContentApi.updateProfile(accountNameFrom, privateKey, profile);

    return EosClient.pushTransaction(signed);
  }

  public static async updateProfileSetMinimum(
    accountName: string,
    privateKey: string,
    permission: string,
  ): Promise<void> {
    const profile = this.getMinimumProfile(accountName);

    return this.pushSetProfileTransaction(accountName, privateKey, profile, permission);
  }

  public static async updateProfileSetExtended(
    accountName: string,
    privateKey: string,
    permission: string,
  ): Promise<void> {
    const profile = this.getExtendedProfile(accountName);

    return this.pushSetProfileTransaction(accountName, privateKey, profile, permission);
  }

  public static getMinimumProfile(accountName: string) {
    return {
      account_name: accountName,
    };
  }

  public static getExtendedProfile(accountName: string) {
    return {
      ...this.getMinimumProfile(accountName),
      first_name:   'Knight',
      hobby:        'NodeJs opensource',
      status:        'Always happy always positive',
      about:        'Porfolio Porfolio Porfolio Porfolio Porfolio Porfolio Porfolio Porfolio',
    };
  }

  public static async checkPushResponse(
    accountNameFrom: string,
    profile: any,
    pushResponse: any,
    permission: string,
  ) {
    const expected = {
      action_traces: [
        {
          receipt: {
            receiver: 'uaccountinfo',
          },
          act: {
            account: 'uaccountinfo',
            name: 'setprofile',
            authorization: [
              {
                actor: accountNameFrom,
                permission,
              },
            ],
            data: {
              acc: accountNameFrom,
              profile_json: JSON.stringify(profile),
            },
          },
          context_free: false,
          except: null,
          inline_traces: [],
        },
      ],
    };

    TransactionsPushResponseChecker.checkOneTransaction(pushResponse, expected);

    const smartContractData = await ContentApi.getOneAccountProfileFromSmartContractTable(accountNameFrom);

    const expectedData = {
      acc: accountNameFrom,
      profile_json: JSON.stringify(profile),
    };

    expect(smartContractData).toMatchObject(expectedData);
  }

  private static async pushSetProfileTransaction(
    accountName: string,
    privateKey: string,
    profile: any,
    permission: string,
  ) {
    const signed = await ContentApi.updateProfile(accountName, privateKey, profile, permission);
    return EosClient.pushTransaction(signed);
  }

  public static getVeryLongString(): string {
    return `
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Purus viverra accumsan in nisl nisi scelerisque eu ultrices vitae. Libero enim sed faucibus turpis in. Elementum integer enim neque volutpat ac. Risus nec feugiat in fermentum posuere. Sed libero enim sed faucibus turpis in. Tellus in metus vulputate eu scelerisque felis imperdiet. Nam at lectus urna duis convallis convallis tellus id interdum. Pellentesque habitant morbi tristique senectus et netus. Ipsum dolor sit amet consectetur. Felis eget nunc lobortis mattis aliquam faucibus.

Auctor augue mauris augue neque gravida in fermentum. Et ligula ullamcorper malesuada proin. Enim diam vulputate ut pharetra sit. Tortor aliquam nulla facilisi cras fermentum. Ultricies mi quis hendrerit dolor magna eget est lorem ipsum. Nunc eget lorem dolor sed viverra ipsum nunc aliquet. Erat nam at lectus urna duis convallis convallis tellus. Lorem ipsum dolor sit amet consectetur adipiscing elit ut. Vitae semper quis lectus nulla at volutpat diam ut venenatis. Placerat in egestas erat imperdiet sed euismod. Sodales ut eu sem integer vitae.

Ut diam quam nulla porttitor massa id. Risus quis varius quam quisque id diam vel quam. Dapibus ultrices in iaculis nunc sed augue lacus viverra. Elementum tempus egestas sed sed risus. Et netus et malesuada fames ac. Velit euismod in pellentesque massa placerat duis ultricies lacus sed. In hac habitasse platea dictumst vestibulum rhoncus est. Ullamcorper sit amet risus nullam eget. Non arcu risus quis varius quam quisque id diam vel. Faucibus vitae aliquet nec ullamcorper. Aliquam id diam maecenas ultricies. Mattis ullamcorper velit sed ullamcorper morbi tincidunt ornare massa eget. Non curabitur gravida arcu ac tortor. Non enim praesent elementum facilisis leo vel. Consectetur lorem donec massa sapien faucibus.

Fringilla ut morbi tincidunt augue. At auctor urna nunc id. Iaculis urna id volutpat lacus laoreet non. Enim nulla aliquet porttitor lacus luctus accumsan tortor posuere. Viverra accumsan in nisl nisi scelerisque eu. Eget nunc scelerisque viverra mauris in aliquam sem. Ultricies integer quis auctor elit sed vulputate. Augue lacus viverra vitae congue eu consequat ac felis donec. Tellus cras adipiscing enim eu turpis egestas. Massa id neque aliquam vestibulum morbi blandit cursus. Ipsum faucibus vitae aliquet nec ullamcorper sit. Non pulvinar neque laoreet suspendisse interdum consectetur libero id faucibus. Non odio euismod lacinia at quis risus. Fringilla ut morbi tincidunt augue interdum velit euismod. Convallis posuere morbi leo urna molestie at elementum eu. Lectus arcu bibendum at varius vel pharetra vel turpis nunc. Diam quis enim lobortis scelerisque fermentum dui faucibus in ornare. Lectus urna duis convallis convallis tellus id. Fermentum iaculis eu non diam phasellus vestibulum lorem sed risus.

Ultrices neque ornare aenean euismod elementum nisi quis eleifend quam. Condimentum id venenatis a condimentum. Cursus vitae congue mauris rhoncus aenean. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper dignissim cras tincidunt. In nulla posuere sollicitudin aliquam ultrices sagittis. Sagittis id consectetur purus ut faucibus pulvinar elementum integer enim. Urna nunc id cursus metus aliquam eleifend mi in nulla. Ullamcorper dignissim cras tincidunt lobortis feugiat vivamus at augue eget. Amet consectetur adipiscing elit duis tristique sollicitudin nibh sit. Sed cras ornare arcu dui vivamus arcu felis bibendum ut.

Suspendisse faucibus interdum posuere lorem ipsum dolor sit. Eu non diam phasellus vestibulum lorem sed. Odio euismod lacinia at quis risus sed. Enim nunc faucibus a pellentesque sit. Dolor morbi non arcu risus quis varius quam quisque id. Est sit amet facilisis magna etiam tempor orci eu lobortis. Placerat vestibulum lectus mauris ultrices. Arcu felis bibendum ut tristique et egestas quis ipsum suspendisse. Consequat mauris nunc congue nisi vitae. Ullamcorper a lacus vestibulum sed arcu non odio. Imperdiet dui accumsan sit amet nulla facilisi. Tortor dignissim convallis aenean et. Sed vulputate odio ut enim blandit. Vulputate eu scelerisque felis imperdiet proin. Feugiat vivamus at augue eget arcu dictum varius duis at.

Tellus molestie nunc non blandit massa. Urna nec tincidunt praesent semper feugiat. Etiam tempor orci eu lobortis elementum. Nulla at volutpat diam ut venenatis tellus in metus vulputate. Odio aenean sed adipiscing diam donec. Ac placerat vestibulum lectus mauris ultrices. Tempor orci dapibus ultrices in iaculis nunc sed augue. Sollicitudin ac orci phasellus egestas tellus rutrum. Odio euismod lacinia at quis. Enim blandit volutpat maecenas volutpat blandit aliquam etiam. Dictumst quisque sagittis purus sit amet. Laoreet sit amet cursus sit. Et tortor consequat id porta nibh venenatis cras sed. Felis donec et odio pellentesque diam volutpat commodo. Et malesuada fames ac turpis egestas integer eget. Eu ultrices vitae auctor eu augue. In fermentum posuere urna nec tincidunt.

Egestas pretium aenean pharetra magna ac placerat vestibulum. Ante metus dictum at tempor. Facilisis volutpat est velit egestas dui id ornare arcu. Volutpat consequat mauris nunc congue nisi vitae. Tellus elementum sagittis vitae et leo. Urna nec tincidunt praesent semper feugiat nibh. Purus viverra accumsan in nisl nisi scelerisque eu ultrices. Quisque non tellus orci ac auctor. Ultricies integer quis auctor elit sed vulputate mi sit amet. Platea dictumst quisque sagittis purus sit amet volutpat. Cum sociis natoque penatibus et magnis. Tincidunt tortor aliquam nulla facilisi cras fermentum odio eu feugiat. Tristique risus nec feugiat in. Orci ac auctor augue mauris augue. Vestibulum lorem sed risus ultricies. Tincidunt tortor aliquam nulla facilisi cras fermentum. Blandit libero volutpat sed cras ornare arcu dui. Viverra vitae congue eu consequat ac felis donec et. Magna fermentum iaculis eu non diam phasellus vestibulum. Quis vel eros donec ac odio tempor orci.

Eget arcu dictum varius duis. Adipiscing vitae proin sagittis nisl. Ultrices in iaculis nunc sed. Enim eu turpis egestas pretium aenean pharetra magna. Montes nascetur ridiculus mus mauris vitae. Morbi tristique senectus et netus et malesuada fames ac. Diam donec adipiscing tristique risus nec. Eget velit aliquet sagittis id consectetur. Feugiat nisl pretium fusce id velit ut tortor pretium. Velit aliquet sagittis id consectetur purus ut faucibus pulvinar.
Eget arcu dictum varius duis. Adipiscing vitae proin sagittis nisl. Ultrices in iaculis nunc sed. Enim eu turpis egestas pretium aenean pharetra magna. Montes nascetur ridiculus mus mauris vitae. Morbi tristique senectus et netus et malesuada fames ac. Diam donec adipiscing tristique risus nec. Eget velit aliquet sagittis id consectetur. Feugiat nisl pretium fusce id velit ut tortor pretium. Velit aliquet sagittis id consectetur purus ut faucibus pulvinar.
Eget arcu dictum varius duis. Adipiscing vitae proin sagittis nisl. Ultrices in iaculis nunc sed. Enim eu turpis egestas pretium aenean pharetra magna. Montes nascetur ridiculus mus mauris vitae. Morbi tristique senectus et netus et malesuada fames ac. Diam donec adipiscing tristique risus nec. Eget velit aliquet sagittis id consectetur. Feugiat nisl pretium fusce id velit ut tortor pretium. Velit aliquet sagittis id consectetur purus ut faucibus pulvinar.
Eget arcu dictum varius duis. Adipiscing vitae proin sagittis nisl. Ultrices in iaculis nunc sed. Enim eu turpis egestas pretium aenean pharetra magna. Montes nascetur ridiculus mus mauris vitae. Morbi tristique senectus et netus et malesuada fames ac. Diam donec adipiscing tristique risus nec. Eget velit aliquet sagittis id consectetur. Feugiat nisl pretium fusce id velit ut tortor pretium. Velit aliquet sagittis id consectetur purus ut faucibus pulvinar.
Eget arcu dictum varius duis. Adipiscing vitae proin sagittis nisl. Ultrices in iaculis nunc sed. Enim eu turpis egestas pretium aenean pharetra magna. Montes nascetur ridiculus mus mauris vitae. Morbi tristique senectus et netus et malesuada fames ac. Diam donec adipiscing tristique risus nec. Eget velit aliquet sagittis id consectetur. Feugiat nisl pretium fusce id velit ut tortor pretium. Velit aliquet sagittis id consectetur purus ut faucibus pulvinar.
    `;
  }
}

export = ContentProfileHelper;
