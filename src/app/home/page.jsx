'use client';

import { useSession, getSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { jwtDecode } from "jwt-decode";
import Header from '@/components/header';
import Countdown from '@/components/countdown';
import { getBallotById, getBallots, refreshToken } from '@/lib/api';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [hasBallot, setHasBallot] = useState(null);
  const [ballot, setBallot] = useState(null);
  const [showMyBallotMobile, setShowMyBallotMobile] = useState(true);
  const [allBallots, setAllBallots] = useState([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      setUserId(session.user.id);
    }
  }, [session]);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      console.log("Checking session token...");
      console.log("Session", session);
      let token = session?.accessToken;
      let refresh = session?.refreshToken;

      const isTokenExpired = (token) => {
        if (!token) return true;
        try {
          const payload = jwtDecode(token);
          return payload.exp * 1000 < Date.now();
        } catch (error) {
          console.error("Error decoding token", error);
          return true;
        }
      };

      // If token is expired, try refreshing it
      if (!token || isTokenExpired(token)) {
        console.log("Token expired. Attempting refresh...");

        const newTokens = await refreshToken(refresh); // Use stored refresh token

        if (newTokens) {
          console.log("Token refresh successful!");
          session.accessToken = newTokens.accessToken;
          session.refreshToken = newTokens.refreshToken;
          token = newTokens.accessToken;
        } else {
          console.log("Manual refresh failed. Forcing re-authentication...");
          await signIn("credentials", { redirect: false });
          const refreshedSession = await getSession();
          token = refreshedSession?.accessToken;
        }
      }

      if (!token) {
        console.error("No valid token found, skipping ballot fetch.");
        return;
      }

      try {
        const result = await getBallotById(token, userId);
        if (result?.message === "Ballot not found") {
          setHasBallot(false);
        } else {
          setBallot(result);
          setHasBallot(true);
        }
      } catch (error) {
        console.error("Error fetching ballot:", error);
        setHasBallot(false);
      }

      try {
        const results = await getBallots(token);
        // here sort results by highest to lowest 'points' property
        const sortedResults = results.sort((a, b) => b.points - a.points);
        setAllBallots(sortedResults);
      } catch (error) {
        console.error("Error fetching ballots:", error);
      }
    };

    fetchData();
  }, [userId]);

  const clickMyBallot = () => {
    setShowMyBallotMobile(true);
  }

  const clickLeaderboard = () => {
    setShowMyBallotMobile(false);
  }

  const editBallot = () => {
    router.push('/my-ballot');

  }

  if (status === 'loading') return <p>Loading...</p>;
  if (!session) return null;

  return (
    <main className="home2">
      <div className="mobile-header">
        <div className="header-body">
          <div className="img-container">
            <img src="/video-vintage.svg" alt="Film Camera" />
          </div>
          <h3>2025 CITY Oscars Competition</h3>
        </div>
        <div className="header-bottom">
          <div className="header-button">
            <button className={showMyBallotMobile ? 'selected' : ''} onClick={clickMyBallot}>MY BALLOT</button>
          </div>
          <div className="header-button">
            <button className={!showMyBallotMobile ? 'selected' : ''} onClick={clickLeaderboard}>LEADERBOARD</button>
          </div>
        </div>
        <div className="header-fade"></div>
      </div>
      <div className="scroll-container">
        <div className="home-body">
          {showMyBallotMobile ? (
            <div className="ballot-container">
              <div className="blurb">
                <div>
                  <div className="img-container">
                    <img src="/information-outline.svg" alt="Info" />
                  </div>
                  <p>Ballots close at <span>5PM CST</span> on Sunday, March 2.</p>
                </div>
                <button>EDIT</button>
              </div>
              {hasBallot !== null ? (
                hasBallot === true ? (
                  <div className="user-ballot">
                    {ballot.awards.map((award) => (
                      <div key={award.awardId} className="ballot-award">
                        <div className="ballot-award-left">
                          {award.guessUrl !== "" ? (
                            <img src={award.guessUrl} alt={award.guessName} />
                          ) : (
                            <img src={null} alt={award.guessName} />
                          )}
                        </div>
                        <div className="ballot-award-right">
                          <h4>{award.name.toUpperCase()}</h4>
                          <div className="award-info-bottom">
                            <div className="img-container">
                              <img src="/star.svg" alt="Star" />
                            </div>
                            <p>{award.guessName}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="user-add-ballot">
                    <h1>You haven't filled out your ballot yet!</h1>
                    <p>Ballot submissions lock at <span>5PM CST</span> on March 2nd.</p>
                    <button onClick={() => router.push('/my-ballot')}>START</button>
                  </div>
                )
              ) : (
                <div className="ballot-loading"><p>Loading...</p></div>
              )}
            </div>
          ) : (
            <div className="leaderboard-container">
              <div className="leaderboard">
                {allBallots.length === 0 ? (
                  <h1>No Ballots Submitted</h1>
                ) : (
                  allBallots.map((ballot) => (
                    <div key={ballot._id} className="leaderboard-ballot">
                      <h4>{ballot.name}</h4>
                      <p>{ballot.points} POINTS</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )

  return (
    <main className='home'>
      <Header />
      {/* <Countdown /> */}
      <div className="mobile-home">
        <div className="home-content">
          <div className="mobile-header">
            <div className="mobile-header-left">
              <button className={showMyBallotMobile ? 'selected' : ''} onClick={clickMyBallot}>MY BALLOT</button>
            </div>
            <div className="mobile-header-right">
              <button className={!showMyBallotMobile ? 'selected' : ''} onClick={clickLeaderboard}>LEADERBOARD</button>
            </div>
          </div>
          {showMyBallotMobile ? (
            <div className="ballot-container">
              {hasBallot !== null ? (
                hasBallot === true ? (
                  <div className="user-ballot">
                    <div className="edit-button-container">
                      <button className="edit" onClick={editBallot}>EDIT</button>
                    </div>
                    {ballot.awards.map((award) => (
                      <div key={award.awardId} className="ballot-award">
                        <div className="ballot-award-left">
                          {award.guessUrl !== "" ? (
                            <img src={award.guessUrl} alt={award.guessName} />
                          ) : (
                            <img src={null} alt={award.guessName} />
                          )}
                        </div>
                        <div className="ballot-award-right">
                          <h4>{award.name.toUpperCase()}</h4>
                          <div className="award-info-bottom">
                            <div className="img-container">
                              <img src="/star.svg" alt="Star" />
                            </div>
                            <p>{award.guessName}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="user-add-ballot">
                    <h1>You haven't filled out your ballot yet!</h1>
                    <p>Ballot submissions lock at <span>5PM CST</span> on March 2nd.</p>
                    <button onClick={() => router.push('/my-ballot')}>START</button>
                  </div>
                )
              ) : (
                <div className="ballot-loading"><p>Loading...</p></div>
              )}
            </div>
          ) : (
            <div className="leaderboard-container">
              <div className="leaderboard">
                {allBallots.length === 0 ? (
                  <h1>No Ballots Submitted</h1>
                ) : (
                  allBallots.map((ballot) => (
                    <div key={ballot._id} className="leaderboard-ballot">
                      <h4>{ballot.name}</h4>
                      <p>{ballot.points} POINTS</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="desktop-home">
        <div className="home-content">
          <div className="fade"></div>
          <div className="ballot-container">
            <div className="ballot-container-header">
              <h1>MY BALLOT</h1>
            </div>
            {hasBallot !== null ? (
              hasBallot === true ? (
                <div className="user-ballot">
                  <div className="edit-button-container">
                    <button className="edit" onClick={editBallot}>EDIT</button>
                  </div>
                  {ballot.awards.map((award) => (
                    <div key={award.awardId} className="ballot-award">
                      <div className="ballot-award-left">
                        {award.guessUrl !== "" ? (
                          <img src={award.guessUrl} alt={award.guessName} />
                        ) : (
                          <img src={null} alt={award.guessName} />
                        )}
                      </div>
                      <div className="ballot-award-right">
                        <h4>{award.name.toUpperCase()}</h4>
                        <div className="award-info-bottom">
                          <div className="img-container">
                            <img src="/star.svg" alt="Star" />
                          </div>
                          <p>{award.guessName}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="user-add-ballot">
                  <h1>You haven't filled out your ballot yet!</h1>
                  <p>Ballot submissions lock at <span>5PM CST</span> on March 2nd.</p>
                  <button onClick={() => router.push('/my-ballot')}>START</button>
                </div>
              )
            ) : (
              <div className="ballot-loading"><p>Loading...</p></div>
            )}
          </div>
          <div className="leaderboard-container">
            <div className="leaderboard-container-header">
              <h1>LEADERBOARD</h1>
            </div>
            <div className="leaderboard-content">
              {allBallots.length === 0 ? (
                <h1>No Ballots Submitted</h1>
              ) : (
                allBallots.map((ballot) => (
                  <div key={ballot._id} className="leaderboard-ballot">
                    <h4>{ballot.name}</h4>
                    <p>{ballot.points} POINTS</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
