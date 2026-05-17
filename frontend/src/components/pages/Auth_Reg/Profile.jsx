import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './profile.css'

function Profile() {

    const [profile, setProfile] = useState('')
    const [error, setError] = useState(null)
    const [avatar, setAvatar] = useState(null)
    const [first_name, setFirst_name] = useState('')
    const [last_name, setLast_name] = useState('')
    const [form, setForm] = useState(false)
    const [name, setName] = useState('')
    const [text, setText] = useState('')
    const [img, setImg] = useState(null)
    const [video, setVideo] = useState('')
    const navigate = useNavigate()
    const [requests, setRequests] = useState([])

    const dataProfile = async () => {
        const response = await fetch('https://romchik.pythonanywhere.com/api/profile', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        const data = await response.json()
        if (response.ok) {
            setProfile(data.data)
        } else {
            setError(data.detail)
        }
    }

    const updateProfile = async (e) => {
        e.preventDefault()
        const formData = new FormData()
        if (avatar) {
            formData.append('avatar', avatar)
        }
        if (first_name) {
            formData.append('first_name', first_name)
        }
        if (last_name) {
            formData.append('last_name', last_name)
        }
        const response = await fetch(`https://romchik.pythonanywhere.com/api/profile`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        })
        const data = await response.json()
        if (response.ok) {
            setProfile(data.data)
            setAvatar(null)
            setFirst_name('')
            setLast_name('')
            setForm(false)
        } else {
            setError(data.detail)
        }
    }

    const create = async (e) => {
        e.preventDefault()
        const formData = new FormData()
        formData.append('name', name)
        formData.append('text', text)
        if (img) {
            formData.append('img', img)
        }
        if (video) {
            formData.append('video', video)
        }
        const response = await fetch('https://romchik.pythonanywhere.com/api/posts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: formData
        })
        const data = await response.json()
        if (response.ok) {
            setName('')
            setText('')
            setImg(null)
            setVideo('')
            alert('Пост успешно создан!')
        } else {
            setError(data.detail)
        }
    }

    const deleteProfile = async () => {
        const response = await fetch(`https://romchik.pythonanywhere.com/api/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            }
        })
        if (response.ok) {
            localStorage.removeItem('token')
            localStorage.removeItem('isStaff')
            navigate('/register')
        } else {
            const data = await response.json()
            setError(data.detail)
        }
    }

    const getRequests = async () => {

        const response = await fetch('https://romchik.pythonanywhere.com/api/registration-request', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        const data = await response.json()
        if (response.ok) {
            setRequests(data.data)
        } else {
            setError(data.detail)
        }
    }

    const approveRequest = async (id) => {
        const response = await fetch(`https://romchik.pythonanywhere.com/api/approve-registration/${id}`, {
            method: 'POST',
            headers: {
                'Authorization':
                    `Bearer ${localStorage.getItem('token')}`
            }
        })
        if (response.ok) {
            getRequests()
        }
    }

    const rejectRequest = async (id) => {
        const response = await fetch(`https://romchik.pythonanywhere.com/api/reject-registration/${id}`, {
            method: 'POST',
            headers: {
                'Authorization':
                    `Bearer ${localStorage.getItem('token')}`
            }
        }
        )
        if (response.ok) {
            getRequests()
        }
    }

    useEffect(() => {
        dataProfile()
        if (localStorage.getItem('isStaff') === 'true') {
            getRequests()
        }
    }, [])

    return (
        <div className="profile_page">
            <div className="profile">
                <img src={'https://romchik.pythonanywhere.com/' + profile.avatar} alt={profile.first_name} />
                <h1>{profile.first_name} {profile.last_name}</h1>
                <p>{profile.email}</p>
                <button onClick={() => setForm((prev) => !prev)}>Редактировать</button>
                <button onClick={deleteProfile}>ВЫЙТИ ИЗ АККАУНТА</button>

                {form &&
                    <form onSubmit={updateProfile}>
                        <input type="file" onChange={e => setAvatar(e.target.files[0])} />
                        <input type="text" placeholder='Имя' value={first_name} onChange={e => setFirst_name(e.target.value)} />
                        <input type="text" placeholder='Фамилия' value={last_name} onChange={e => setLast_name(e.target.value)} />
                        <button type='submit'>Сохранить</button>
                    </form>
                }
                {error && <p>{error}</p>}
            </div>
            <div className="create">
                <p>Создание поста</p>
                <form onSubmit={create}>
                    <input type="text" placeholder='Название' value={name} onChange={e => setName(e.target.value)} required />
                    <textarea placeholder='Текст' value={text} onChange={e => setText(e.target.value)} required />
                    <label>Видео и изображение не обязательно</label>
                    <input type="file" onChange={e => setImg(e.target.files[0])} />
                    <input type="text" placeholder='URL Видео' value={video} onChange={e => setVideo(e.target.value)} />
                    <button type='submit'>Создать</button>
                </form>
            </div>
            {
                localStorage.getItem('isStaff') === 'true' && (
                    <div className="admin_requests">
                        <h2>Заявки на регистрацию</h2>
                        {
                            requests.map(item => (
                                <div className="request_card" key={item.id}>
                                    <img src={'https://romchik.pythonanywhere.com/' + item.face_photo} alt=""/>
                                    <div className="request_card_info">
                                        <h3>{item.first_name} {item.last_name}</h3>
                                        <p>{item.email}</p>
                                    </div>
                                    <div className="request_actions">
                                        <button onClick={() => approveRequest(item.id)}>Принять</button>
                                        <button onClick={() => rejectRequest(item.id)}>Отклонить</button>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                )
            }
        </div>
    )
}

export default Profile