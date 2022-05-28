import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../App.js";
import { creditorsDecorator, calculateTotal, formatToUSD } from "../utils.js";
import "@testing-library/jest-dom/extend-expect";
import axios from "axios";

describe("Utils Tests", () => {
  test("Given an array of objects, creditorsDecorator adds a isChecked property set to true to each object in the array.", () => {
    let testCreditors = [{}, {}, {}];
    creditorsDecorator(testCreditors);
    testCreditors.forEach((creditor) => {
      expect(creditor.isChecked).toBe(true);
    });
  });

  test("Given a non-array input, or an array input containing anything but non-array objects, creditorsDecorator will throw an error.", () => {
    let testCreditors = "testCreditors";
    expect(() => {
      creditorsDecorator(testCreditors);
    }).toThrowError();
    testCreditors = ["testCreditors", 123, 3.14];
    expect(() => {
      creditorsDecorator(testCreditors);
    }).toThrowError();
    testCreditors = [[12], [123], [3.14]];
    expect(() => {
      creditorsDecorator(testCreditors);
    }).toThrowError();
  });

  test("Given an array of objects with a balance property, calculateTotal adds the balances up and returns the total of all balances.", () => {
    let testCreditors = [{ balance: 1 }, { balance: 2.5 }, { balance: 8 }];
    expect(calculateTotal(testCreditors)).toBe(11.5);
    testCreditors = [{ balance: 1 }, { balance: 2.5 }, { balance: -8 }];
    expect(calculateTotal(testCreditors)).toBe(-4.5);
  });

  test("Given a non-array input, an array input not containing objects with a balance property, or an array input whose balances total to something large enough to be in scientific notation, throw an error.", () => {
    let testCreditors = [1, 2.5, 8];
    expect(() => {
      calculateTotal(testCreditors);
    }).toThrowError();
    testCreditors = 11.5;
    expect(() => {
      calculateTotal(testCreditors);
    }).toThrowError();
    testCreditors = [{ balance: "a" }, { balance: "b" }, { balance: "c" }];
    expect(() => {
      calculateTotal(testCreditors);
    }).toThrowError();
    testCreditors = [{ id: 1 }, { id: 2 }, { id: 3 }];
    expect(() => {
      calculateTotal(testCreditors);
    }).toThrowError();
    testCreditors = [[12], [123], [3.14]];
    expect(() => {
      calculateTotal(testCreditors);
    }).toThrowError();
    testCreditors = [
      { balance: 1 },
      { balance: 8 },
      { balance: 999999999999999999999 },
    ];
    expect(() => {
      calculateTotal(testCreditors);
    }).toThrowError();
  });

  test("Given a number, formatToUSD converts the number to a string representative of US currency.", () => {
    let number = 434324;
    expect(formatToUSD(number)).toBe("$434,324.00");
    number = -434324;
    expect(formatToUSD(number)).toBe("-$434,324.00");
    number = 3.14159;
    expect(formatToUSD(number)).toBe("$3.14");
    number = 3.149;
    expect(formatToUSD(number)).toBe("$3.15");
    number = 0;
    expect(formatToUSD(number)).toBe("$0.00");
  });

  test("Given a non-number input, or a number beyond Number.MAX_INT, formatToUSD throws an error.", () => {
    let number = 1.7976931348623159e308;
    expect(() => {
      formatToUSD(number);
    }).toThrowError();
    number = "hello";
    expect(() => {
      formatToUSD(number);
    }).toThrowError();
  });
});

