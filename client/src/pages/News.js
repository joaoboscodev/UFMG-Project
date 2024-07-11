import React from 'react';
import '../Styles/News.css';
import logo from '../images/brasao.png';

function News() {
  return (
    <div>
      <Header />
      <SearchBox />
    </div>
  );
}

function Header() {
  return (
    <div className="header">
      <img src={logo} alt="Logo" className="logo" />
      <h1 className="title">UFMG - Search Project</h1>
    </div>
  );
}

function SearchBox() {
  return (
    <div className="search-container">
      <input type="text" placeholder="Pesquisar..." className="search-input" />
      <button className="search-button">Pesquisar</button>
    </div>
  );
}

export default News;
