"use client";
import {useEffect, useState} from 'react';
import {useSession} from 'next-auth/react';
import Select from 'react-select';
import {toast} from "react-toastify";


interface OutingDetails {
    id: number;
    openAgendaEventId: string;
    eventName: string;
    visibility: string;
    organizer: {
        id: string;
        pseudo: string;
    };
    Participant: {
        user: {
            id: string;
            pseudo: string;
            avatar: string;
        };
        role: string;
    }[];
    messages: {
        id: number;
        message: string;
        timestamp: string;
        user: {
            pseudo: string;
            avatar: string;
            name: string;
        };
    }[];
}

function OutingDetailsPage({params}: { params: { outingId: string } }) {
    const [outingDetails, setOutingDetails] = useState<OutingDetails | null>(null);
    const [newMessage, setNewMessage] = useState<string>('');
    const {data: session, status} = useSession();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [friendsList, setFriendsList] = useState<any[]>([]);
    const [selectedFriends, setSelectedFriends] = useState<any[]>([]);


    const handleJoinOuting = async () => {
        if (!session) {
            toast.info("Veuillez vous connecter pour rejoindre une sortie.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/outings/${params.outingId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: session.userId
                }),
            });

            const result = await response.json();
            if (response.ok) {
                toast.success('Vous avez rejoint cette sortie !');
                setOutingDetails(prevState => {
                    if (prevState) {
                        return {
                            ...prevState,
                            Participant: [...prevState.Participant, {
                                user: {
                                    id: session.userId,
                                    pseudo: session.user.name,
                                    avatar: session.user.image
                                }, role: 'guest'
                            }]
                        };
                    }
                    return prevState;
                });

            } else {
                toast.error('Erreur lors de la jointure : ' + (result.error || 'Erreur inconnue'));
            }
        } catch (error) {
            toast.error('Erreur lors de la jointure : ' + error.message);
        }
    };

    useEffect(() => {
        if (params.outingId && session?.userId) {
            fetch(`http://localhost:3000/api/outings/${params.outingId}?userId=${session.userId}`)
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(data => Promise.reject(data));
                    }
                    return response.json();
                })
                .then(data => {
                    setOutingDetails(data);
                })
                .catch(error => {
                    console.error("Erreur lors de la récupération des détails de la sortie:", error);
                    if (error.error) {
                        setErrorMessage(error.error);
                    } else {
                        setErrorMessage('Une erreur est survenue lors de la récupération des détails de la sortie.');
                    }
                });
        }
    }, [params.outingId, session?.userId]);

    useEffect(() => {
        const loadFriendsList = async () => {
            try {
                const response = await fetch('/api/users');
                const data = await response.json();
                const filteredData = data.filter((user: any) => user.id !== session?.userId);
                setFriendsList(filteredData.map((user: any) => ({value: user.id, label: user.pseudo})));
            } catch (error) {
                console.error('Error loading friends list:', error);
            }
        };

        loadFriendsList();
    }, [session?.userId]);


    if (status === "loading") {
        return <p>Chargement...</p>;
    }

    if (status !== "authenticated") {
        return <a href="/api/auth/signin">Se connecter</a>;
    }

    if (errorMessage) {
        return <h1>{errorMessage}</h1>;
    }

    if (!outingDetails) {
        return <h1>Chargement...</h1>;
    }

    const handlePostMessage = async () => {
        if (!session) {
            toast.info("Veuillez vous connecter pour poster un message.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/outings/${params.outingId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: session.userId,
                    message: newMessage,
                }),
            });

            const result = await response.json();
            if (response.ok) {
                setOutingDetails(prevState => {
                    if (prevState) {
                        return {
                            ...prevState,
                            messages: [...prevState.messages, result],
                        };
                    }
                    return prevState;
                });
                setNewMessage('');
            } else {
                toast.error('Erreur lors de l’envoi du message : ' + (result.error || 'Erreur inconnue'));
            }
        } catch (error) {
            toast.error('Erreur lors de l’envoi du message : ' + error.message);
        }
    };

    const handleDeleteOuting = async () => {
        if (!session) {
            toast.error("Veuillez vous connecter pour supprimer une sortie.");
            return;
        }

        const confirmation = window.confirm("Êtes-vous sûr de vouloir supprimer cette sortie ?");
        if (!confirmation) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/outings/${params.outingId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: session.userId,
                }),
            });

            if (response.ok) {
                toast.success('La sortie a été supprimée avec succès.');
                window.location.href = '/';
            } else {
                const result = await response.json();
                toast.error('Erreur lors de la suppression de la sortie : ' + (result.error || 'Erreur inconnue'));
            }
        } catch (error) {
            toast.error('Erreur lors de la suppression de la sortie : ' + error.message);
        }
    };

    const handleLeaveOuting = async () => {
        if (!session) {
            toast.info("Veuillez vous connecter pour quitter une sortie.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/outings/${params.outingId}/participants`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: session.userId
                }),
            });

            const result = await response.json();
            if (response.ok) {
                toast.success('Vous avez quitté cette sortie !');
                setOutingDetails(prevState => {
                    if (prevState) {
                        return {
                            ...prevState,
                            Participant: prevState.Participant.filter(p => p.user.id !== session?.userId)
                        };
                    }
                    return prevState;
                });
            } else {
                toast.error('Erreur lors de la tentative de quitter la sortie : ' + (result.error || 'Erreur inconnue'));
            }
        } catch (error) {
            toast.error('Erreur lors de la tentative de quitter la sortie : ' + error.message);
        }
    };

    const handleInviteFriends = async (e: any) => {
        e.preventDefault();
        if (!session) {
            toast.info('Veuillez vous connecter pour inviter des amis.');
            return;
        }

        try {
            // Obtenez les IDs des participants actuels
            const currentParticipantIds = outingDetails?.Participant.map(p => p.user.id) || [];

            // Filtrez les amis sélectionnés pour exclure ceux qui sont déjà participants
            const friendsToInvite = selectedFriends.filter(friend => !currentParticipantIds.includes(friend.value));

            // Si aucun nouvel ami à inviter, retournez tôt
            if (friendsToInvite.length === 0) {
                toast.info('Tous les amis sélectionnés sont déjà participants.');
                return;
            }

            // Étape 1: Récupérez les détails des utilisateurs (y compris les URLs d'avatar) depuis l'API
            const friendDetailsPromises = friendsToInvite.map(friend =>
                fetch(`/api/users/${encodeURIComponent(friend.label)}`)
                    .then(response => response.json())
            );
            const friendDetails = await Promise.all(friendDetailsPromises);

            // Étape 2: Utilisez les détails récupérés pour créer les nouveaux objets participants
            const newParticipants = friendDetails.map((details, index) => ({
                user: {
                    id: friendsToInvite[index].value,
                    pseudo: friendsToInvite[index].label,
                    avatar: details.avatar // Utilisez l'URL d'avatar depuis la réponse de l'API
                },
                role: "guest"
            }));

            // Étape 3: Envoyez les IDs des utilisateurs à l'API pour les ajouter en tant que participants
            const response = await fetch(`/api/outings/${params.outingId}/participants`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userIds: friendsToInvite.map(friend => friend.value),
                }),
            });

            const result = await response.json();
            if (response.ok) {
                toast.success('Les amis ont été invités avec succès !');
                // Mettez à jour l'état outingDetails ici pour inclure les nouveaux participants
                setOutingDetails(prevState => {
                    if (prevState) {
                        return {
                            ...prevState,
                            Participant: [...prevState.Participant, ...newParticipants]
                        };
                    }
                    return prevState;
                });
            } else {
                toast.error('Erreur lors de l’invitation des amis : ' + (result.error || 'Erreur inconnue'));
            }
        } catch (error) {
            toast.error('Erreur lors de l’invitation des amis : ' + error.message);
        }
    };


    return (
        <div className="outing-details-container">
            <h1 className="outing-title">{outingDetails.eventName}</h1>
            {outingDetails.organizer.id === session?.userId && (
                <button className="action-button" onClick={handleDeleteOuting}>Supprimer</button>
            )}
            {
                outingDetails && outingDetails.organizer.id !== session?.userId && outingDetails.Participant.some(p => p.user.id === session?.userId) && (
                    <button className="leave-button" onClick={handleLeaveOuting}>Quitter</button>
                )
            }
            {
                outingDetails && outingDetails.organizer.id !== session?.userId && !outingDetails.Participant.some(p => p.user.id === session?.userId) && (
                    <button className="join-button" onClick={handleJoinOuting}>Rejoindre</button>
                )
            }


            <p className="organizer-info">Organisé par : {outingDetails.organizer.pseudo}</p>
            <p className="visibility-info">Visibilité : {outingDetails.visibility}</p>

            <h2>Participants :</h2>
            <ul className="participant-list">
                {outingDetails.Participant.map(participant => (
                    <li key={participant.user.pseudo}>
                        {participant.user.pseudo} ({participant.role})
                        <img src={participant.user.avatar} alt={`${participant.user.pseudo}'s avatar`}/>
                    </li>
                ))}
            </ul>

            <h2>Messages :</h2>
            <ul className="message-list">
                {outingDetails.messages.map(message => (
                    <li key={message.id}>
                        <p>{message.user ? `${message.user.pseudo} : ${message.message}` : 'Loading...'}</p>
                        <p>{new Date(message.timestamp).toLocaleString()}</p>
                    </li>
                ))}
            </ul>

            <div>
                <input
                    className="new-message-input"
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Écrivez votre message ici"
                />
                <button className="action-button" onClick={handlePostMessage}>Envoyer</button>
            </div>
            {outingDetails.organizer.id === session?.userId && (
                <div className="invite-section">
                    <h2>Inviter des amis :</h2>
                    <form onSubmit={handleInviteFriends}>
                        <Select
                            isMulti
                            name="friends"
                            options={friendsList}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            onChange={setSelectedFriends}
                            styles={{
                                menu: (provided) => ({...provided, color: 'black'}),
                                option: (provided) => ({...provided, color: 'black'})
                            }}
                        />
                        <button className="invite-button" type="submit">Inviter</button>
                    </form>
                </div>
            )}

        </div>
    );
};

export default OutingDetailsPage;
