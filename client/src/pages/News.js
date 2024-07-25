import React, { useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
import '../Styles/News.css';
import logo from '../images/brasao.png';

const RESULTS_PER_PAGE = 5;

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
  const [currentPage, setCurrentPage] = useState(1);
  const [keywords, setKeywords] = useState([]);
  const [sources, setSources] = useState({
    folha: false,
    g1: false,
    oglobo: false,
    cse: false,
    correiobraziliense: false,
    cnnbrasil: false,
    agenciabrasil: false,
  });

  const handleSingleSearch = async () => {
    setResults([]);
    setMessage('');
    setCurrentPage(1);

    if (keyword.trim() !== '') {
      await searchByKeyword(keyword.trim());
    }
  };

  const handleMultiSearch = async () => {
    setResults([]);
    setMessage('');
    setCurrentPage(1);

    for (let i = 0; i < keywords.length; i++) {
      await searchByKeyword(keywords[i]);
    }
  };

  const searchByKeyword = async (keyword) => {
    const selectedSources = Object.keys(sources).filter(source => sources[source]);
    const params = {
      keyword,
      iniciodia,
      iniciomes,
      inicioano,
      fimdia,
      fimmes,
      fimano,
      source: selectedSources.join(','),
    };

    const queryString = new URLSearchParams(params).toString();
    const url = `http://localhost:5000/api/search?${queryString}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      setResults(prevResults => [...prevResults, ...data]);
    } catch (error) {
      console.error('Erro ao comunicar com o backend:', error);
      setMessage('Erro ao comunicar com o backend.');
    }
  };

  const addKeyword = () => {
    if (keyword.trim() !== '') {
      setKeywords([...keywords, keyword.trim()]);
      setKeyword('');
    }
  };

  const removeKeyword = (index) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const handleSourceChange = (e) => {
    const { name, checked } = e.target;
    setSources(prevSources => ({ ...prevSources, [name]: checked }));
  };

  const totalPages = Math.ceil(results.length / RESULTS_PER_PAGE);

  const displayedResults = results.slice(
    (currentPage - 1) * RESULTS_PER_PAGE,
    currentPage * RESULTS_PER_PAGE
  );

  return (
    <div>
      <Header />
      <SearchBox 
        keyword={keyword} 
        setKeyword={setKeyword} 
        handleSingleSearch={handleSingleSearch} 
        addKeyword={addKeyword} 
        handleSourceChange={handleSourceChange} 
        sources={sources} 
      />
      <KeywordsBox keywords={keywords} removeKeyword={removeKeyword} handleMultiSearch={handleMultiSearch} />
      <DateFilter 
        setInicioDia={setInicioDia} setInicioMes={setInicioMes} setInicioAno={setInicioAno} 
        setFimDia={setFimDia} setFimMes={setFimMes} setFimAno={setFimAno}
      />
      {message && <p>{message}</p>}
      <SearchResults results={displayedResults} />
      {totalPages > 1 && (
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          setCurrentPage={setCurrentPage} 
        />
      )}
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

function SearchBox({ keyword, setKeyword, handleSingleSearch, addKeyword, handleSourceChange, sources }) {
  return (
    <div className="search-container">
      <div className="search-box-with-buttons">
        <input 
          type="text" 
          placeholder="Adicionar palavra-chave..." 
          className="search-input" 
          value={keyword} 
          onChange={(e) => setKeyword(e.target.value)} 
        />
        <div className="buttons-container">
          <button className="search-button" onClick={handleSingleSearch}>Pesquisar</button>
          <button className="search-button" onClick={addKeyword}>Adicionar Palavra-chave</button>
        </div>
      </div>
      <div className="source-selection">
        <label>
          <input 
            type="checkbox" 
            name="folha" 
            checked={sources.folha}
            onChange={handleSourceChange} 
          /> 
          Folha
        </label>
        <label>
          <input 
            type="checkbox" 
            name="g1" 
            checked={sources.g1}
            onChange={handleSourceChange} 
          /> 
          G1
        </label>
        <label>
          <input 
            type="checkbox" 
            name="oglobo" 
            checked={sources.oglobo}
            onChange={handleSourceChange} 
          /> 
          O Globo
        </label>
        <label>
          <input 
            type="checkbox" 
            name="cse" 
            checked={sources.cse}
            onChange={handleSourceChange} 
          /> 
          Uol
        </label>
        <label>
          <input 
            type="checkbox" 
            name="correiobraziliense" 
            checked={sources.correiobraziliense}
            onChange={handleSourceChange} 
          /> 
          Correio Braziliense
        </label>
        <label>
          <input 
            type="checkbox" 
            name="cnnbrasil" 
            checked={sources.cnnbrasil}
            onChange={handleSourceChange} 
          /> 
          CNN
        </label>
        <label>
          <input 
            type="checkbox" 
            name="agenciabrasil" 
            checked={sources.agenciabrasil}
            onChange={handleSourceChange} 
          /> 
          Agência Brasil
        </label>
      </div>
    </div>
  );
}

function KeywordsBox({ keywords, removeKeyword, handleMultiSearch }) {
  return (
    <div className="keywords-container">
      <h3>Palavras-chave adicionadas:</h3>
      {keywords.length === 0 ? (
        <p>Nenhuma palavra-chave adicionada.</p>
      ) : (
        <ul>
          {keywords.map((kw, index) => (
            <li key={index}>
              {kw} <button onClick={() => removeKeyword(index)}>Remover</button>
            </li>
          ))}
        </ul>
      )}
      {keywords.length > 0 && (
        <button className="search-button" onClick={handleMultiSearch}>Pesquisar todas as palavras-chave</button>
      )}
    </div>
  );
}

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

function SearchResults({ results }) {
  return (
    <div className="results-container">
      {results.map((result, index) => (
        <div key={index} className="result-item">
          <a href={result.link} target="_blank" rel="noopener noreferrer">
            <img src={result.image} alt="" className="thumbnail" />
            <p>{result.title}</p>
          </a>
        </div>
      ))}
    </div>
  );
}

function Pagination({ currentPage, totalPages, setCurrentPage }) {
  return (
    <div className="pagination-container">
      <button 
        disabled={currentPage === 1} 
        onClick={() => setCurrentPage(currentPage - 1)}
      >
        Anterior
      </button>
      <span>Página {currentPage} de {totalPages}</span>
      <button 
        disabled={currentPage === totalPages} 
        onClick={() => setCurrentPage(currentPage + 1)}
      >
        Próxima
      </button>
    </div>
  );
}

export default News;
