import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function OwnerLoginPage() {
  const { signIn, status, error } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") navigate("/owner", { replace: true });
  }, [navigate, status]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setValidationError("Enter your email address and password.");
      return;
    }

    setValidationError("");
    setSubmitting(true);
    try {
      await signIn(email, password);
      const intendedPath = location.state?.from?.pathname?.startsWith("/owner")
        ? `${location.state.from.pathname}${location.state.from.search || ""}`
        : "/owner";
      navigate(intendedPath, { replace: true });
    } catch {
      // The context exposes the generic server error for the status region.
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="owner-login-page">
      <section
        className="owner-login-panel"
        aria-labelledby="owner-login-title"
      >
        <p className="eyebrow">Deepak Supermarket</p>
        <h1 id="owner-login-title">Owner sign in</h1>
        <p className="owner-login-panel__intro">
          Access the private area for managing the supermarket catalogue.
        </p>
        <form className="owner-login-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="owner-email">Email address</label>
            <input
              id="owner-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="owner-password">Password</label>
            <div className="owner-password-field">
              <input
                id="owner-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                className="button button--outline button--small"
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-pressed={showPassword}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          {(validationError || error) && (
            <p className="form-error" role="alert">
              {validationError || error}
            </p>
          )}
          <button
            className="button button--primary owner-login-form__submit"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <Link className="link-arrow owner-login-panel__back" to="/">
          Back to the public website
        </Link>
      </section>
    </main>
  );
}
