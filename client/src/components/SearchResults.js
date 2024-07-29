import React, { useState, useEffect } from 'react';
import Pagination from '../components/Pagination';
import '../Styles/SearchResults.css';
import { FaFilePdf, FaGoogleDrive, FaTools } from 'react-icons/fa';

const RESULTS_PER_PAGE = 5;

function SearchResults({ groupedResults, currentPages, handlePageChange, dropdownOpen, setDropdownOpen }) {
  const [sentToDrive, setSentToDrive] = useState({});
  const [loading, setLoading] = useState({});

  useEffect(() => {
    if (dropdownOpen && !(dropdownOpen in currentPages)) {
      handlePageChange(dropdownOpen, {}, 1);
    }
  }, [dropdownOpen, currentPages, handlePageChange]);

  const generatePDF = async (link) => {
    console.log('PDF generation is currently under maintenance.');
  };

  const saveToDrive = async (link, keyword, source) => {
    setLoading(prev => ({ ...prev, [link]: true }));
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
      
      setSentToDrive(prev => ({ ...prev, [link]: true }));
    } catch (error) {
      console.error('Erro ao salvar no Drive:', error);
    } finally {
      setLoading(prev => ({ ...prev, [link]: false }));
    }
  };

  return (
    <div className="results-container">
      {Object.keys(groupedResults).map(source => (
        <div key={source}>
          <button className="dropdown-button" type="button" onClick={() => setDropdownOpen(dropdownOpen === source ? null : source)}>
            {source.charAt(0).toUpperCase() + source.slice(1)}
          </button>
          {dropdownOpen === source && (
            <div className="dropdown-content">
              {Object.keys(groupedResults[source]).map(keyword => {
                const currentPage = currentPages[source] && currentPages[source][keyword] || 1;
                const startIndex = (currentPage - 1) * RESULTS_PER_PAGE;
                const endIndex = startIndex + RESULTS_PER_PAGE;
                const paginatedResults = groupedResults[source][keyword].slice(startIndex, endIndex);

                return (
                  <div key={keyword} className="keyword-group">
                    <h4 className="result-title">Resultados de: {keyword}</h4>
                    {paginatedResults.map((result, index) => (
                      <div key={index} className="result-item">
                        {result.image && <img src={result.image} alt="" className="thumbnail" />}
                        <div className="result-content">
                          <p>{result.title}</p>
                          <div className="button-group">
                            <button onClick={() => window.open(result.link, '_blank')} className="link-button">Ler mais</button>
                            <button className="link-button pdf-button" disabled>
                              <FaTools className="icon-space" /> PDF (Manutenção)
                            </button>
                            <button 
                              onClick={() => saveToDrive(result.link, keyword, source)} 
                              className="link-button drive-button"
                              disabled={sentToDrive[result.link] || loading[result.link]}
                            >
                              {loading[result.link] ? 'Carregando...' : (sentToDrive[result.link] ? 'Enviado' : <><FaGoogleDrive className="icon-space"/>  Drive</>)}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Pagination 
                      currentPage={currentPage} 
                      totalPages={Math.ceil(groupedResults[source][keyword].length / RESULTS_PER_PAGE)} 
                      setCurrentPage={(page) => handlePageChange(source, keyword, page)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default SearchResults;
