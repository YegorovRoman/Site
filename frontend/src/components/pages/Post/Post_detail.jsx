import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Review_cart from './Review_cart'

function Post_detail() {

    const navigate = useNavigate()
    const { id } = useParams()
    const [post, setPost] = useState('')
    const [error, setError] = useState(null)
    const [load, setLoad] = useState(true)
    const [form, setForm] = useState(false)
    const [name, setName] = useState('')
    const [text, setText] = useState('')
    const [img, setImg] = useState(null)
    const [video, setVideo] = useState('')
    const [reviews, setReviews] = useState([])
    const [rating, setRating] = useState(0)


    // <-------------------------Work with the Post-------------------------->


    const dataParam = async (e) => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            }
        })
        const data = await response.json()
        if (response.ok) {
            setPost(data)
            setLoad(false)
        } else {
            setError(data.detail)
        }
    }


    const oneDelete = async (e) => {
        e.preventDefault()
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        if (response.ok) {
            navigate('/posts')
        } else {
            const data = await response.json()
            setError(data.detail)
        }
    }

    const oneUpdate = async (e) => {
        e.preventDefault()
        const formData = new FormData()
        if (name && name !== post.data.name) {
            formData.append('name', name)
        }
        if (text && text !== post.data.text) {
            formData.append('text', text)
        }
        if (img && img instanceof File) {
            formData.append('img', img)
        }
        if (video && video !== post.data.video) {
            formData.append('video', video)
        }
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        })
        const data = await response.json()
        if (response.ok) {
            setPost(prev => ({ ...prev, data: { ...prev.data, ...data.data } }))
            setName('')
            setText('')
            setImg(null)
            setVideo('')
            setForm(false)  // Закрываем форму редактирования
            setError(null)
            alert('Пост успешно обновлен!')
        } else {
            setError(data.detail)
        }
    }


    // <--------------------------Work with the model Review------------------->


    const allDataReviews = async () => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        const data = await response.json()
        if (response.ok) {
            setReviews(data.data)
        } else {
            setError(data.detail)
        }
    }

    const oneCreateReview = async (e) => {
        e.preventDefault()
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${id}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-type': 'application/json'
            },
            body: JSON.stringify({ text, rating })
        })
        const data = await response.json()
        if (response.ok) {
            setReviews((prev) => [...prev, data.data])
            setText('')
            setRating('')
            alert('Комментарий успешно отправлен!')
        } else {
            setError(data.detail)
        }
    }

    useEffect(() => {
        dataParam(), allDataReviews()
    }, [])

    if (load) {
        return <p>...Загрузка...</p>
    }

    return (
        <>
            <div className="cart_detail">
                <h1>{post.data.name}</h1>
                <p>{post.data.text}</p>
                {post.data.img &&
                    <img src={post.data.img} alt={post.data.name} />
                }
                {post.data.video && (
                    <div className="video-container">
                        {post.data.video.includes('youtube.com') || post.data.video.includes('youtu.be') ? (
                            <iframe src={`https://www.youtube.com/embed/${getYouTubeId(post.data.video)}`} title="YouTube video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                        ) : (
                            <video controls src={post.data.video.startsWith('http') ? post.data.video : `${import.meta.env.VITE_API_URL}` + post.data.video}> Ваш браузер не поддерживает видео</video>
                        )}
                    </div>
                )}
                <p>{post.data.created_at}</p>
                <p>Кол-во комментариев: {post.reviews_count}</p>
                <p>Средняя оценка: {post.rating}</p>
                <button onClick={oneDelete}>Удалить</button>
                <button onClick={() => setForm((prev) => !prev)}>Изменить</button>
                {form &&
                    <form onSubmit={oneUpdate}>
                        <input type="text" placeholder='Название' value={name} onChange={e => setName(e.target.value)} />
                        <input type="text" placeholder='Текст' value={text} onChange={e => setText(e.target.value)} />
                        <input type="file" onChange={e => setImg(e.target.files[0])} />
                        <input type="text" placeholder='URL Видео' value={video} onChange={e => setVideo(e.target.value)} />
                        <button type='submit'>Сохранить</button>
                    </form>
                }
                {error && <p>{error}</p>}

                <p>Написать комментарий</p>

                <form onSubmit={oneCreateReview}>
                    <input type="text" placeholder='Текст' value={text} onChange={e => setText(e.target.value)} required />
                    <div className="rating-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                className={star <= rating ? 'star active' : 'star'}
                                onClick={() => setRating(star)}
                            >
                                ★
                            </span>
                        ))}

                    </div>
                    <button type='submit'>Отправить</button>
                </form>

                <div className="reviews">
                    {reviews.map((review) => (
                        <Review_cart review={review} setReviews={setReviews} key={review.id} />
                    ))}
                </div>

            </div>
        </>
    )
}

function getYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export default Post_detail