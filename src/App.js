import React, { useEffect, useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import Creditor from "./components/Creditor.jsx";
import Error from "./components/Error.jsx";
import { creditorsDecorator, calculateTotal, formatToUSD } from "./utils.js";
import "./css/app.css";
const App = () => {
  const [creditors, setCreditors] = useState([]);
  const [error, setError] = useState(false);
  const [total, setTotal] = useState(0);
  const [rowCount, setRowCount] = useState(0);
  const [checkCount, setCheckCount] = useState(0);
  const [isRemoveDisabled, setIsRemoveDisabled] = useState(false);

  useEffect(() => {
    axios
      .get(
        "https://raw.githubusercontent.com/StrategicFS/Recruitment/master/data.json"
      )
      .then(({ data }) => {
        creditorsDecorator(data);
        setCreditors(data);
        setTotal(calculateTotal(data));
        setRowCount(data.length);
        setCheckCount(data.length);
        if (data.length === 0) {
          setIsRemoveDisabled(true);
        }
      })
      .catch((err) => {
        setError(true);
      });
  }, []);

  const addDebt = () => {
    const creditorsCopy = [...creditors];
    const newCreditor = {
      id: uuidv4(),
      balance: 3000,
      creditorName: "Test",
      firstName: "Test",
      lastName: "Test",
      minPaymentPercentage: 1,
      isChecked: true,
    };
    creditorsCopy.push(newCreditor);
    setCreditors(creditorsCopy);
    setRowCount(rowCount + 1);
    setCheckCount(checkCount + 1);
    setTotal(total + newCreditor.balance);
    if (isRemoveDisabled) {
      setIsRemoveDisabled(false);
    }
  };

  const removeDebt = () => {
    const removedCreditor = creditors[creditors.length - 1];
    if (creditors.length === 1) {
      setIsRemoveDisabled(true);
    }
    setCreditors(creditors.slice(0, creditors.length - 1));
    setRowCount(rowCount - 1);
    if (removedCreditor.isChecked) {
      setCheckCount(checkCount - 1);
      setTotal(total - removedCreditor.balance);
    }
  };

  const handleCheck = (id) => {
    setCreditors(
      creditors.map((creditor) => {
        if (creditor.id !== id) {
          return creditor;
        } else {
          const creditorCopy = { ...creditor };
          if (creditorCopy.isChecked) {
            setTotal(total - creditorCopy.balance);
            setCheckCount(checkCount - 1);
          } else {
            setTotal(total + creditorCopy.balance);
            setCheckCount(checkCount + 1);
          }
          creditorCopy.isChecked = !creditorCopy.isChecked;
          return creditorCopy;
        }
      })
    );
  };

  if (error) {
    return <Error />;
  }

  return (
    <div className="main">
      <div className="titleRow">
        <div className="checkContainer" />
        <div className="creditorTitle">Creditor</div>
        <div className="firstNameTitle">First Name</div>
        <div className="lastNameTitle">Last Name</div>
        <div className="minPayTitle">Min Pay%</div>
        <div className="balanceTitle">Balance</div>
      </div>
      {creditors.map((creditor, index) => (
        <Creditor
          index={index}
          key={creditor.id}
          creditorInfo={creditor}
          handleCheck={handleCheck}
        />
      ))}
      <div className="buttonsContainer">
        <button className="buttonStyle" data-testid="addDebt" onClick={addDebt}>
          Add Debt
        </button>
        <button
          className="buttonStyle"
          data-testid="removeDebt"
          disabled={isRemoveDisabled}
          onClick={removeDebt}
        >
          Remove Debt
        </button>
      </div>
      <div className="totalRow">
        <div>Total</div>
        <div data-testid="totalCount">{formatToUSD(total)}</div>
      </div>
      <div className="rowCountContainer">
        <div className="totalRowCountContainer">
          <div className="totalRowCountTitle">Total Row Count :</div>
          <div className="totalRowCountValue" data-testid="rowCount">
            {rowCount}
          </div>
        </div>
        <div className="checkCountContainer">
          <div className="checkCountTitle">Check Row Count :</div>
          <div className="checkCountValue" data-testid="checkCount">
            {checkCount}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
