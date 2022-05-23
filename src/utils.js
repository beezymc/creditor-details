module.exports = {
  creditorsDecorator: (data) => {
    data.forEach((creditor) => {
      creditor.isChecked = true;
    });
  },
  calcTotal: (data) => {
    let total = 0;
    data.forEach((item) => {
      total += item.balance;
    });
    return total;
  },
  formatToUSD: (number) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    });
    return formatter.format(number);
  }
};