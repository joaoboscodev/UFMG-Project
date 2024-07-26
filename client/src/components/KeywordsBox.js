import React from 'react';
import '../Styles/KeywordsBox.css';

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

export default KeywordsBox;
