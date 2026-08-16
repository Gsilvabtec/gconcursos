import React, { useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore';

import { auth, db } from './firebase';
import './estilos.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [modo, setModo] = useState('login');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setProfile(userSnap.data());
        }
      } else {
        setProfile(null);
      }

      setCarregando(false);
    });

    return () => unsubscribe();
  }, []);

  async function cadastrar() {
    setMensagem('');

    try {
      const credencial = await createUserWithEmailAndPassword(
        auth,
        email,
        senha
      );

      await setDoc(doc(db, 'users', credencial.user.uid), {
        email: email,
        role: 'user',
        status: 'pending',
        criadoEm: new Date().toISOString()
      });

      setMensagem(
        'Cadastro realizado! Aguarde a aprovação do administrador.'
      );
    } catch (error) {
      setMensagem(traduzirErro(error.code));
    }
  }

  async function entrar() {
    setMensagem('');

    try {
      await signInWithEmailAndPassword(auth, email, senha);
    } catch (error) {
      setMensagem(traduzirErro(error.code));
    }
  }

  async function sair() {
    await signOut(auth);
    setEmail('');
    setSenha('');
    setMensagem('');
  }

  function traduzirErro(codigo) {
    const erros = {
      'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
      'auth/invalid-email': 'Digite um e-mail válido.',
      'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
      'auth/invalid-credential': 'E-mail ou senha incorretos.',
      'auth/user-not-found': 'Usuário não encontrado.',
      'auth/wrong-password': 'Senha incorreta.'
    };

    return erros[codigo] || 'Não foi possível realizar a operação.';
  }

  if (carregando) {
    return (
      <div className="container">
        <div className="card">
          <h2>GCONCURSOS</h2>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container">
        <div className="card login-card">
          <h1>GCONCURSOS</h1>

          <p>
            Plataforma inteligente para preparação e acompanhamento
            de concursos.
          </p>

          <h2>
            {modo === 'login' ? 'Entrar' : 'Criar minha conta'}
          </h2>

          <input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          <button onClick={modo === 'login' ? entrar : cadastrar}>
            {modo === 'login' ? 'Entrar' : 'Criar conta'}
          </button>

          {mensagem && (
            <p className="mensagem">
              {mensagem}
            </p>
          )}

          <button
            className="link-button"
            onClick={() => {
              setModo(modo === 'login' ? 'cadastro' : 'login');
              setMensagem('');
            }}
          >
            {modo === 'login'
              ? 'Ainda não tenho conta'
              : 'Já tenho uma conta'}
          </button>
        </div>
      </div>
    );
  }

  if (profile?.status === 'pending') {
    return (
      <div className="container">
        <div className="card">
          <h1>GCONCURSOS</h1>

          <h2>⏳ Acesso pendente</h2>

          <p>
            Sua conta foi criada com sucesso.
          </p>

          <p>
            O administrador precisa aprovar seu acesso antes de
            você utilizar a plataforma.
          </p>

          <p>
            <strong>{user.email}</strong>
          </p>

          <button onClick={sair}>Sair</button>
        </div>
      </div>
    );
  }

  if (profile?.status === 'blocked') {
    return (
      <div className="container">
        <div className="card">
          <h1>GCONCURSOS</h1>

          <h2>🚫 Acesso bloqueado</h2>

          <p>
            Sua conta está temporariamente bloqueada.
          </p>

          <button onClick={sair}>Sair</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1>GCONCURSOS</h1>

        <h2>Bem-vindo!</h2>

        <p>
          Usuário: <strong>{user.email}</strong>
        </p>

        <p>
          Acesso: <strong>{profile?.role}</strong>
        </p>

        <hr />

        <h2>📚 Meu painel</h2>

        <ul>
          <li>🎯 Meus concursos</li>
          <li>📚 Minhas matérias</li>
          <li>📊 Diagnóstico por matéria</li>
          <li>📈 Minha evolução</li>
          <li>📅 Meu cronograma</li>
        </ul>

        {profile?.role === 'admin' && (
          <div>
            <hr />
            <h2>👑 Painel Administrativo</h2>
            <p>
              Área exclusiva do administrador.
            </p>
          </div>
        )}

        <button onClick={sair}>Sair</button>
      </div>
    </div>
  );
}
