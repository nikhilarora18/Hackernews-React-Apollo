import React, {useState} from "react";
import {AUTH_TOKEN} from "../constants";
import {gql} from "apollo-boost";
import {Mutation} from "react-apollo";
import {useHistory} from "react-router";

const SIGNUP_MUTATION = gql`
  mutation SignupMutation($email: String!, $password: String!, $name: String!) {
    signup(email: $email, password: $password, name: $name) {
      token
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation LoginMutation($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
    }
  }
`;

const Login: React.FC = () => {
  const [authState, setAuthState] = useState({
    login: true,
    name: "",
    email: "",
    password: ""
  });
  const {login, email, name, password} = authState;
  const history = useHistory();

  return (
    <div>
      <h4 className="mv3">{login ? "Login" : "Signup"}</h4>
      <div className="flex flex-column">
        {!login && (
          <input
            value={name}
            onChange={e => setAuthState({
              name: e.target.value,
              email,
              password,
              login
            })}
            placeholder="Your name"
            type="text"
            required
          />
        )}
        <input
          value={email}
          onChange={e => setAuthState({
              email: e.target.value,
              name,
              password,
              login
          })}
          type="email"
          placeholder="Your email address"
          required
        />
        <input
          value={password}
          onChange={e => setAuthState({
            password: e.target.value,
            name,
            email,
            login
          })}
          type="password"
          placeholder="Password"
          required
        />
      </div>
      <div className="flex mt3">
        <Mutation
          mutation={login ? LOGIN_MUTATION : SIGNUP_MUTATION}
          variables={{name, email, password}}
          onCompleted={(data: any) => _confirm(data, login, history)}
        >
          {
            (mutateFunction: any) => (
              <button type="submit" className="pointer mr2 button" onClick={() => mutateFunction()}>
                {login ? 'login' : 'create account'}
              </button>
            )
          }
        </Mutation>
        <div
          className="pointer button"
          onClick={() => setAuthState(state => ({...state, login: !state.login}))}
        >
          {login
            ? 'need to create an account?'
            : 'already have an account?'}
        </div>
      </div>
    </div>
  );
};

const _confirm = async (data: any, login: boolean, history: any) => {
  const { token } = login ? data.login : data.signup;
  _saveUserData(token);
  history.push("/");

}

const _saveUserData = (token: any) => {
  localStorage.setItem(AUTH_TOKEN, token)
}

export default Login;
