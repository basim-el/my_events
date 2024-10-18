"use client"
import {useEffect, useState} from 'react';
import Link from 'next/link';


interface User {
    id: string;
    pseudo: string;
    name: string;
    avatar: string;
}

interface APIState {
    isLoading: boolean;
    users: User[] | null;
    error: string | null;
}

const UsersPage: React.FC = () => {
    const [apiState, setApiState] = useState<APIState>({
        isLoading: true,
        users: null,
        error: null,
    });

    useEffect(() => {
        fetch('http://localhost:3000/api/users')
            .then(response => response.json())
            .then(users => {
                setApiState({
                    isLoading: false,
                    users,
                    error: null,
                });
            })
            .catch(error => {
                setApiState({
                    isLoading: false,
                    users: null,
                    error: error.message,
                });
            });
    }, []);

    if (apiState.isLoading) {
        return <h1>Chargement...</h1>;
    }

    if (apiState.error) {
        return <h1>Erreur : {apiState.error}</h1>;
    }

    return (
        <div className="usersPage">
            <h1>Liste des utilisateurs</h1>
            {Array.isArray(apiState.users) && apiState.users.length > 0 ? (
                apiState.users.map(user => (
                    <div key={user.pseudo} className="userCard">
                        <h2>
                            <Link href={`/users/${user.pseudo}`}>{user.pseudo}</Link>
                        </h2>
                        <img src={user.avatar} alt={`Avatar de ${user.pseudo}`}/>
                    </div>
                ))
            ) : (
                <p>Aucun utilisateur trouvé.</p>
            )}
        </div>
    );
};

export default UsersPage;
