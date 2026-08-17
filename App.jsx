import React, { useEffect, useState } from 'react';

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';

import {
  doc,
  getDocFromServer,
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
  const [carregandoPerfil, setCarregandoPerfil] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {

        console.log('==============================');
        console.log('GCONCURSOS - AUTENTICAÇÃO');
        console.log('USUÁRIO:', currentUser);
        console.log('==============================');

        setUser(currentUser);

        if (!currentUser) {
          setProfile(null);
          setCarregando(false);
          return;
        }

        setCarregandoPerfil(true);
        setMensagem('');

        try {
          console.log('UID DO USUÁRIO:');
          console.log(currentUser.uid);

          const userRef = doc(
            db,
            'users',
            currentUser.uid
          );

          console.log('BUSCANDO NO FIRESTORE:');
          console.log(
            'users/' + currentUser.uid
          );

          const userSnap =
            await getDocFromServer(userRef);

          console.log(
            'DOCUMENTO EXISTE:',
            userSnap.exists()
          );

          if (!userSnap.exists()) {

            console.error(
              'O DOCUMENTO NÃO FOI ENCONTRADO.'
            );

            setProfile(null);

            setMensagem(
              'O cadastro do usuário não foi encontrado no Firestore.'
            );

            return;
          }

          const dados = userSnap.data();

          console.log(
            'DADOS RECEBIDOS DO FIRESTORE:',
            dados
          );

          console.log(
            'EMAIL:',
            dados.email
          );

          console.log(
            'ROLE:',
            dados.role
          );

          console.log(
            'STATUS:',
            dados.status
          );

          setProfile(dados);

        } catch (error) {

          console.error(
            'ERRO FIREBASE AO CARREGAR PERFIL:',
            error
          );

          setProfile(null);

          setMensagem(
            'ERRO FIREBASE: ' +
            error.message
          );

        } finally {

          setCarregandoPerfil(false);
          setCarregando(false);
        }
      }
    );

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
        doc(
          db,
          'users',
          credencial.user.uid
        ),
        {
          email: email,
          role: 'user',
          status: 'pending',
          criadoEm:
            new Date().toISOString()
        }
      );

      setMensagem(
        'Cadastro realizado com sucesso. Aguarde a aprovação.'
      );

    } catch (error) {

      console.error(
        'ERRO NO CADASTRO:',
        error
      );

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

      console.error(
        'ERRO NO LOGIN:',
        error
      );

      setMensagem(error.message);
    }
  }

  async function sair() {

    await signOut(auth);

    setUser(null);
    setProfile(null);
    setEmail('');
    setSenha('');
    setMensagem('');
  }

  if (carregando) {

    return (
      <div className="container">
        <div className="card">

          <h1>GCONCURSOS</h1>

          <p>
            Carregando...
          </p>

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
            Plataforma inteligente para
            preparação e acompanhamento
            de concursos.
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
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <input
            type="password"
            placeholder="Sua senha"
            value={senha}
            onChange={(e) =>
              setSenha(e.target.value)
            }
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

  if (carregandoPerfil) {

    return (
      <div className="container">
        <div className="card">

          <h1>GCONCURSOS</h1>

          <h2>
            Carregando seu perfil...
          </h2>

          <p>
            Usuário: <strong>{user.email}</strong>
          </p>

        </div>
      </div>
    );
  }

  if (mensagem && !profile) {

    return (
      <div className="container">

        <div className="card">

          <h1>GCONCURSOS</h1>

          <h2>
            ⚠️ Erro ao carregar perfil
          </h2>

          <p>
            Usuário:
            <strong> {user.email}</strong>
          </p>

          <p>
            {mensagem}
          </p>

          <button onClick={sair}>
            Sair
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

          <h2>
            ⏳ Acesso pendente
          </h2>

          <p>
            Sua conta foi criada com sucesso.
          </p>

          <p>
            Aguarde a aprovação do administrador.
          </p>

          <p>
            <strong>
              {user.email}
            </strong>
          </p>

          <p>
            Status:
            <strong> {profile.status}</strong>
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

          <h2>
            🚫 Acesso bloqueado
          </h2>

          <p>
            Sua conta está temporariamente
            bloqueada.
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

        <h2>
          Bem-vindo!
        </h2>

        <p>
          Usuário:{' '}
          <strong>
            {user.email}
          </strong>
        </p>

        <p>
          Acesso:{' '}
          <strong>
            {profile?.role || 'Não definido'}
          </strong>
        </p>

        <p>
          Status:{' '}
          <strong>
            {profile?.status || 'Não definido'}
          </strong>
        </p>

        <hr />

        <h2>
          📚 Meu painel
        </h2>

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

            <h2>
              👑 Painel Administrativo
            </h2>

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
