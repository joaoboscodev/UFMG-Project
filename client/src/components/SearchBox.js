import React from 'react';
import '../Styles/SearchBox.css';

function SearchBox({ keyword, setKeyword, handleSingleSearch, addKeyword, handleSourceChange, sources }) {
  const getImageSource = (source) => {
    switch (source) {
      case 'folha':
        return require('../images/FSP.png');
      case 'g1':
        return require('../images/g1.png');
      case 'oglobo':
        return require('../images/oglobo.png');
      case 'uol':
        return require('../images/uol.png');
      case 'correiobraziliense':
        return require('../images/cb.png');
      case 'cnnbrasil':
        return require('../images/cnn.png');
      case 'agenciabrasil':
        return require('../images/ab.png');
      default:
        return '';
    }
  };

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
          <label key={source} className="source-label">
            <input 
              type="checkbox" 
              name={source} 
              checked={sources[source]}
              onChange={handleSourceChange} 
            />
            <img 
              src={getImageSource(source)} 
              alt={source} 
              className="source-image"
            />
          </label>
        ))}
      </div>
    </div>
  );
}

export default SearchBox;
