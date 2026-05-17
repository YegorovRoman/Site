import React, { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './post_cart.css'

function Post_cart({ post }) {

  const navigate = useNavigate()
  const videoRef = useRef(null)

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play()
    }
  }

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  return (
    <div
      className="cart"
      onClick={() => navigate('/posts/' + post.id)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >

      {post.img && (
        <img
          src={post.img}
          alt={post.name}
        />
      )}

      {post.video && (
        <div className="video-container">

          {post.video.includes('youtube.com') || post.video.includes('youtu.be') ? (

            <img
              className="youtube-preview"
              src={`https://img.youtube.com/vi/${getYouTubeId(post.video)}/maxresdefault.jpg`}
              alt="preview"
            />

          ) : (

            <video
              ref={videoRef}
              muted
              loop
              playsInline
              preload="metadata"
              src={
                post.video.startsWith('http')
                  ? post.video
                  : 'https://romchik.pythonanywhere.com/' + post.video
              }
            >
              Ваш браузер не поддерживает видео
            </video>

          )}

        </div>
      )}

      <div className="post_user">
        <img
          src={post.user_avatar}
          alt=""
        />

        <p>{post.user_name}</p>
      </div>

      <h1>{post.name}</h1>
    </div>
  )
}

function getYouTubeId(url) {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/

  const match = url.match(regExp)

  return (match && match[2].length === 11)
    ? match[2]
    : null
}

export default Post_cart