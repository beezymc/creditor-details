import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Creditor from './components/Creditor.jsx'
import { creditorsDecorator, calcTotal, formatToUSD } from './utils.js'
import './css/app.css'
const App = () => {
  const [creditors, setCreditors] = useState([]);
  const [error, setError] = useState(false);
  const [total, setTotal] = useState(0);
  const [rowCount, setRowCount] = useState(0);
  const [checkCount, setCheckCount] = useState(0);

  useEffect(() => {
    axios.get('https://raw.githubusercontent.com/StrategicFS/Recruitment/master/data.json')
      .then(({ data }) => {
        creditorsDecorator(data);
        setCreditors(data);
        setTotal(calcTotal(data));
        setRowCount(data.length);
        setCheckCount(data.length);
      })
      .catch((err) => {
        setError(true);
      })
  }, []);

  const addDebt = () => {
    const creditorsCopy = [...creditors];
    const newCreditor = {
      id: creditorsCopy[creditorsCopy.length - 1]?.id + 1 || 1,
      balance: 3000,
      creditorName: 'Test',
      firstName: 'Test',
      lastName: 'Test',
      minPaymentPercentage: 1,
      isChecked: true
    };
    creditorsCopy.push(newCreditor);
    setCreditors(creditorsCopy);
    setRowCount(rowCount + 1);
    setCheckCount(checkCount + 1);
    setTotal(total + newCreditor.balance);
  }

  const removeDebt = () => {
    if (creditors.length) {
      const creditorsCopy = [...creditors];
      const removedCreditor = creditorsCopy.pop();
      setCreditors(creditorsCopy);
      setRowCount(rowCount - 1);
      if (removedCreditor.isChecked) {
        setCheckCount(checkCount - 1);
        setTotal(total - removedCreditor.balance);
      }
    }
  };

  const handleCheck = (id) => {
    const creditorsCopy = [...creditors];
    for (let i = 0; i < creditorsCopy.length; i++) {
      if (id === creditorsCopy[i].id) {
        if (creditorsCopy[i].isChecked) {
          setTotal(total - creditorsCopy[i].balance);
          setCheckCount(checkCount - 1);
        } else {
          setTotal(total + creditorsCopy[i].balance);
          setCheckCount(checkCount + 1);
        }
        creditorsCopy[i].isChecked = !creditorsCopy[i].isChecked;
        break;
      }
    }
    setCreditors(creditorsCopy);
  };

  if (error) return (
    <div>
      <img src='https://ubiq.co/tech-blog/wp-content/uploads/2020/08/apache-500-internal-server-error.png' alt='Error Code 500. Server Error' />
    </div>
  );

  return (
    <div className='main'>
      <div className='titleRow'>
        <div className='checkContainer' />
        <div className='creditorTitle'>
          Creditor
        </div>
        <div className='firstNameTitle'>
          First Name
        </div>
        <div className='lastNameTitle'>
          Last Name
        </div>
        <div className='minPayTitle'>
          Min Pay%
        </div>
        <div className='balanceTitle'>
          Balance
        </div>
      </div>
      {creditors.map((creditor) => (
        <Creditor key={creditor.id} creditorInfo={creditor} handleCheck={handleCheck}/>
      ))}
      <div className='buttonsContainer'>
        <button className='buttonStyle' onClick={addDebt}>Add Debt</button>
        <button className='buttonStyle' onClick={removeDebt}>Remove Debt</button>
      </div>
      <div className='totalRow'>
        <div>
          Total
        </div>
        <div>
          {formatToUSD(total)}
        </div>
      </div>
      <div className='rowCountContainer'>
        <div className='totalRowCountContainer'>
          <div className='totalRowCountTitle'>
            Total Row Count :
          </div>
          <div className='totalRowCountValue'>
            {rowCount}
          </div>
        </div>
        <div className='checkCountContainer'>
          <div className='checkCountTitle'>
            Check Row Count :
          </div>
          <div className='checkCountValue'>
            {checkCount}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
