import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './auth_reg.css'

function Reg() {

    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [first_name, setFirst_name] = useState('')
    const [last_name, setLast_name] = useState('')
    const [facePhoto, setFacePhoto] = useState(null)
    const [error, setError] = useState(null)

    const register = async (e) => {
        e.preventDefault()

        const formData = new FormData()

        formData.append('email', email)
        formData.append('password', password)
        formData.append('first_name', first_name)
        formData.append('last_name', last_name)
        formData.append('face_photo', facePhoto)
        const response = await fetch('http://127.0.0.1:8000/api/register', {
            method: 'POST',
            body: formData
        })

        const data = await response.json()

        if (response.ok) {
            alert('Заявка на регистрацию успешно отправлена! Ждите подтверждения заявки и тогда вы сможете авторизоваться)')
        } else {
            setError(data.detail)
        }
    }

    return (
        <>
            <main className="auth_page">
                <div className="auth_container">
                    <div className="auth_header">
                        <h1>Регистрация</h1>
                        <p>Создайте новый аккаунт</p>
                    </div>
                    <div className="register">
                        <form className="auth_form" onSubmit={register}>
                            <input type="email" placeholder="Почта" value={email} onChange={e => setEmail(e.target.value)} required/>
                            <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} required/>
                            <input type="text" placeholder="Имя" value={first_name} onChange={e => setFirst_name(e.target.value)} required/>
                            <input type="text" placeholder="Фамилия" value={last_name} onChange={e => setLast_name(e.target.value)} required/>
                            <input type="file" accept="image/*" onChange={e => setFacePhoto(e.target.files[0])}required/>
                            <button type="submit">Зарегистрироваться</button>
                        </form>
                        {error && (<p className="auth_error">{error}</p>)}
                    </div>
                </div>
            </main>
        </>
    )
}

export default Reg