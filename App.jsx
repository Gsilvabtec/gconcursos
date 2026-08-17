```jsx
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
} from 'firebase/firestore/lite';

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

  /*
   * ============================================================
   * VERIFICAR USUÁRIO LOGADO
   * ============================================================
   */

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {

        console.log('================================');
        console.log('GCONCURSOS');
        console.log('AUTENTICAÇÃO');
        console.log('================================');

        console.log('Usuário autenticado:', currentUser);

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

          console.log('================================');
          console.log('BUSCANDO PERFIL');
          console.log('================================');

          console.log(
            'E-mail:',
            currentUser.email
          );

          console.log(
            'UID:',
            currentUser.uid
          );

          /*
           * Documento:
           *
           * users/
           *    UID DO USUÁRIO
           */

          const userRef = doc(
            db,
            'users',
            currentUser.uid
          );

          console.log(
  'Caminho:',
  'users/' + currentUser.uid
);

          /*
           * Firestore Lite
           */

          const userSnap = await getDoc(userRef);

          console.log(
            'Documento existe:',
            userSnap.exists()
          );

          if (!userSnap.exists()) {

            console.error(
              'DOCUMENTO DO USUÁRIO NÃO EXISTE.'
            );

            setProfile(null);

            setMensagem(
              'O documento do usuário não foi encontrado no Firestore.'
            );

            return;
          }

          /*
           * Dados encontrados
           */

          const dados = userSnap.data();

          console.log('================================');
          console.log('DADOS DO USUÁRIO');
          console.log('================================');

          console.log(dados);

          console.log(
            'E-mail:',
            dados.email
          );

          console.log(
            'Role:',
            dados.role
          );

          console.log(
            'Status:',
            dados.status
          );

          setProfile({
            email: dados.email || currentUser.email,
            role: dados.role || 'user',
            status: dados.status || 'pending',
            criadoEm: dados.criadoEm || ''
          });

        } catch (error) {

          console.error(
            '================================'
          );

          console.error(
            'ERRO FIREBASE'
          );

          console.error(
            '================================'
          );

          console.error(error);

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


  /*
   * ============================================================
   * CADASTRAR
   * ============================================================
   */

  async function cadastrar() {

    setMensagem('');

    if (!email || !senha) {

      setMensagem(
        'Informe seu e-mail e sua senha.'
      );

      return;
    }

    try {

      console.log(
        'Criando conta...'
      );

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

      /*
       * Criar documento no Firestore
       */

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
        'Documento criado no Firestore.'
      );

      setMensagem(
        'Cadastro realizado com sucesso. Aguarde a aprovação do administrador.'
      );

    } catch (error) {

      console.error(
        'ERRO AO CADASTRAR:',
        error
      );

      setMensagem(
        error.message
      );
    }
  }


  /*
   * ============================================================
   * ENTRAR
   * ============================================================
   */

  async function entrar() {

    setMensagem('');

    if (!email || !senha) {

      setMensagem(
        'Informe seu e-mail e sua senha.'
      );

      return;
    }

    try {

      console.log(
        'Realizando login...'
      );

      await signInWithEmailAndPassword(
        auth,
        email,
        senha
      );

      console.log(
        'Login realizado.'
      );

    } catch (error) {

      console.error(
        'ERRO AO ENTRAR:',
        error
      );

      setMensagem(
        error.message
      );
    }
  }


  /*
   * ============================================================
   * SAIR
   * ============================================================
   */

  async function sair() {

    try {

      await signOut(auth);

      setUser(null);
      setProfile(null);

      setEmail('');
      setSenha('');

      setMensagem('');

      console.log(
        'Usuário saiu.'
      );

    } catch (error) {

      console.error(
        'Erro ao sair:',
        error
      );

    }
  }


  /*
   * ============================================================
   * CARREGANDO
   * ============================================================
   */

  if (carregando) {

    return (

      <div className="container">

        <div className="card">

          <h1>
            GCONCURSOS
          </h1>

          <p>
            Carregando...
          </p>

        </div>

      </div>

    );
  }


  /*
   * ============================================================
   * LOGIN / CADASTRO
   * ============================================================
   */

  if (!user) {

    return (

      <div className="container">

        <div className="card login-card">

          <h1>
            GCONCURSOS
          </h1>

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


  /*
   * ============================================================
   * CARREGANDO PERFIL
   * ============================================================
   */

  if (carregandoPerfil) {

    return (

      <div className="container">

        <div className="card">

          <h1>
            GCONCURSOS
          </h1>

          <h2>
            Carregando seu perfil...
          </h2>

          <p>
            Usuário:
            <strong>
              {' '}{user.email}
            </strong>
          </p>

        </div>

      </div>

    );
  }


  /*
   * ============================================================
   * ERRO AO CARREGAR PERFIL
   * ============================================================
   */

  if (mensagem && !profile) {

    return (

      <div className="container">

        <div className="card">

          <h1>
            GCONCURSOS
          </h1>

          <h2>
            ⚠️ Erro ao carregar perfil
          </h2>

          <p>

            Usuário:
            <strong>
              {' '}{user.email}
            </strong>

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


  /*
   * ============================================================
   * USUÁRIO PENDENTE
   * ============================================================
   */

  if (profile?.status === 'pending') {

    return (

      <div className="container">

        <div className="card">

          <h1>
            GCONCURSOS
          </h1>

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
            Usuário:
            <strong>
              {' '}{user.email}
            </strong>
          </p>

          <p>
            Status:
            <strong>
              {' '}{profile.status}
            </strong>
          </p>

          <button onClick={sair}>
            Sair
          </button>

        </div>

      </div>

    );
  }


  /*
   * ============================================================
   * USUÁRIO BLOQUEADO
   * ============================================================
   */

  if (profile?.status === 'blocked') {

    return (

      <div className="container">

        <div className="card">

          <h1>
            GCONCURSOS
          </h1>

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


  /*
   * ============================================================
   * PAINEL PRINCIPAL
   * ============================================================
   */

  return (

    <div className="container">

      <div className="card">

        <h1>
          GCONCURSOS
        </h1>

        <h2>
          Bem-vindo!
        </h2>


        <p>

          Usuário:
          <strong>
            {' '}{user.email}
          </strong>

        </p>


        <p>

          Acesso:
          <strong>
            {' '}{profile?.role || 'Não definido'}
          </strong>

        </p>


        <p>

          Status:
          <strong>
            {' '}{profile?.status || 'Não definido'}
          </strong>

        </p>


        <hr />


        <h2>
          📚 Meu painel
        </h2>


        <ul>

          <li>
            🎯 Meus concursos
          </li>

          <li>
            📚 Minhas matérias
          </li>

          <li>
            📊 Diagnóstico por matéria
          </li>

          <li>
            📈 Minha evolução
          </li>

          <li>
            📅 Meu cronograma
          </li>

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
```
