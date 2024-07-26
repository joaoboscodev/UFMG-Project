import React, { useState, useEffect } from 'react';
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
  const [currentPages, setCurrentPages] = useState({});
  const [keywords, setKeywords] = useState([]);
  const [sources, setSources] = useState({
    folha: false,
    g1: false,
    oglobo: false,
    uol: false,
    correiobraziliense: false,
    cnnbrasil: false,
    agenciabrasil: false,
  });
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const handleSingleSearch = async () => {
    setResults([]);
    setMessage('');
    setCurrentPages({});
    setDropdownOpen(null); // Reseta o estado do dropdown

    if (keyword.trim() !== '') {
      await searchByKeyword(keyword.trim(), sources);
    }
  };

  const handleMultiSearch = async () => {
    setResults([]);
    setMessage('');
    setCurrentPages({});
    setDropdownOpen(null); // Reseta o estado do dropdown

    for (let i = 0; i < keywords.length; i++) {
      await searchByKeyword(keywords[i], sources);
    }
  };

  const searchByKeyword = async (keyword, sources) => {
    const selectedSources = Object.keys(sources).filter(source => sources[source]);
    await performSearch(keyword, sources, selectedSources);
  };

  const performSearch = async (keyword, sources, selectedSources) => {
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
      const newCurrentPages = {};
      selectedSources.forEach(source => {
        newCurrentPages[source] = 1;
      });
      setCurrentPages(newCurrentPages);
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

  const handlePageChange = (source, page) => {
    setCurrentPages(prevPages => ({ ...prevPages, [source]: page }));
  };

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.source]) {
      acc[result.source] = [];
    }
    acc[result.source].push(result);
    return acc;
  }, {});

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
      <SearchResults 
        groupedResults={groupedResults} 
        currentPages={currentPages} 
        handlePageChange={handlePageChange} 
        dropdownOpen={dropdownOpen}
        setDropdownOpen={setDropdownOpen}
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
        {Object.keys(sources).map(source => (
          <label key={source}>
            <input 
              type="checkbox" 
              name={source} 
              checked={sources[source]}
              onChange={handleSourceChange} 
            /> 
            {source.charAt(0).toUpperCase() + source.slice(1)}
          </label>
        ))}
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

function SearchResults({ groupedResults, currentPages, handlePageChange, dropdownOpen, setDropdownOpen }) {
  useEffect(() => {
    if (dropdownOpen && !(dropdownOpen in currentPages)) {
      handlePageChange(dropdownOpen, 1);
    }
  }, [dropdownOpen, currentPages, handlePageChange]);

  const generatePDF = async (link) => {
    try {
      const response = await fetch('http://localhost:5000/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleUrl: link }),
      });
      const data = await response.json();
      console.log(data.message);
      // Opcional: você pode exibir uma mensagem de sucesso ou falha para o usuário
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      // Opcional: você pode exibir uma mensagem de erro para o usuário
    }
  };

  return (
    <div className="results-container">
      {Object.keys(groupedResults).map(source => (
        <div key={source}>
          <button type="button" onClick={() => setDropdownOpen(dropdownOpen === source ? null : source)}>
            {source.charAt(0).toUpperCase() + source.slice(1)}
          </button>
          {dropdownOpen === source && (
            <div className="dropdown-content">
              {groupedResults[source].slice((currentPages[source] - 1) * RESULTS_PER_PAGE, currentPages[source] * RESULTS_PER_PAGE).map((result, index) => (
                <div key={index} className="result-item">
                  {result.image && <img src={result.image} alt="" className="thumbnail" />}
                  <div className="result-content">
                    <p>{result.title}</p>
                    <button onClick={() => window.open(result.link, '_blank')} className="link-button">Ler mais</button>
                    <button onClick={() => generatePDF(result.link)} className="link-button">Gerar PDF</button>
                  </div>
                </div>
              ))}
              <Pagination 
                currentPage={currentPages[source] || 1} 
                totalPages={Math.ceil(groupedResults[source].length / RESULTS_PER_PAGE)} 
                setCurrentPage={(page) => handlePageChange(source, page)}
              />
            </div>
          )}
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
