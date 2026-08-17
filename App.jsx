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
  const [carregandoPerfil, setCarregandoPerfil] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        console.log('GCONCURSOS - AUTENTICAÇÃO');
        console.log('Usuário:', currentUser);

        setUser(currentUser);

        if (!currentUser) {
          setProfile(null);
          setMensagem('');
          setCarregando(false);
          return;
        }

        setCarregandoPerfil(true);
        setMensagem('');

        try {
          console.log('GCONCURSOS - BUSCANDO PERFIL');

          console.log('E-mail:', currentUser.email);
          console.log('UID:', currentUser.uid);

          const userRef = doc(
            db,
            'users',
            currentUser.uid
          );

          console.log(
            'Caminho:',
            'users/' + currentUser.uid
          );

          const userSnap = await getDoc(userRef);

          console.log(
            'Documento existe:',
            userSnap.exists()
          );

          if (!userSnap.exists()) {
            console.error(
              'Documento do usuário não encontrado.'
            );

            setProfile(null);
            setMensagem(
              'Perfil do usuário não encontrado no Firestore.'
            );

            return;
          }

          const dados = userSnap.data();

          console.log('DADOS DO USUARIO:', dados);

          console.log('E-mail:', dados.email);
          console.log('Role:', dados.role);
          console.log('Status:', dados.status);

          setProfile({
            email: dados.email || currentUser.email,
            role: dados.role || 'user',
            status: dados.status || 'pending',
            criadoEm: dados.criadoEm || ''
          });

        } catch (error) {
          console.error('ERRO FIREBASE:', error);

          setProfile(null);

          setMensagem(
            'ERRO FIREBASE: ' + error.message
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

    if (!email || !senha) {
      setMensagem(
        'Informe seu e-mail e sua senha.'
      );
      return;
    }

    try {
      const credencial =
        await createUserWithEmailAndPassword(
          auth,
          email,
          senha
        );

      console.log(
        'Usuário criado:',
        credencial.user.uid
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
          criadoEm: new Date().toISOString()
        }
      );

      console.log(
        'Perfil criado no Firestore.'
      );

      setMensagem(
        'Cadastro realizado com sucesso. Aguarde a aprovação.'
      );

    } catch (error) {
      console.error(
        'ERRO AO CADASTRAR:',
        error
      );

      setMensagem(error.message);
    }
  }

  async function entrar() {
    setMensagem('');

    if (!email || !senha) {
      setMensagem(
        'Informe seu e-mail e sua senha.'
      );
      return;
    }

    try {
      console.log('Realizando login...');

      await signInWithEmailAndPassword(
        auth,
        email,
        senha
      );

      console.log(
        'Login realizado com sucesso.'
      );

    } catch (error) {
      console.error(
        'ERRO AO ENTRAR:',
        error
      );

      setMensagem(error.message);
    }
  }

  async function sair() {
    try {
      await signOut(auth);

      setUser(null);
      setProfile(null);
      setEmail('');
      setSenha('');
      setMensagem('');

    } catch (error) {
      console.error(
        'ERRO AO SAIR:',
        error
      );
    }
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
            Usuário:{' '}
            <strong>
              {user.email}
            </strong>
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
            Usuário:{' '}
            <strong>
              {user.email}
            </strong>
          </p>

          <p className="mensagem">
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

          <hr />

          <p>
            Usuário:{' '}
            <strong>
              {user.email}
            </strong>
          </p>

          <p>
            Status:{' '}
            <strong>
              {profile.status}
            </strong>
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
