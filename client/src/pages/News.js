import React, { useState } from 'react';
import '../Styles/News.css';
import logo from '../images/brasao.png';

function News() {
  const [keyword, setKeyword] = useState('');
  const [iniciodia, setInicioDia] = useState('');
  const [iniciomes, setInicioMes] = useState('');
  const [inicioano, setInicioAno] = useState('');
  const [fimdia, setFimDia] = useState('');
  const [fimmes, setFimMes] = useState('');
  const [fimano, setFimAno] = useState('');

  const handleSearch = () => {
    let url = `https://search.folha.uol.com.br/search?q=${keyword}`;

    if (iniciodia && iniciomes && inicioano && fimdia && fimmes && fimano) {
      url += `&periodo=personalizado&sd=${iniciodia}%2F${iniciomes}%2F${inicioano}&ed=${fimdia}%2F${fimmes}%2F${fimano}&site=todos`;
    }

    window.open(url, '_blank');
  };

  return (
    <div>
      <Header />
      <SearchBox keyword={keyword} setKeyword={setKeyword} handleSearch={handleSearch} />
      <DateFilter 
        setInicioDia={setInicioDia} setInicioMes={setInicioMes} setInicioAno={setInicioAno} 
        setFimDia={setFimDia} setFimMes={setFimMes} setFimAno={setFimAno}
      />
    </div>
  );
}

function Header() {
  return (
    <div className="header">
      <img src={logo} alt="Logo" className="logo" />
      <h1 className="title">UFMG - Search Project</h1>
    </div>
  );
}

function SearchBox({ keyword, setKeyword, handleSearch }) {
  return (
    <div className="search-container">
      <input 
        type="text" 
        placeholder="Pesquisar..." 
        className="search-input" 
        value={keyword} 
        onChange={(e) => setKeyword(e.target.value)} 
      />
      <button className="search-button" onClick={handleSearch}>Pesquisar</button>
    </div>
  );
}

function DateFilter({ setInicioDia, setInicioMes, setInicioAno, setFimDia, setFimMes, setFimAno }) {
  return (
    <div className="date-filter-container">
      <div className="date-filter">
        <label>Data de Início</label>
        <input type="text" placeholder="Dia" onChange={(e) => setInicioDia(e.target.value)} />
        <input type="text" placeholder="Mês" onChange={(e) => setInicioMes(e.target.value)} />
        <input type="text" placeholder="Ano" onChange={(e) => setInicioAno(e.target.value)} />
      </div>
      <div className="date-filter">
        <label>Data de Fim</label>
        <input type="text" placeholder="Dia" onChange={(e) => setFimDia(e.target.value)} />
        <input type="text" placeholder="Mês" onChange={(e) => setFimMes(e.target.value)} />
        <input type="text" placeholder="Ano" onChange={(e) => setFimAno(e.target.value)} />
      </div>
    </div>
  );
}

export default News;
