import { helper } from 'ember-helper';

function nFormatter(num, digits) {
  let si = [
    { value: 1E18, symbol: 'E' },
    { value: 1E15, symbol: 'P' },
    { value: 1E12, symbol: 'T' },
    { value: 1E9,  symbol: 'B' },
    { value: 1E6,  symbol: 'M' },
    { value: 1E3,  symbol: 'k' }
  ];
  for (let i = 0; i < si.length; i++) {
    if (num >= si[i].value) {
      return (num / si[i].value)
        .toFixed(digits)
        .replace(/\.0+$|(\.[0-9]*[1-9])0+$/, '$1')
        + si[i].symbol;
    }
  }
  return num.toString();
}

function titleCase(item) {
  let i, j, str, lowers, uppers;
  str = item.replace(/([^\W_]+[^\s-]*) */g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });

  // Certain minor words should be left lowercase unless
  // they are the first or last words in the string
  lowers = ['A', 'An', 'The', 'And', 'But', 'Or', 'For', 'Nor', 'As', 'At',
  'By', 'For', 'From', 'In', 'Into', 'Near', 'Of', 'On', 'Onto', 'To', 'With'];

  // Certain words such as initialisms or acronyms should be left uppercase
  uppers = ['Id', 'Tv', 'Sbir/sttr', 'Rpgs', 'Sbir', 'Sttr'];

  for (i = 0, j = lowers.length; i < j; i++) {
    str = str.replace(new RegExp(`\\s${lowers[i]}\\s`, 'g'),
      function(txt) {
        return txt.toLowerCase();
      });
  }

  for (i = 0, j = uppers.length; i < j; i++) {
    str = str.replace(new RegExp(`\\b${uppers[i]}\\b`, 'g'),
      uppers[i].toUpperCase());
  }
  return str;
}

function cleanNum(item) {
  let everyThirdNumber = /\B(?=(\d{3})+(?!\d))/g;
  return item.toString().replace(everyThirdNumber, ',');
}

export default helper(function([item, method]) {
  // handle null items, occasionally passed in by computed property updates
  if (!item) { return; }

  switch (method) {
    case 'lower':
      return item.toLowerCase();
    case 'upper':
      return item.toUpperCase();
    case 'title':
      return titleCase(item);
    case 'currency':
      return `$${nFormatter(item, 1)}`;
    case 'cleanNum':
      return cleanNum(item);
    default:
      return;
  }
});
