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
      try {
        setUser(currentUser);

        if (!currentUser) {
          setProfile(null);
          return;
        }

        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
console.log("DOCUMENTO EXISTE:", userSnap.exists());
        if (!userSnap.exists()) {
          setProfile(null);
          setMensagem('Perfil do usuário não encontrado.');
          return;
        }

        const dados = userSnap.data();

console.log("DADOS DO USUARIO:", dados);

setProfile(dados);

      } catch (error) {
        console.error('ERRO FIREBASE:', error);
        setMensagem('Erro Firebase: ' + error.message);
      } finally {
        setCarregando(false);
      }
    });

    return () => unsubscribe();
  }, []);

  async function cadastrar() {
    setMensagem('');

    try {
      const credencial =
        await createUserWithEmailAndPassword(
          auth,
          email,
          senha
        );

      await setDoc(
        doc(db, 'users', credencial.user.uid),
        {
          email: email,
          role: 'user',
          status: 'pending',
          criadoEm: new Date().toISOString()
        }
      );

    } catch (error) {
      setMensagem(error.message);
    }
  }

  async function entrar() {
    setMensagem('');

    try {
      await signInWithEmailAndPassword(
        auth,
        email,
        senha
      );
    } catch (error) {
      setMensagem(error.message);
    }
  }

  async function sair() {
    await signOut(auth);
    setEmail('');
    setSenha('');
    setProfile(null);
  }

  if (carregando) {
    return (
      <div className="container">
        <div className="card">
          <h1>GCONCURSOS</h1>
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
            Plataforma inteligente para preparação
            e acompanhamento de concursos.
          </p>

          <h2>
            {modo === 'login'
              ? 'Entrar'
              : 'Criar minha conta'}
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

          <button
            onClick={
              modo === 'login'
                ? entrar
                : cadastrar
            }
          >
            {modo === 'login'
              ? 'Entrar'
              : 'Criar conta'}
          </button>

          {mensagem && (
            <p className="mensagem">
              {mensagem}
            </p>
          )}

          <button
            className="link-button"
            onClick={() => {
              setModo(
                modo === 'login'
                  ? 'cadastro'
                  : 'login'
              );
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
            Aguarde a aprovação do administrador.
          </p>

          <p>
            <strong>{user.email}</strong>
          </p>

          <button onClick={sair}>
            Sair
          </button>

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

          <button onClick={sair}>
            Sair
          </button>

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
          Acesso:{' '}
          <strong>
            {profile?.role || 'Não definido'}
          </strong>
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
          <>
            <hr />
            <h2>👑 Painel Administrativo</h2>
            <p>
              Área exclusiva do administrador.
            </p>
          </>
        )}

        <button onClick={sair}>
          Sair
        </button>

      </div>
    </div>
  );
}
