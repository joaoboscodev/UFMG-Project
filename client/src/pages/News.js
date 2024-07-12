import React, { useState } from 'react';
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
  const [keywords, setKeywords] = useState([]); // Estado para as palavras-chave adicionais

  const handleSingleSearch = async () => {
    setResults([]); // Limpar resultados anteriores
    setMessage('');
    setCurrentPage(1); // Resetar para a primeira página ao fazer uma nova busca

    if (keyword.trim() !== '') {
      await searchByKeyword(keyword.trim());
    }
  };

  const handleMultiSearch = async () => {
    setResults([]); // Limpar resultados anteriores
    setMessage('');
    setCurrentPage(1); // Resetar para a primeira página ao fazer uma nova busca

    // Realizar pesquisa separada para cada palavra-chave
    for (let i = 0; i < keywords.length; i++) {
      await searchByKeyword(keywords[i]);
    }
  };

  const searchByKeyword = async (keyword) => {
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
      setResults(prevResults => [...prevResults, ...data]); // Adicionar novos resultados aos resultados anteriores
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

function SearchBox({ keyword, setKeyword, handleSingleSearch, addKeyword }) {
  return (
    <div className="search-container">
      <input 
        type="text" 
        placeholder="Adicionar palavra-chave..." 
        className="search-input" 
        value={keyword} 
        onChange={(e) => setKeyword(e.target.value)} 
      />
      <button className="search-button" onClick={handleSingleSearch}>Pesquisar</button>
      <button className="search-button" onClick={addKeyword}>Adicionar Palavra-chave</button>
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
