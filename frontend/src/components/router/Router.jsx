import { createBrowserRouter } from 'react-router-dom'
import Layout from '../layout/Layout'
import Reg from '../pages/Auth_Reg/Reg'
import Auth from '../pages/Auth_Reg/Auth'
import Post_list from '../pages/Post/Post_list'
import Post_detail from '../pages/Post/Post_detail'
import Profile from '../pages/Auth_Reg/Profile'

const router = createBrowserRouter([
    {
        path: '',
        element: <Layout/>,
        children: [
            {
                path: '/register',
                element: <Reg/>
            },
            {
                path: '/login',
                element: <Auth/>
            },
            {
                path: '/posts',
                element: <Post_list/>
            },
            {
                path: '/posts/:id',
                element: <Post_detail/>
            },
            {
                path: '/profile',
                element: <Profile/>
            }
        ]
    }
])

export default router