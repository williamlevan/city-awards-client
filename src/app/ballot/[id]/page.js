'use client';

import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function BallotDetailPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [ballot, setBallot] = useState(null);

  useEffect(() => {
    if (!session) return;
    // Fetch ballot data
    axios.get(`http://localhost:5000/api/ballots/${id}`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`
      }
    })
    .then((res) => setBallot(res.data))
    .catch((err) => console.error(err));
  }, [id, session]);

  if (!session) {
    return <p>You need to log in first.</p>;
  }

  if (!ballot) {
    return <p>Loading ballot...</p>;
  }

  return (
    <div>
      <h1>Ballot #{id}</h1>
      {/* Display ballot details */}
    </div>
  );
}
