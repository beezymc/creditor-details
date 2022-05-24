module.exports = {
  creditorsDecorator: (data) => {
    if (!(data instanceof Array)) throw Error('Invalid Input');
    data.forEach((creditor) => {
      if (typeof creditor !== 'object') throw Error('Invalid Input');
      creditor.isChecked = true;
    });
  },
  calcTotal: (data) => {
    if (!(data instanceof Array)) throw Error('Invalid Input');
    let total = 0;
    data.forEach((item) => {
      if (typeof item !== 'object' || item.balance === undefined || typeof item.balance !== 'number') throw Error('Invalid Input');
      total += item.balance;
    });
    return total;
  },
  formatToUSD: (number) => {
    if (typeof number !== 'number') throw Error('Invalid Input');
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    });
    return formatter.format(number);
  }
};