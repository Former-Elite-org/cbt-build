import { server_url } from "../../Helper";
import {
  LOADING_SIGNUP,
  AUTH,
  LOADING_LOGIN,
  AUTH_ERROR,
  LOGOUT,
  LOADING_APP,
  ERRORS,
} from "./types";
import toast from "react-hot-toast";

export function login(
  { username, password, school_id, history, type },
  success,
  error
) {
  return (dispatch) => {
    dispatch({ type: LOADING_LOGIN });

    fetch(`${server_url}/${type}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, school_id }),
    })
      .then((raw) => raw.json())
      .then((data) => {
        dispatch({ type: LOADING_LOGIN });
        if (data.success) {
          const { token, school_id } = data;
          if (token) {
            localStorage.setItem("@@auth_token", token);
            localStorage.setItem("school_id", school_id);

            getUserProfile(token, history)
              .then((userData) => {
                if (data.success) {
                  dispatch({ type: LOADING_APP });
                  const { user_type } = userData;
                  if (user_type) {
                    dispatch({
                      type: AUTH,
                      payload: { ...data, school_id },
                    });
                    success({ ...data, school_id });
                  }
                } else {
                  localStorage.removeItem("@@auth_token");
                  localStorage.removeItem("school_id");
                  logout(history);
                  error("Logged out.");
                }
              })
              .catch((err) => {
                logout(history);
                dispatch({
                  type: ERRORS,
                  payload: { msg: "Authentication failed", error: err },
                });
                error("Authentication failed.");
              });
          }
        } else {
          dispatch({ type: ERRORS, payload: data.msg });
          error(data);
        }
      })
      .catch((err) => {
        dispatch({ type: LOADING_LOGIN });
        error(err);
        console.log(err, "err");

        // error("Authentication failed.");
      });
  };
}

export function signup(objs = {}, success = (f) => f, error = (f) => f) {
  return (dispatch) => {
    dispatch({ type: LOADING_SIGNUP });
    fetch(`${server_url}/sign_up`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(objs),
    })
      .then((raw) => raw.json())
      .then((data) => {
        dispatch({ type: LOADING_SIGNUP });
        if (data.success) {
          success(data);
        } else {
          dispatch({
            type: AUTH_ERROR,
            payload: { msg: "Server error, try again." },
          });
          error(data);
        }
      })
      .catch((err) => {
        dispatch({ type: LOADING_SIGNUP });
        console.log({ err });
        error(err);
      });
  };
}

export function expressSignup(objs = {}, success = (f) => f, error = (f) => f) {
  return (dispatch) => {
    dispatch({ type: LOADING_SIGNUP });
    fetch(`${server_url}/sign_up`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(objs),
    })
      .then((raw) => raw.json())
      .then((data) => {
        dispatch({ type: LOADING_SIGNUP });
        if (data.success) {
          success(data);
        } else {
          dispatch({
            type: AUTH_ERROR,
            payload: { msg: "Server error, try again." },
          });
          error(data);
        }
      })
      .catch((err) => {
        dispatch({ type: LOADING_SIGNUP });
        console.log({ err });
        error(err);
      });
  };
}

export async function getUserProfile(token, history) {
  try {
    const response = await fetch(`${server_url}/verify-token`, {
      method: "GET",
      headers: {
        authorization: token,
      },
    });
    return await response.json();
  } catch (error) {
    if (error.status === 401) {
      history("/");
      window.location.reload();
    }
    return error;
  }
}

export function init(history, success, error) {
  return (dispatch) => {
    const token = localStorage.getItem("@@auth_token");
    if (token) {
      getUserProfile(token, history)
        .then((data) => {
          if (data.success) {
            dispatch({ type: LOADING_APP });
            const { user } = data;
            // dispatch({ type: AUTH, payload: user });
            if (user && user.user_type) {
              dispatch({
                type: AUTH,
                payload: data,
              });
              success();
            }
          } else {
            toast.error("session expired, please login again");
            localStorage.removeItem("@@auth_token");
            history("/login");
            success();
          }
        })
        .catch((err) => {
          dispatch({
            type: ERRORS,
            payload: { msg: "Authentication failed", error: err },
          });
          logout(history);
          error();
        });
    } else {
      logout(history);
      dispatch({ type: ERRORS, payload: { msg: "Authentication failed" } });
      error();
    }
  };
}

// Accept a navigate function (from react-router-dom v6) instead of the old history object
export function logout(navigate) {
  return (dispatch) => {
    localStorage.removeItem("@@auth_token");
    localStorage.removeItem("school_id");

    // If caller didn't already redirect, ensure we are not on auth pages
    const currentPath = window.location.pathname;
    if (
      currentPath !== "/sign-up" &&
      currentPath !== "/login" &&
      typeof navigate === "function"
    ) {
      navigate("/login");
    }

    console.error("LOGGING OUT");
    dispatch({ type: LOGOUT });
  };
}
