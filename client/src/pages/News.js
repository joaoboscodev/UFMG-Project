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
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState('');

  const handleSearch = async () => {
    const params = {
      keyword,
      iniciodia,
      iniciomes,
      inicioano,
      fimdia,
      fimmes,
      fimano,
    };

    const queryString = new URLSearchParams(params).toString();
    const url = `http://localhost:5000/api/search?${queryString}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log('Resultados:', data); // Log dos resultados
      setResults(data);
      setMessage('');
    } catch (error) {
      console.error('Erro ao comunicar com o backend:', error);
      setMessage('Erro ao comunicar com o backend.');
      setResults([]);
    }
  };

  return (
    <div>
      <Header />
      <SearchBox keyword={keyword} setKeyword={setKeyword} handleSearch={handleSearch} />
      <DateFilter 
        setInicioDia={setInicioDia} setInicioMes={setInicioMes} setInicioAno={setInicioAno} 
        setFimDia={setFimDia} setFimMes={setFimMes} setFimAno={setFimAno}
      />
      {message && <p>{message}</p>}
      <SearchResults results={results} />
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

function SearchResults({ results }) {
  return (
    <div className="results-container">
      {results.map((result, index) => (
        <div key={index} className="result-item">
          <a href={result.link} target="_blank" rel="noopener noreferrer">
            {result.image && <img src={result.image} alt="Thumbnail" className="thumbnail" />}
            <p>{result.title}</p>
          </a>
        </div>
      ))}
    </div>
  );
}

export default News;
