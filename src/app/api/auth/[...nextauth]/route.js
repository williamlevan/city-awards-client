import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            async authorize(credentials) {
                try {
                    console.log(process.env.NEXT_PUBLIC_SERVER_URL);
                    const { data } = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/login`, {
                        email: credentials.email
                    });
            
                    console.log("API Response from login:", data); // Add this
            
                    if (data?.accessToken && data?.refreshToken) {
                        const decodedToken = jwtDecode(data.accessToken);
                        return {
                            id: data.user.id,
                            email: data.user.email,
                            accessToken: data.accessToken,
                            refreshToken: data.refreshToken,
                            accessTokenExpires: decodedToken.exp * 1000, // Store expiration time
                        };
                    }
                    return null;
                } catch (err) {
                    console.error("Error in authorize():", err?.response?.data || err.message);
                    throw new Error("Invalid credentials");
                }
            }
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: 60 * 60, // Session lasts 1 hour
        updateAge: 30 * 60, // Attempt refresh every 30 minutes
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                return {
                    id: user.id,
                    email: user.email,
                    accessToken: user.accessToken,
                    accessTokenExpires: user.accessTokenExpires,
                    refreshToken: user.refreshToken, // Store refresh token
                };
            }
        
            // Check if access token expired
            if (Date.now() > token.accessTokenExpires) {
                console.log("Access token expired. Attempting refresh...");
                try {
                    const { data } = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/refresh`, {
                        token: token.refreshToken // Use refresh token for renewal
                    });
        
                    return {
                        ...token,
                        accessToken: data.token,
                        refreshToken: data.refreshToken,
                        accessTokenExpires: jwtDecode(data.token).exp * 1000, // Update expiration
                    };
                } catch (error) {
                    console.error("Token refresh failed:", error);
                    return { ...token, accessToken: null }; // Invalidate session
                }
            }
        
            return token;
        },        
        async session({ session, token }) {
            session.user = {
                id: token.id,
                email: token.email
            };
            session.accessToken = token.accessToken;
            session.refreshToken = token.refreshToken;
            return session;
        }
    },
    pages: {
        signIn: '/',
        signOut: '/'
    },
    secret: process.env.NEXTAUTH_SECRET
});

export { handler as GET, handler as POST };
