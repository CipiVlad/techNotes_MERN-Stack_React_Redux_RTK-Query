import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { store } from '../../app/store'
import { notesApiSlice } from '../notes/notesApiSlice'
import { usersApiSlice } from '../users/usersApiSlice'


const Prefetch = () => {
    useEffect(() => {
        //prefetch(pass argument: getNotes, pass subscribtion: notesList, force: forces query)
        store.dispatch(notesApiSlice.util.prefetch('getNotes', 'notesList', { force: true }))
        store.dispatch(usersApiSlice.util.prefetch('getUsers', 'usersList', { force: true }))
    }, []) // empty dependency, only run when Component mounts!

    return <Outlet />
    //pass protection to children, 
    //and keep state when refreshing page (for example state inside input fields)

}

export default Prefetch