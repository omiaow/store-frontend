import React from "react";
import { useState, useCallback } from "react";

import AuthContext from "../context/auth.context";

const useHttp = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const auth = React.useContext(AuthContext);
  const token = auth?.token ?? null;
  const logout = auth?.logout;

  const requestWithMeta = useCallback(
    async (url, method = "GET", body = null, headers = {}) => {
      setLoading(true);
      try {
        const baseUrl = process.env.REACT_APP_SERVER || "";

        const isFormData =
          typeof FormData !== "undefined" && body instanceof FormData;

        if (body && !isFormData) {
          body = JSON.stringify(body);
          headers["Content-Type"] = "application/json";
        }

        // Add authorization header if token is available
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${baseUrl}${url}`, {
          method,
          body,
          headers,
        });

        let data = null;
        try {
          data = await response.json();
        } catch (_) {
          data = null;
        }

        setLoading(false);

        if (!response.ok) {
          setError(data?.message || "Something went wrong");
          if (response.status === 401) {
            if (typeof logout === "function") logout();
          }
        }

        return { ok: response.ok, status: response.status, data };
      } catch (e) {
        setLoading(false);
        setError(e.message);
        throw e;
      }
    },
    [token, logout]
  );

  const request = useCallback(
    async (url, method = "GET", body = null, headers = {}) => {
      setLoading(true);
      try {
        const baseUrl = process.env.REACT_APP_SERVER || "";

        const isFormData =
          typeof FormData !== "undefined" && body instanceof FormData;

        if (body && !isFormData) {
          body = JSON.stringify(body);
          headers["Content-Type"] = "application/json";
        }

        // Add authorization header if token is available
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${baseUrl}${url}`, {
          method,
          body,
          headers,
        });

        let data = null;
        try {
          data = await response.json();
        } catch (_) {
          data = null;
        }

        setLoading(false);

        if (!response.ok) {
          setError(data?.message || "Something went wrong");
          if (response.status === 401) {
            if (typeof logout === "function") logout();
          }
          return;
        }

        return data;
      } catch (e) {
        setLoading(false);
        setError(e.message);
        throw e;
      }
    },
    [token, logout]
  );

  const clearError = () => setError(null);

  return { loading, request, requestWithMeta, error, clearError };
}

export default useHttp;