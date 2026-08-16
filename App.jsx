import React from 'react';
import './styles.css';
import { app } from './firebase';

export default function App() {
  return (
    <div className="container">
      <h1>GCONCURSOS</h1>
      <p>Sua plataforma inteligente de aprovação.</p>
      <div className="card">
        <h2>Projeto publicado com sucesso 🚀</h2>
        <p>Firebase conectado ao projeto <strong>gconcursos-f7e54</strong>.</p>
        <ul>
          <li>Login por e-mail</li>
          <li>Diagnóstico por matéria</li>
          <li>Cronograma automático</li>
          <li>Painel administrativo</li>
        </ul>
      </div>
    </div>
  );
}
