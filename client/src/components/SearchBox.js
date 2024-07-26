import React from 'react';
import '../Styles/SearchBox.css';

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

export default SearchBox;
