import React from 'react';
import '../Styles/KeywordsBox.css';

function KeywordsBox({ keywords, removeKeyword, handleMultiSearch }) {
  return (
    <div className="keywords-container">
      <h3>Palavras-chave adicionadas:</h3>
      {keywords.length === 0 ? (
        <p>Nenhuma palavra-chave adicionada.</p>
      ) : (
        <div className="keywords-list">
          {keywords.map((kw, index) => (
            <div key={index} className="keyword-item">
              <span>{kw}</span>
              <button onClick={() => removeKeyword(index)}>X</button>
            </div>
          ))}
        </div>
      )}
      {keywords.length > 0 && (
        <button className="search-button" onClick={handleMultiSearch}>Pesquisar todas as palavras-chave</button>
      )}
    </div>
  );
}

export default KeywordsBox;
