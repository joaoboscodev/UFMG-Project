import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Required for DatePicker styling
import '../Styles/DateFilter.css';

function DateFilter({ setInicioDia, setInicioMes, setInicioAno, setFimDia, setFimMes, setFimAno }) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleStartDateChange = (date) => {
    if (date) {
      setInicioDia(date.getDate().toString().padStart(2, '0'));
      setInicioMes((date.getMonth() + 1).toString().padStart(2, '0'));
      setInicioAno(date.getFullYear().toString());
    } else {
      setInicioDia('');
      setInicioMes('');
      setInicioAno('');
    }
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    if (date) {
      setFimDia(date.getDate().toString().padStart(2, '0'));
      setFimMes((date.getMonth() + 1).toString().padStart(2, '0'));
      setFimAno(date.getFullYear().toString());
    } else {
      setFimDia('');
      setFimMes('');
      setFimAno('');
    }
    setEndDate(date);
  };

  return (
    <div className="date-filter-container">
      <div className="date-filter">
        <label>Data de Início</label>
        <DatePicker 
          selected={startDate} 
          onChange={handleStartDateChange} 
          dateFormat="dd/MM/yyyy"
          placeholderText="Selecione a data de início"
        />
      </div>
      <div className="date-filter">
        <label>Data de Fim</label>
        <DatePicker 
          selected={endDate} 
          onChange={handleEndDateChange} 
          dateFormat="dd/MM/yyyy"
          placeholderText="Selecione a data de fim"
        />
      </div>
    </div>
  );
}

export default DateFilter;
