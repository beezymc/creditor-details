import React from "react";
import "../css/creditor.css";

const Creditor = ({ creditorInfo, handleCheck, index }) => {
  const {
    id,
    balance,
    creditorName,
    firstName,
    lastName,
    minPaymentPercentage,
    isChecked,
  } = creditorInfo;
  return (
    <div className="dataRow">
      <div className="checkContainer">
        <input
          type="checkbox"
          checked={isChecked}
          data-testid={`checkbox${index}`}
          onChange={() => handleCheck(id)}
        />
      </div>
      <div className="creditorData">{creditorName}</div>
      <div className="firstNameData">{firstName}</div>
      <div className="lastNameData">{lastName}</div>
      <div className="minPaymentData">{minPaymentPercentage.toFixed(2)}%</div>
      <div className="balanceData" data-testid={`balance${index}`}>
        {balance.toFixed(2)}
      </div>
    </div>
  );
};

export default Creditor;