describe("React Tests", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  const mockResponse = {
    data: [
      {
        id: 1,
        balance: 3000,
        creditorName: "Test",
        firstName: "Test",
        lastName: "Test",
        minPaymentPercentage: 1,
        isChecked: true,
      },
      {
        id: 2,
        balance: 3000,
        creditorName: "Test",
        firstName: "Test",
        lastName: "Test",
        minPaymentPercentage: 1,
        isChecked: true,
      },
      {
        id: 3,
        balance: 3000,
        creditorName: "Test",
        firstName: "Test",
        lastName: "Test",
        minPaymentPercentage: 1,
        isChecked: true,
      },
    ],
  };

  test("If data fails to be fetched from the server, .", async () => {
    jest.spyOn(axios, "get").mockResolvedValueOnce();
    render(<App />);
    await screen.findByRole("img");
    await waitFor(() => {
      expect(screen.getAllByRole("img").length).toBe(1);
    });
  });

  test("If a user clicks the Add Debt button, a new row is added, total row count is incremented, check row count is incremented, and the new balance is added to the prior total.", async () => {
    jest.spyOn(axios, "get").mockResolvedValueOnce(mockResponse);
    render(<App />);
    const initialCheckCount = parseInt(
      screen.getByTestId("checkCount").innerHTML
    );
    const initialRowCount = parseInt(screen.getByTestId("rowCount").innerHTML);
    const initialTotalCount = parseInt(
      screen.getByTestId("totalCount").innerHTML.replace(/[^0-9.-]+/g, "")
    );
    const addDebtButton = screen.getByTestId("addDebt");
    fireEvent.click(addDebtButton);
    await waitFor(() => {
      expect(screen.getByTestId("checkCount").innerHTML).toBe(
        String(initialCheckCount + 1)
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId("rowCount").innerHTML).toBe(
        String(initialRowCount + 1)
      );
    });
    //Note: This line will need to be updated once dummy data is no longer used to refer to a balance input instead.
    await waitFor(() => {
      expect(screen.getByTestId("totalCount").innerHTML).toBe(
        formatToUSD(initialTotalCount + 3000)
      );
    });
  });

  test("If a user clicks the Remove Debt button until no debts are listed, the Remove Debt button is disabled.", async () => {
    jest.spyOn(axios, "get").mockResolvedValueOnce(mockResponse);
    render(<App />);
    await screen.findAllByRole("checkbox");
    const removeDebtButton = screen.getByTestId("removeDebt");
    const numRows = screen.getByTestId("rowCount").innerHTML;
    for (let i = 0; i < numRows - 1; i++) {
      fireEvent.click(removeDebtButton);
    }
    await waitFor(() => {
      expect(screen.getAllByRole("checkbox").length).toBe(1);
    });
    await waitFor(() => {
      expect(removeDebtButton.disabled).toBe(false);
    });
    fireEvent.click(removeDebtButton);
    await waitFor(() => {
      expect(screen.queryByRole("checkbox")).toBeNull();
    });
    await waitFor(() => {
      expect(removeDebtButton.disabled).toBe(true);
    });
  });

  test("If data fetched from the server is empty, the Remove Debt button should be disabled by default.", async () => {
    jest.spyOn(axios, "get").mockResolvedValueOnce({ data: [] });
    render(<App />);
    await screen.findByTestId("removeDebt");
    const removeDebtButton = screen.getByTestId("removeDebt");
    await waitFor(() => {
      expect(removeDebtButton.disabled).toBe(true);
    });
  });

  test("If data fetched from the server is empty, and the Add Debt button is clicked, the 'Remove Debt' button will be enabled.", async () => {
    jest.spyOn(axios, "get").mockResolvedValueOnce({ data: [] });
    render(<App />);
    await screen.findByTestId("removeDebt");
    const removeDebtButton = screen.getByTestId("removeDebt");
    await waitFor(() => {
      expect(removeDebtButton.disabled).toBe(true);
    });
    const addDebtButton = screen.getByTestId("addDebt");
    fireEvent.click(addDebtButton);
    await waitFor(() => {
      expect(removeDebtButton.disabled).toBe(false);
    });
  });

  test("If a user clicks the Remove Debt button when the last row *is* checked, the last row is deleted, total row count is decremented, check row count is decremented, and the row's balance is removed from the prior total.", async () => {
    jest.spyOn(axios, "get").mockResolvedValueOnce(mockResponse);
    render(<App />);
    await screen.findAllByRole("checkbox");
    const initialCheckCount = parseInt(
      screen.getByTestId("checkCount").innerHTML
    );
    const initialRowCount = parseInt(screen.getByTestId("rowCount").innerHTML);
    const removedElementBalance = parseInt(
      screen.getByTestId(`balance${initialRowCount - 1}`).innerHTML
    );
    const initialTotalCount = parseInt(
      screen.getByTestId("totalCount").innerHTML.replace(/[^0-9.-]+/g, "")
    );
    const removeDebtButton = screen.getByTestId("removeDebt");
    fireEvent.click(removeDebtButton);
    await waitFor(() => {
      expect(screen.getByTestId("checkCount").innerHTML).toBe(
        String(initialCheckCount - 1)
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId("rowCount").innerHTML).toBe(
        String(initialRowCount - 1)
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId("totalCount").innerHTML).toBe(
        formatToUSD(initialTotalCount - removedElementBalance)
      );
    });
  });

  test("If a user clicks the Remove Debt button when the last row *is not* checked, the last row is deleted and total row count is decremented, but total check count and balance remain the same.", async () => {
    jest.spyOn(axios, "get").mockResolvedValueOnce(mockResponse);
    render(<App />);
    await screen.findAllByRole("checkbox");
    const initialRowCount = parseInt(screen.getByTestId("rowCount").innerHTML);
    const removedElementCheckbox = screen.getByTestId(
      `checkbox${initialRowCount - 1}`
    );
    fireEvent.click(removedElementCheckbox);
    const initialCheckCount = screen.getByTestId("checkCount").innerHTML;
    const initialTotalCount = screen.getByTestId("totalCount").innerHTML;
    const removeDebtButton = screen.getByTestId("removeDebt");
    fireEvent.click(removeDebtButton);
    await waitFor(() => {
      expect(screen.getByTestId("checkCount").innerHTML).toBe(
        initialCheckCount
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId("rowCount").innerHTML).toBe(
        String(initialRowCount - 1)
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId("totalCount").innerHTML).toBe(
        initialTotalCount
      );
    });
  });

  test("If a user clicks a checkbox (NOTE: checkboxes are checked by default), the check row count is decremented and the total is decremented by that unchecked row's balance.", async () => {
    jest.spyOn(axios, "get").mockResolvedValueOnce(mockResponse);
    render(<App />);
    await screen.findAllByRole("checkbox");
    const initialRowCount = screen.getByTestId("rowCount").innerHTML;
    const initialCheckCount = parseInt(
      screen.getByTestId("checkCount").innerHTML
    );
    const initialTotalCount = parseInt(
      screen.getByTestId("totalCount").innerHTML.replace(/[^0-9.-]+/g, "")
    );
    const removedElementBalance = parseInt(
      screen.getByTestId(`balance${initialRowCount - 1}`).innerHTML
    );
    const removedElementCheckbox = screen.getByTestId(
      `checkbox${initialRowCount - 1}`
    );
    fireEvent.click(removedElementCheckbox);
    await waitFor(() => {
      expect(screen.getByTestId("checkCount").innerHTML).toBe(
        initialCheckCount - 1 + ""
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId("rowCount").innerHTML).toBe(initialRowCount);
    });
    await waitFor(() => {
      expect(screen.getByTestId("totalCount").innerHTML).toBe(
        formatToUSD(initialTotalCount - removedElementBalance)
      );
    });
  });

  test("If a user then clicks that checkmark again, the check row count is incremented and the total is incremented by that row's balance.", async () => {
    jest.spyOn(axios, "get").mockResolvedValueOnce(mockResponse);
    render(<App />);
    await screen.findAllByRole("checkbox");
    const initialRowCount = screen.getByTestId("rowCount").innerHTML;
    const initialCheckCount = parseInt(
      screen.getByTestId("checkCount").innerHTML
    );
    const initialTotalCount = parseInt(
      screen.getByTestId("totalCount").innerHTML.replace(/[^0-9.-]+/g, "")
    );
    const removedElementBalance = parseInt(
      screen.getByTestId(`balance${initialRowCount - 1}`).innerHTML
    );
    const removedElementCheckbox = screen.getByTestId(
      `checkbox${initialRowCount - 1}`
    );
    fireEvent.click(removedElementCheckbox);
    await waitFor(() => {
      expect(screen.getByTestId("checkCount").innerHTML).toBe(
        initialCheckCount - 1 + ""
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId("rowCount").innerHTML).toBe(initialRowCount);
    });
    await waitFor(() => {
      expect(screen.getByTestId("totalCount").innerHTML).toBe(
        formatToUSD(initialTotalCount - removedElementBalance)
      );
    });
    fireEvent.click(removedElementCheckbox);
    await waitFor(() => {
      expect(screen.getByTestId("checkCount").innerHTML).toBe(
        initialCheckCount + ""
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId("rowCount").innerHTML).toBe(initialRowCount);
    });
    await waitFor(() => {
      expect(screen.getByTestId("totalCount").innerHTML).toBe(
        formatToUSD(initialTotalCount)
      );
    });
  });

  test("If a user clicks all checkmarks such that they are unchecked, the total should be 0, check row count 0, and total row count the number of rows.", async () => {
    jest.spyOn(axios, "get").mockResolvedValueOnce(mockResponse);
    render(<App />);
    await screen.findAllByRole("checkbox");
    const initialRowCount = screen.getByTestId("rowCount").innerHTML;
    for (let i = 0; i < initialRowCount; i++) {
      const checkbox = screen.getByTestId(`checkbox${i}`);
      fireEvent.click(checkbox);
    }
    await waitFor(() => {
      expect(screen.getByTestId("checkCount").innerHTML).toBe("0");
    });
    await waitFor(() => {
      expect(screen.getByTestId("rowCount").innerHTML).toBe(initialRowCount);
    });
    await waitFor(() => {
      expect(screen.getByTestId("totalCount").innerHTML).toBe("$0.00");
    });
  });
});
