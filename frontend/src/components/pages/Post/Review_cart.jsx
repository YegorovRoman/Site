import React from 'react'

function Review_cart({review, setReviews}) {
  return (
    <>
    <div className="review">
        <img src={'https://romchik.pythonanywhere.com/' + review.user_avatar}/>
        <p>{review.user_name}</p>
        <p>{review.text}</p>
        <p>{review.rating}</p>
    </div>
    </>
  )
}

export default Review_cart