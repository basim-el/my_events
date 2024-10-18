"use client"
import {useEffect, useState} from 'react';
import Link from 'next/link';

interface User {
    name: string;
    pseudo: string;
    avatar: string;
    bio: string;
}

interface APIState {
    isLoading: boolean;
    user: User | null;
    error: string | null;
}

function ProfilePage({params}: { params: { userPseudo: string } }) {

    const [apiState, setApiState] = useState<APIState>({
        isLoading: true,
        user: null,
        error: null,
    });

    useEffect(() => {
        if (params.userPseudo) {
            fetch(`http://localhost:3000/api/users/${params.userPseudo}`)
                .then(response => response.json())
                .then(user => {
                    setApiState({
                        isLoading: false,
                        user,
                        error: null,
                    });
                })
                .catch(error => {
                    setApiState({
                        isLoading: false,
                        user: null,
                        error: error.message,
                    });
                });
        }
    }, [params.userPseudo]);

    if (apiState.isLoading) {
        return <h1>Chargement...</h1>;
    }

    if (apiState.error) {
        return <h1>Erreur : {apiState.error}</h1>;
    }

    if (!apiState.user) {
        return <h1>Profil non trouvé.</h1>;
    }

    return (
        <div className="profilePage">
            <h1>Profil de {apiState.user.pseudo}</h1>
            <img src={apiState.user.avatar} alt={`Avatar de ${apiState.user.pseudo}`}/>
            <p>Bio: {apiState.user.bio}</p>

            {apiState.user.outings && apiState.user.outings.length > 0 && (
                <div>
                    <h2>Sorties organisées :</h2>
                    <ul>
                        {apiState.user.outings.map(outing => (
                            <li key={outing.id}>
                                <Link href={`/outings/${outing.id}`}>
                                    {outing.eventName} - Organisé par : {outing.organizer.pseudo}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {apiState.user.outingsJoined && apiState.user.outingsJoined.length > 0 && (
                <div>
                    <h2>Sorties rejointes :</h2>
                    <ul>
                        {apiState.user.outingsJoined
                            .filter(outingJoined => !apiState.user.outings.find(outing => outing.id === outingJoined.outing.id))
                            .map(outingJoined => (
                                <li key={outingJoined.outing.id}>
                                    <Link href={`/outings/${outingJoined.outing.id}`}>
                                        {outingJoined.outing.eventName} - Organisé par
                                        : {outingJoined.outing.organizer.pseudo}
                                    </Link>
                                </li>
                            ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;