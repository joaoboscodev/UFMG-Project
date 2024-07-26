import React, { useEffect } from 'react';
import Pagination from '../components/Pagination';
import '../Styles/SearchResults.css';

function SearchResults({ groupedResults, currentPages, handlePageChange, dropdownOpen, setDropdownOpen, keyword }) {
  useEffect(() => {
    if (dropdownOpen && !(dropdownOpen in currentPages)) {
      handlePageChange(dropdownOpen, 1);
    }
  }, [dropdownOpen, currentPages, handlePageChange]);

  const generatePDF = async (link) => {
    console.log('Generating PDF for link:', link);
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
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    }
  };

  const saveToDrive = async (link, keyword, source) => {
    console.log('Attempting to save to drive:');
    console.log('Link:', link);
    console.log('Keyword:', keyword);
    console.log('Source:', source);

    try {
      const response = await fetch('http://localhost:5000/api/save-to-drive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: link, keyword, source }),
      });
      const data = await response.json();
      console.log('Save to Drive response:', data.message);
    } catch (error) {
      console.error('Erro ao salvar no Drive:', error);
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
              {groupedResults[source].slice((currentPages[source] - 1) * 5, currentPages[source] * 5).map((result, index) => (
                <div key={index} className="result-item">
                  {result.image && <img src={result.image} alt="" className="thumbnail" />}
                  <div className="result-content">
                    <p>{result.title}</p>
                    <button onClick={() => window.open(result.link, '_blank')} className="link-button">Ler mais</button>
                    <button onClick={() => generatePDF(result.link)} className="link-button">Gerar PDF</button>
                    <button onClick={() => { 
                      console.log('Botão "Enviar para o Drive" clicado');
                      saveToDrive(result.link, keyword, source); 
                    }} className="link-button">Enviar para o Drive</button>
                  </div>
                </div>
              ))}
              <Pagination 
                currentPage={currentPages[source] || 1} 
                totalPages={Math.ceil(groupedResults[source].length / 5)} 
                setCurrentPage={(page) => handlePageChange(source, page)}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default SearchResults;
