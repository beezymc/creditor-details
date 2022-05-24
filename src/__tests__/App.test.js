import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import App from '../App.js';
import { creditorsDecorator, calcTotal, formatToUSD } from '../utils.js';
import axios from 'axios';
import '@testing-library/jest-dom/extend-expect'

afterEach(cleanup);

describe('Utils Tests', () => {
  test('Given an array of objects, creditorsDecorator adds a isChecked property set to true to each object in the array.', () => {
    let testCreditors = [{}, {}, {}];
    creditorsDecorator(testCreditors);
    testCreditors.forEach((creditor) => {
      expect(creditor.isChecked).toBe(true);
    });
    testCreditors = 'testCreditors';
    expect(() => {creditorsDecorator(testCreditors)}).toThrowError();
    testCreditors = ['testCreditors', 123, 3.14];
    expect(() => {creditorsDecorator(testCreditors)}).toThrowError();
  });

  test('Given an array of objects with a balance property, calcTotal adds the balances up and returns the total of all balances.', () => {
    let testCreditors = [{ balance: 1 }, { balance: 2.5 }, { balance: 8 }];
    expect(calcTotal(testCreditors)).toBe(11.5);
    testCreditors = [{ balance: 1 }, { balance: 2.5 }, { balance: -8 }];
    expect(calcTotal(testCreditors)).toBe(-4.5);
    //Note: 2147483647 is the highest 32-bit signed integer.
    testCreditors = [{ balance: 1 }, { balance: 2147483647 }, { balance: 8 }]
    expect(calcTotal(testCreditors)).toBe(2147483656);
    testCreditors = [1, 2.5, 8];
    expect(() => {calcTotal(testCreditors)}).toThrowError();
    testCreditors = 11.5;
    expect(() => {calcTotal(testCreditors)}).toThrowError();
    testCreditors = [{ balance: 'a' }, { balance: 'b' }, { balance: 'c' }];
    expect(() => {calcTotal(testCreditors)}).toThrowError();
    testCreditors = [{ id: 1 }, { id: 2 }, { id: 3 }];
    expect(() => {calcTotal(testCreditors)}).toThrowError();
  });

  test('Given a number, formatToUSD converts the number to a string representative of US currency.', () => {
    let number = 434324;
    expect(formatToUSD(number)).toBe('$434,324.00');
    number = 2147483648;
    expect(formatToUSD(number)).toBe('$2,147,483,648.00');
    number = 'hello';
    expect(() => {formatToUSD(number)}).toThrowError();
    number = 3.14159;
    expect(formatToUSD(number)).toBe('$3.14');
    number = 3.149;
    expect(formatToUSD(number)).toBe('$3.15');
  });
});

