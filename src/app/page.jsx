'use client'; // Use client-side code for forms & hooks
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { registerUser } from '@/lib/api';
import Header from '../components/header';


export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('home');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await signIn('credentials', {
      email,
      redirect: false
      // callbackUrl: '/home'
    });

    console.log("Login result:", result); // Debugging response

    if (result.error) {
      console.error("Login failed:", result.error);
      alert("Login failed: " + result.error); // Show error to the user
    } else {
      router.push("/home"); // Redirect to home after successful login
    }
  };

  return (
    <main className='landing'>
      <Header />
      <div className="landing-content">
          <div className="login">
            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Enter Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button className="login-button" type="submit">CONTINUE</button>
            </form>
          </div>
      </div>
    </main>
  );
}