module.exports = {
  creditorsDecorator: (data) => {
    if (!(data instanceof Array)) {
      throw Error("Invalid Input");
    }
    data.forEach((creditor) => {
      if (typeof creditor !== "object" || creditor instanceof Array) {
        throw Error("Invalid Input");
      }
      creditor.isChecked = true;
    });
  },
  calculateTotal: (data) => {
    if (!(data instanceof Array)) {
      throw Error("Invalid Input");
    }
    let total = 0;
    data.forEach((item) => {
      if (
        typeof item !== "object" ||
        item.balance === undefined ||
        typeof item.balance !== "number"
      ) {
        throw Error("Invalid Input");
      }
      total += item.balance;
    });
    if (total >= 999999999999999999999) {
      throw Error("Total too large to be displayed");
    }
    return total;
  },
  formatToUSD: (number) => {
    if (typeof number !== "number" || number > 1.7976931348623157e308) {
      throw Error("Invalid Input");
    }
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    });
    return formatter.format(number);
  },
};
