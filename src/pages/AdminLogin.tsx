import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

import { asset, photo } from '../lib/asset'
import { BadCredentials } from '../lib/authApi'
import { useAuth } from '../store/auth'
import css from './AdminLogin.module.css'

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export default function AdminLogin() {
  const { status, signedIn, signIn } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [reveal, setReveal] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  /* Nothing to sign in to — the studio is already through the door. */
  if (status === 'checking') return null
  if (signedIn) return <Navigate to="/" replace />

  /* Any keystroke clears the last complaint. */
  const onEmail = (value: string) => {
    setEmail(value)
    setError(null)
  }
  const onPassword = (value: string) => {
    setPassword(value)
    setError(null)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (busy) return

    if (!email.trim() || !password) {
      setError('Enter both your email and password to continue.')
      return
    }
    if (!EMAIL.test(email.trim())) {
      setError('That email address does not look right.')
      return
    }

    setBusy(true)
    try {
      await signIn(email, password, remember)
      navigate('/', { replace: true })
    } catch (cause) {
      setError(
        cause instanceof BadCredentials
          ? cause.message
          : 'Something went wrong signing you in. Try again.',
      )
      setBusy(false)
    }
  }

  return (
    <div className={css.page}>
      {/* A background-image on the panel, not an <img> — the copy layer sits
          on top of it rather than beside it. */}
      <div className={css.art} style={{ backgroundImage: photo('/uploads/R1-web.png') }}>
        <div className={css.scrim} />
        <div className={css.artInner}>
          <img
            className={css.artMark}
            src={asset('/uploads/logo-wordmark-alpha.png')}
            alt="LA Space Interiors"
            width="117"
            height="30"
          />

          <div className={css.artCopy}>
            <div className={css.artEyebrow}>Studio Admin</div>
            <p className={css.artHeadline}>
              Every enquiry, service and site — in <em>one place</em>
            </p>
          </div>

          <div className={css.artFoot}>Visakhapatnam · Interior Design &amp; Turnkey Execution</div>
        </div>
      </div>

      <div className={css.form}>
        <div className={css.card}>
          <img
            className={css.monogram}
            src={asset('/uploads/logo-monogram-alpha.png')}
            alt=""
            width="52"
            height="52"
          />

          <div className={css.eyebrow}>Studio Admin</div>
          <h1 className={css.title}>Sign in</h1>
          <p className={css.sub}>
            Enter your studio credentials to manage enquiries, services and projects.
          </p>

          <form className={css.fields} onSubmit={submit} noValidate>
            <label className={css.field}>
              <span className={css.label}>Email</span>
              <input
                className={css.input}
                type="email"
                value={email}
                onChange={(event) => onEmail(event.target.value)}
                placeholder="studio@laspaceinteriors.in"
                autoComplete="username"
              />
            </label>

            <div className={css.field}>
              <div className={css.labelRow}>
                <label className={css.label} htmlFor="admin-password">
                  Password
                </label>
                <button type="button" className={css.reveal} onClick={() => setReveal(!reveal)}>
                  {reveal ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                id="admin-password"
                className={css.secret}
                type={reveal ? 'text' : 'password'}
                value={password}
                onChange={(event) => onPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <div className={css.row}>
              <button
                type="button"
                className={css.remember}
                onClick={() => setRemember(!remember)}
                aria-pressed={remember}
              >
                <span className={css.box}>
                  <span className={remember ? css.tickOn : css.tick} />
                </span>
                Keep me signed in
              </button>

              <a className={css.forgot} href="/contact">
                Forgot password?
              </a>
            </div>

            {error && (
              <div className={css.error} role="alert">
                {error}
              </div>
            )}

            <button type="submit" className={css.submit} aria-busy={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className={css.foot}>
            <div className={css.footNote}>
              Access is limited to studio staff.
              <br />
              Contact the owner for an account.
            </div>
            <a className={css.viewSite} href="/">
              ← View site
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
