"use client";
import {useEffect, useState} from 'react';
import {useSession} from "next-auth/react";
import Link from 'next/link';

interface Outing {
    id: number;
    openAgendaEventId: string;
    eventName: string;
    visibility: string;
    organizer: {
        pseudo: string;
    };
    Participant: {
        user: {
            pseudo: string;
            avatar: string;
        };
        role: string;
    }[];
}

const OutingsPage: React.FC = () => {
    const [outings, setOutings] = useState<Outing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const {data: session} = useSession();

    useEffect(() => {
        fetch('/api/outings')
            .then(response => response.json())
            .then(data => {
                setOutings(data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des sorties:", error);
                setIsLoading(false);
            });
    }, []);

    if (isLoading) {
        return <h1>Chargement...</h1>;
    }

    const relevantOutings = outings.filter(outing => {
        if (outing.visibility === 'public') return true;
        if (outing.organizerId === session?.userId) return true;
        const isParticipant = outing.Participant.some(participant => participant.userId === session?.userId);
        return isParticipant;
    });


    return (
        <div className="outingsPage"><h1>Liste des sorties: </h1>
            {relevantOutings.map(outing => (
                <div key={outing.id}>
                    <h2>
                        <Link href={`/outings/${outing.id}`}>
                            {outing.eventName}
                        </Link>
                    </h2>
                    <p>Organisateur: {outing.organizer.pseudo}</p>
                    <p>Visibilité: {outing.visibility}</p>

                    <h3>Participants :</h3>
                    <ul>
                        {outing.Participant.map(participant => (
                            <li key={participant.user.pseudo}>
                                <Link href={`/users/${participant.user.pseudo}`}>
                                    {participant.user.pseudo} ({participant.role})
                                    <img src={participant.user.avatar} alt={`${participant.user.pseudo}'s avatar`}/>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default OutingsPage;