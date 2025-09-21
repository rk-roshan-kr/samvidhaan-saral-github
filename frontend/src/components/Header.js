import React from 'react';

function Header({ minimized }) {
  return (
    <header className="App-header">
      <h1 className="title-card">Samvidhaan Saral</h1>
      {!minimized && <p>Enter a legal text below to get a detailed, simplified explanation.</p>}
    </header>
  );
}

export default Header;