'use client';

import { signOut } from "next-auth/react";

export default function Header() {

    const clickLogout = () => {
        console.log("Logging out...");
        signOut({ callbackUrl: '/' });
    }

    return (
        <div className="header">
            <div className="header-left">
                <div className="img-container">
                    <img src="/video-vintage.svg" alt="Film Camera" />
                </div>
                <h3>2025 CITY Oscars Competition</h3>
            </div>
            <div className="header-right">
                <button onClick={clickLogout}>LOGOUT</button>
            </div>
        </div>
    )
}