import ConverterHelper = require('../../../src/lib/helpers/converter-helper');

it('should sort classics account names based on string to number encoded value', () => {
  const names = [
    'charlie12312',
    'alice1231231',
    'bob123123123',
  ];

  sortAndExpectAlphabetically(names);
});

it('should sort custom account names based on string to number encoded value', () => {
  const names = [
    'vladvladvlad',
    'janejanejane',
    'petrpetrpetr',
  ];

  sortAndExpectAlphabetically(names);
});

function sortAndExpectAlphabetically(names: string[]) {
  const expected = [...names].sort();

  const actual = ConverterHelper.sortAccountNamesByUInt64(names);

  expect(actual).toEqual(expected);
}
