import React, { useState } from 'react';
import Header from '../components/Header';
import SearchBox from '../components/SearchBox';
import KeywordsBox from '../components/KeywordsBox';
import DateFilter from '../components/DateFilter';
import SearchResults from '../components/SearchResults';
import '../Styles/News.css';

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
    setDropdownOpen(null);

    if (keyword.trim() !== '') {
      await searchByKeyword(keyword.trim(), sources);
    }
  };

  const handleMultiSearch = async () => {
    setResults([]);
    setMessage('');
    setCurrentPages({});
    setDropdownOpen(null);

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
      <div className="search-keywords-container">
        <SearchBox 
          keyword={keyword} 
          setKeyword={setKeyword} 
          handleSingleSearch={handleSingleSearch} 
          addKeyword={addKeyword} 
          handleSourceChange={handleSourceChange} 
          sources={sources} 
        />
        <KeywordsBox keywords={keywords} removeKeyword={removeKeyword} handleMultiSearch={handleMultiSearch} />
      </div>
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
        keyword={keyword}  // Passando keyword como prop
      />
    </div>
  );
}

export default News;
