import React from 'react';
import '../Styles/Pagination.css';

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

export default Pagination;
