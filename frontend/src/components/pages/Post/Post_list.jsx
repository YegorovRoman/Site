import React, { useEffect, useState } from 'react'
import Post_cart from './Post_cart'
import girl from '../../../assets/girl.jpg'
import angel from '../../../assets/angel.jpg'
import angel2 from '../../../assets/angel2.jpg'
import { useLocation } from 'react-router-dom'
function Post_list() {

    const [posts, setPosts] = useState([])
    const [error, setError] = useState(null)

    const location = useLocation()
    const params = new URLSearchParams(location.search)
    const searchQuery = params.get('search')?.toLowerCase() || ''


    const slides = [
        {
            image: girl,
            title: "Невероятный дизайн",
            text: "Современный premium dark интерфейс с плавными анимациями."
        },

        {
            image: angel,
            title: "Минимализм",
            text: "Чистый стиль, стеклянные эффекты и идеальная типографика."
        },

        {
            image: angel2,
            title: "Future UI",
            text: "Интерфейс нового поколения в стиле premium web apps."
        }
    ];

    const [current, setCurrent] = useState(0);

    const nextSlide = () => {
        setCurrent((prev) =>
            prev === slides.length - 1 ? 0 : prev + 1
        );
    };

    const prevSlide = () => {
        setCurrent((prev) =>
            prev === 0 ? slides.length - 1 : prev - 1
        );
    };

    const allData = async (e) => {
        const response = await fetch('https://romchik.pythonanywhere.com/api/posts', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        const data = await response.json()
        if (response.ok) {
            console.log(data.data);

            setPosts(data.data)
        } else {
            setError(data.detail)
        }
    }

    useEffect(() => {
        allData()
    }, [])

    const filteredPosts = posts.filter(post =>
        post.name.toLowerCase().includes(searchQuery)
    );

    return (
        <>
            {error && <p>{error}</p>}

            <div className="slider">

                <div className="slides" style={{ transform: `translateX(-${current * 100}%)` }} >
                    {slides.map((slide, index) => (
                        <div className="slide" key={index}>
                            <img src={slide.image} alt={slide.title} />
                            <div className="slide_content">
                                <div className="slide_tag">PREMIUM POST</div>
                                <h1>{slide.title}</h1>
                                <p>{slide.text}</p>
                                <div className="slide_buttons">
                                    <button>Смотреть</button>
                                    <button>Подробнее</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="slider_nav">
                    <button onClick={prevSlide}>‹</button>
                    <button onClick={nextSlide}>›</button>
                </div>
                <div className="slider_dots">
                    {slides.map((_, index) => (
                        <span key={index} className={current === index ? "active" : ""} onClick={() => setCurrent(index)}></span>
                    ))}
                </div>

            </div>
            <div className="carts">
                {filteredPosts.length > 0 ? (
                    filteredPosts.map(post => (
                        <Post_cart post={post} key={post.id} setPosts={setPosts} />
                    ))
                ) : (
                    <p style={{ color: '#999', textAlign: 'center', marginTop: '20px' }}>
                        Посты не найдены
                    </p>
                )}
            </div>
        </>
    )
}

export default Post_list