import React from 'react';
import '../css/creditor.css'

const Creditor = ({ creditorInfo, handleCheck }) => {
  const { id, balance, creditorName, firstName, lastName, minPaymentPercentage, isChecked } = creditorInfo;
  return(
    <div className='dataRow'>
      <div className='checkContainer'>
        <input type='checkbox' checked={isChecked} onClick={() => handleCheck(id)}/>
      </div>
      <div className='creditorData'>
        {creditorName}
      </div>
      <div className='firstNameData'>
        {firstName}
      </div>
      <div className='lastNameData'>
        {lastName}
      </div>
      <div className='minPaymentData'>
        {minPaymentPercentage}
      </div>
      <div className='balanceData'>
        {balance}
      </div>
    </div>
  )
};

export default Creditor;