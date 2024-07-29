import React, { useState } from 'react';
import Header from '../components/Header';
import SearchBox from '../components/SearchBox';
import KeywordsBox from '../components/KeywordsBox';
import DateFilter from '../components/DateFilter';
import SearchResults from '../components/SearchResults';
import '../Styles/News.css';

function News() {
  const [keyword, setKeyword] = useState('');
  const [iniciodia, setInicioDia] = useState('');
  const [iniciomes, setInicioMes] = useState('');
  const [inicioano, setInicioAno] = useState('');
  const [fimdia, setFimDia] = useState('');
  const [fimmes, setFimMes] = useState('');
  const [fimano, setFimAno] = useState('');
  const [results, setResults] = useState({});
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
    setResults({});
    setMessage('');
    setCurrentPages({});
    setDropdownOpen(null);

    if (keyword.trim() !== '') {
      await searchByKeyword(keyword.trim(), sources);
    }
  };

  const handleMultiSearch = async () => {
    setResults({});
    setMessage('');
    setCurrentPages({});
    setDropdownOpen(null);

    for (let i = 0; i < keywords.length; i++) {
      await searchByKeyword(keywords[i], sources);
    }
  };

  const searchByKeyword = async (keyword, sources) => {
    const selectedSources = Object.keys(sources).filter(source => sources[source]);
    await performSearch(keyword, selectedSources);
  };

  const performSearch = async (keyword, selectedSources) => {
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
      if (typeof data !== 'object' || !data) {
        setMessage('No valid data received.');
        return;
      }
      
      setResults(prevResults => {
        const newResults = { ...prevResults };
        Object.keys(data).forEach(source => {
          if (!newResults[source]) newResults[source] = {};
          Object.keys(data[source]).forEach(keyword => {
            if (!newResults[source][keyword]) newResults[source][keyword] = [];
            newResults[source][keyword].push(...data[source][keyword]);
          });
        });
        return newResults;
      });

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

  const handlePageChange = (source, keyword, page) => {
    setCurrentPages(prevPages => ({
      ...prevPages,
      [source]: { ...prevPages[source], [keyword]: page }
    }));
  };

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
        groupedResults={results} 
        currentPages={currentPages} 
        handlePageChange={handlePageChange} 
        dropdownOpen={dropdownOpen}
        setDropdownOpen={setDropdownOpen}
        keyword={keyword}
      />
    </div>
  );
}

export default News;
