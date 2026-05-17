import React, { useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import logo from '../../assets/лого.png'
import lupa from '../../assets/lupa.png'
import './layout.css'

function Layout() {

    const navigate = useNavigate()
    const token = localStorage.getItem('token')
    const [search, setSearch] = useState('')


    const handleSearch = (e) => {
        e.preventDefault()
        if (search.trim() !== '') {
            // Передаем поисковый запрос через query параметр
            navigate(`/posts?search=${encodeURIComponent(search)}`)
            setSearch('') // очищаем инпут после отправки
        }
    }

    return (
        <>
            <nav>
                <img src={logo} alt="Logo" onClick={() => navigate('/posts')} />
                {token &&
                    <>
                        {/* Поиск */}
                        <form onSubmit={handleSearch}>
                            <input type="text" placeholder="Поиск" value={search} onChange={(e) => setSearch(e.target.value)}/>
                        </form>
                        <Link to={'/posts'}>Посты</Link>
                        <Link to={'/profile'}>Профиль</Link>
                    </>
                }
                {!token &&
                    <>
                        <Link to={'/login'}>Авторизация</Link>
                        <Link to={'/register'}>Регистрация</Link>
                    </>
                }
            </nav>
            <main>
                <Outlet />
            </main>
        </>
    )
}

export default Layout