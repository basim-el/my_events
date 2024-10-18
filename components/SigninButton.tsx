"use client";
import React from "react";
import {signIn, signOut, useSession} from "next-auth/react";

const SigninButton = () => {
    const {data: session} = useSession();

    if (session && session.user) {
        return (
            <div className="signin-button-container">
                <p>{session.user.name} </p>
                <button onClick={() => signOut()} className="signout-btn">
                    Se Déconnecter
                </button>
            </div>
        );
    }
    return (
        <button onClick={() => signIn()} className="signin-button">
            Se Connecter
        </button>
    );
};

export default SigninButton;
