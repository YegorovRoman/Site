import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './auth_reg.css'

function Auth() {

    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)

    const login = async (e) => {
        e.preventDefault()
        const response = await fetch("https://romchik.pythonanywhere.com/api/login", {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        const data = await response.json()
        if (response.ok) {
            localStorage.setItem('token', data.data.token)
            localStorage.setItem('isStaff', data.data.is_staff)
            navigate('/posts')
        } else {
            setError(data.detail)
        }
    }

    return (
        <>
            <main className="auth_page">
                <div className="auth_container">
                    <div className="auth_header">
                        <h1>Авторизация</h1>
                        <p>Войдите в свой аккаунт</p>
                    </div>
                    <div className="register">
                        <form className="auth_form" onSubmit={login}>
                            <input type="email" placeholder="Почта" value={email} onChange={e => setEmail(e.target.value)}required/>
                            <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} required/>
                            <button type="submit">Авторизоваться</button>
                        </form>
                        {error && (
                            <p className="auth_error">{error}</p>
                        )}
                    </div>
                </div>
            </main>
        </>
    )
}

export default Auth