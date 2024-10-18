import React from "react";
import SigninButton from "./SigninButton";
import Link from "next/link";

const Appbar = () => {
    return (
        <header>
            <SigninButton/>
            <Link href={`/events`}>Accueil</Link>
            <Link href={`/profile`}>Profil</Link>
            <Link href={`/outings`}>Sorties</Link>
            <Link href={`/users`}>Utilisateurs</Link>
        </header>
    );
};

export default Appbar;