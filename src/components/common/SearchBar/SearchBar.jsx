import React, { useState } from 'react';
import './SearchBar.css';
import { FaSearch } from 'react-icons/fa';

const SearchBar = ({ onSearchChange, setCurrentPage, placeholder }) => {
    const [query, setQuery] = useState('');
    const handleInputChange = (e) => {
        setQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault(); 
        onSearchChange(query);
    };

    return (
        <form className="search-and-pagination" onSubmit={handleFormSubmit}>
            <input
                type="text"
                value={query}
                placeholder={placeholder}
                onChange={handleInputChange}
                className="search-input"
            />
            <button type="submit">
                <FaSearch />
                Buscar
            </button>
        </form>
    );
};

export default SearchBar;
