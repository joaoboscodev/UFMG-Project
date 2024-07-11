import React from 'react';
import '../Styles/News.css';
import logo from '../images/brasao.png';

function News() {
  return (
    <div>
      <Header />
      <h2>News</h2>
      <p>Welcome to the News page!</p>
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

export default News;
