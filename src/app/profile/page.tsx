"use client";

import {useSession} from "next-auth/react";
import {useEffect, useState} from 'react';
import Link from 'next/link';


export default function Profil() {
    const {data: session, status} = useSession();

    const [userData, setUserData] = useState(null);
    useEffect(() => {
        if (session) {
            fetch(`/api/user?id=${session.userId}`)
                .then(response => response.json())
                .then(data => {
                    setUserData(data);
                });
        }
    }, [session]);

    if (status === "loading") {
        return <p>Chargement...</p>;
    }

    if (status === "authenticated") {
        return (
            <div className="profilePage">
                <h1>Profil de {session.user.name}</h1>
                <img src={session.user.image} alt={`Avatar de ${session.user.name}`}/>
                <p>Email: {session.user.email}</p>
                <p>Nom: {session.user.name}</p>
                {userData && (
                    <>
                        <p>Pseudo: {userData.pseudo}</p>
                        <p>Bio: {userData.bio}</p>
                    </>
                )}
                {userData && userData.outings && (
                    <>
                        <h2>Mes Sorties Organisées :</h2>
                        <ul className="sortiesList">
                            {userData.outings.map(outing => (
                                <li key={outing.id}>
                                    <Link href={`/outings/${outing.id}`}>
                                        <h3>{outing.eventName}</h3>
                                    </Link>
                                    <p>
                                        Organisateur :
                                        <Link href={`/users/${outing.organizer.pseudo}`}>
                                            {outing.organizer.pseudo}
                                        </Link>
                                    </p>
                                    <p>Visibilité : {outing.visibility}</p>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
                {userData && userData.outingsJoined && (
                    <>
                        <h2>Je Participe À :</h2>
                        <ul className="sortiesList">
                            {userData.outingsJoined
                                .filter(participant => !userData.outings.find(outing => outing.id === participant.outing.id))
                                .map(participant => (
                                    <li key={participant.outing.id}>
                                        <Link href={`/outings/${participant.outing.id}`}>
                                            <h3>{participant.outing.eventName}</h3>
                                        </Link>
                                        <p>
                                            Organisateur :
                                            <Link href={`/users/${participant.outing.organizer.pseudo}`}>
                                                {participant.outing.organizer.pseudo}
                                            </Link>
                                        </p>
                                        <p>Visibilité : {participant.outing.visibility}</p>
                                        <p>Rôle : {participant.role}</p>
                                    </li>
                                ))}
                        </ul>
                    </>
                )}
            </div>
        );
    }

    return <a href="/api/auth/signin">Sign in</a>;

}