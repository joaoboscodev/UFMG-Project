import React from 'react';
import logo from '../images/brasao.png';
import '../Styles/Header.css';

function Header() {
  return (
    <div className="header">
      <img src={logo} alt="Logo" className="logo" />
      <h1 className="title">Projeto somos diversas</h1>
    </div>
  );
}

export default Header;
