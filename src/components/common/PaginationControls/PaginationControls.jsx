import React from 'react';
import './PaginationControls.css';

const PaginationControls = ({
    currentPage,
    totalPages,
    count,
    setCurrentPage,
}) => {
    return (
        <div className="pagination-controls">
            <span>
                Página {currentPage} de {totalPages} ({count} produtos)
            </span>
            <div>
                <button
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={currentPage === 1}>
                    Anterior
                </button>
                <button
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={currentPage >= totalPages}>
                    Próxima
                </button>
            </div>
        </div>
    );
};

export default PaginationControls;