describe('React Tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  test('Show loader when fetching, then render rows when done', async () => {
    const mockResponse = {
      data: [
        {
          id: 1,
          balance: 3000,
          creditorName: 'Test',
          firstName: 'Test',
          lastName: 'Test',
          minPaymentPercentage: 1,
          isChecked: true,
        },
        {
          id: 2,
          balance: 3000,
          creditorName: 'Test',
          firstName: 'Test',
          lastName: 'Test',
          minPaymentPercentage: 1,
          isChecked: true
        },
        {
          id: 3,
          balance: 3000,
          creditorName: 'Test',
          firstName: 'Test',
          lastName: 'Test',
          minPaymentPercentage: 1,
          isChecked: true
        }
      ]
    };
    jest.spyOn(axios, 'get').mockResolvedValueOnce(mockResponse);
    render(<App />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  test('If a user clicks the Add Debt button, a new row is added, total row count is incremented, check row count is incremented, and the new balance is added to the prior total.', async () => {
    render(<App />);
    await screen.findAllByRole('checkbox');
    const initialCheckCount = parseInt(screen.getByTestId('checkCount').innerHTML);
    const initialRowCount = parseInt(screen.getByTestId('rowCount').innerHTML);
    const initialTotalCount = parseInt(screen.getByTestId('totalCount').innerHTML.replace(/[^0-9.-]+/g, ''));
    const addDebtButton = screen.getByTestId('addDebt');
    fireEvent.click(addDebtButton);
    expect(screen.getByTestId('checkCount').innerHTML).toBe(initialCheckCount + 1 + '');
    expect(screen.getByTestId('rowCount').innerHTML).toBe(initialRowCount + 1 + '');
    //Note: This line will need to be updated once dummy data is no longer used to refer to a balance input instead.
    expect(screen.getByTestId('totalCount').innerHTML).toBe(formatToUSD(initialTotalCount + 3000));
  });

  test('If a user clicks the Remove Debt button when no debts are listed, nothing happens (i.e. the application does not error out).', async () => {
    render(<App />);
    await screen.findAllByRole('checkbox');
    const removeDebtButton = screen.getByTestId('removeDebt');
    const numRows = screen.getByTestId('rowCount').innerHTML;
    for (let i = 0; i < numRows - 1; i++) {
      fireEvent.click(removeDebtButton);
    }
    expect(screen.getAllByRole('checkbox').length).toBe(1);
    fireEvent.click(removeDebtButton);
    expect(screen.queryByRole('checkbox')).toBeNull();
    fireEvent.click(removeDebtButton);
    expect(screen.queryByRole('checkbox')).toBeNull();
  });

  test('If a user clicks the Remove Debt button when the last row *is* checked, the last row is deleted, total row count is decremented, check row count is decremented, and the row\'s balance is removed from the prior total.', async () => {
    render(<App />);
    await screen.findAllByRole('checkbox');
    const initialCheckCount = parseInt(screen.getByTestId('checkCount').innerHTML);
    const initialRowCount = parseInt(screen.getByTestId('rowCount').innerHTML);
    const removedElementBalance = parseInt(screen.getByTestId(`balance${initialRowCount - 1}`).innerHTML);
    const initialTotalCount = parseInt(screen.getByTestId('totalCount').innerHTML.replace(/[^0-9.-]+/g, ''));
    const removeDebtButton = screen.getByTestId('removeDebt');
    fireEvent.click(removeDebtButton);
    expect(screen.getByTestId('checkCount').innerHTML).toBe(initialCheckCount - 1 + '');
    expect(screen.getByTestId('rowCount').innerHTML).toBe(initialRowCount - 1 + '');
    expect(screen.getByTestId('totalCount').innerHTML).toBe(formatToUSD(initialTotalCount - removedElementBalance));
  });

  test('If a user clicks the Remove Debt button when the last row *is not* checked, the last row is deleted and total row count is decremented, but total check count and balance remain the same.', async () => {
    render(<App />);
    await screen.findAllByRole('checkbox');
    const initialRowCount = parseInt(screen.getByTestId('rowCount').innerHTML);
    const removedElementCheckbox = screen.getByTestId(`checkbox${initialRowCount - 1}`)
    fireEvent.click(removedElementCheckbox);
    const initialCheckCount = screen.getByTestId('checkCount').innerHTML;
    const initialTotalCount = screen.getByTestId('totalCount').innerHTML;
    const removeDebtButton = screen.getByTestId('removeDebt');
    fireEvent.click(removeDebtButton);
    expect(screen.getByTestId('checkCount').innerHTML).toBe(initialCheckCount);
    expect(screen.getByTestId('rowCount').innerHTML).toBe(initialRowCount - 1 + '');
    expect(screen.getByTestId('totalCount').innerHTML).toBe(initialTotalCount);
  });

  test('If a user clicks a checkbox (NOTE: checkboxes are checked by default), the check row count is decremented and the total is decremented by that unchecked row\'s balance.', async () => {
    render(<App />);
    await screen.findAllByRole('checkbox');
    const initialRowCount = screen.getByTestId('rowCount').innerHTML;
    const initialCheckCount = parseInt(screen.getByTestId('checkCount').innerHTML);
    const initialTotalCount = parseInt(screen.getByTestId('totalCount').innerHTML.replace(/[^0-9.-]+/g, ''));
    const removedElementBalance = parseInt(screen.getByTestId(`balance${initialRowCount - 1}`).innerHTML);
    const removedElementCheckbox = screen.getByTestId(`checkbox${initialRowCount - 1}`)
    fireEvent.click(removedElementCheckbox);
    expect(screen.getByTestId('checkCount').innerHTML).toBe(initialCheckCount - 1 + '');
    expect(screen.getByTestId('rowCount').innerHTML).toBe(initialRowCount);
    expect(screen.getByTestId('totalCount').innerHTML).toBe(formatToUSD(initialTotalCount - removedElementBalance));
  });

  test('If a user then clicks that checkmark again, the check row count is incremented and the total is incremented by that row\'s balance.', async () => {
    render(<App />);
    await screen.findAllByRole('checkbox');
    const initialRowCount = screen.getByTestId('rowCount').innerHTML;
    const initialCheckCount = parseInt(screen.getByTestId('checkCount').innerHTML);
    const initialTotalCount = parseInt(screen.getByTestId('totalCount').innerHTML.replace(/[^0-9.-]+/g, ''));
    const removedElementBalance = parseInt(screen.getByTestId(`balance${initialRowCount - 1}`).innerHTML);
    const removedElementCheckbox = screen.getByTestId(`checkbox${initialRowCount - 1}`)
    fireEvent.click(removedElementCheckbox);
    expect(screen.getByTestId('checkCount').innerHTML).toBe(initialCheckCount - 1 + '');
    expect(screen.getByTestId('rowCount').innerHTML).toBe(initialRowCount);
    expect(screen.getByTestId('totalCount').innerHTML).toBe(formatToUSD(initialTotalCount - removedElementBalance));
    fireEvent.click(removedElementCheckbox);
    expect(screen.getByTestId('checkCount').innerHTML).toBe(initialCheckCount + '');
    expect(screen.getByTestId('rowCount').innerHTML).toBe(initialRowCount);
    expect(screen.getByTestId('totalCount').innerHTML).toBe(formatToUSD(initialTotalCount));
  });

  test('If a user clicks all checkmarks such that they are unchecked, the total should be 0, check row count 0, and total row count the number of rows.', async () => {
    render(<App />);
    await screen.findAllByRole('checkbox');
    const initialRowCount = screen.getByTestId('rowCount').innerHTML;
    for (let i = 0; i < initialRowCount; i++) {
      const checkbox = screen.getByTestId(`checkbox${i}`);
      fireEvent.click(checkbox);
    }
    expect(screen.getByTestId('checkCount').innerHTML).toBe('0');
    expect(screen.getByTestId('rowCount').innerHTML).toBe(initialRowCount);
    expect(screen.getByTestId('totalCount').innerHTML).toBe('$0.00');
  });
});


