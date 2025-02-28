'use client';
import Header from '@/components/header';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { jwtDecode } from "jwt-decode";
import { getBallotById, getAwards, createBallot, updateBallot, refreshToken } from '@/lib/api';
// import ChevronLeft from '@/public/chevron-left.svg';

export default function MyBallotPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [awards, setAwards] = useState([]);
  const [selectedWinners, setSelectedWinners] = useState([]);
  const [showNamePopup, setShowNamePopup] = useState(false);
  const [ballotName, setBallotName] = useState("");
  const [hasBallot, setHasBallot] = useState(null);
  const [ballotId, setBallotId] = useState(null);

  // Redirect unauthenticated users
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
          setBallotName(result.name);
          console.log("result", result);
          let selected = [];
          result.awards.forEach((award) => {
            selected.push(award);
          });
          setSelectedWinners(selected);
          setBallotId(result._id);
          setHasBallot(true);
        }
      } catch (error) {
        console.error("Error fetching ballot:", error);
        setHasBallot(false);
      }
    }
    fetchData();
  }, [userId]);

  useEffect(() => {
    const fetchData = async () => {

      const awardsOrder = [
        "bestpicture",
        "bestdirector",
        "bestactress",
        "bestactor",
        "bestsupportingactress",
        "bestsupportingactor",
        "originalscreenplay",
        "adaptedscreenplay",
        "internationalfeaturefilm",
        "animatedfeaturefilm",
        "documentaryfeaturefilm",
        "musicoriginalscore",
        "musicoriginalsong",
        "cinematography",
        "costumedesign",
        "filmediting",
        "makeupandhairstyling",
        "productiondesign",
        "sound",
        "visualeffects",
        "animatedshortfilm",
        "liveactionshortfilm",
        "documentaryshortfilm"
      ]

      let token = session?.accessToken;
  
      try {
        const result = await getAwards(token);
        const sortedAwards = result.sort((a, b) => {
          return awardsOrder.indexOf(a.awardId) - awardsOrder.indexOf(b.awardId);
        });
        console.log(sortedAwards);
        setAwards(sortedAwards);
      } catch (error) {
        console.error("Error fetching awards:", error);
      }
    }
    fetchData();
  }, [hasBallot]); 

  // Wait until session is fully loaded
  if (status === 'loading') return <p>Loading...</p>;
  if (!session) return null; // Prevents further execution if session is missing

  const isSelected = (nomineeId, awardId) => {
    return selectedWinners.some(winner => winner.guessId === nomineeId && winner.awardId === awardId);
  };


  const selectWinner = (nomineeId, awardId, guessName, awardName, nomineeUrl) => {
    let updatedWinners = [];
    selectedWinners.forEach(winner => {
      if (winner.awardId !== awardId) {
        updatedWinners.push(winner);
      }
    });
    updatedWinners.push({ guessId: nomineeId, awardId: awardId, guessName: guessName, name: awardName, guessUrl: nomineeUrl });
    console.log(updatedWinners);
    setSelectedWinners(updatedWinners);
  }

  const clickNominee = (nomineeId, awardId, nomineeName, awardName, nomineeUrl) => {
    console.log(awardName);
    if (!isSelected(nomineeId, awardId)) {
      selectWinner(nomineeId, awardId, nomineeName, awardName, nomineeUrl);
    }
  }

  const clickBack = () => {
    router.push("/home");
  }

  const clickSubmit1 = () => {
    if (selectedWinners.length !== 23) {
      alert("Oops! Looks like you have voted for all the awards.");
    } else {
      console.log(selectedWinners);
      setShowNamePopup(true);
    }
  }

  const clickSubmit2 = async () => {
    if (ballotName == "") {
      alert("Oops! You need to enter a name for your ballot.");
    } else {
      if (session?.accessToken) {
        let awards = [];
        console.log(selectedWinners);
        selectedWinners.forEach(winner => {
          const award = {
            awardId: winner.awardId,
            name: winner.name,
            guessId: winner.guessId,
            guessName: winner.guessName,
            guessUrl: winner.guessUrl
          }
          awards.push(award);
        });
        const ballot = {
          userId: userId,
          name: ballotName,
          awards: awards
        }
        let response;
        if (hasBallot) {
          console.log(ballot);
          response = await updateBallot(session.accessToken, ballotId, ballot);
        } else {
          response = await createBallot(session.accessToken, ballot);
        }
        console.log(response);
        if (response.message === "Ballot submitted successfully!" || response.message === "Ballot updated successfully!") {
          router.push("/home");
        }
      }
    }
  }

  const closePopup = () => {
    setShowNamePopup(false);
  }

  const progress = (selectedWinners.length / 23) * 100;

  return (
    <main className="my-ballot">
      {showNamePopup && (
        <div className="name-popup-container">
          <div className="name-popup">
            <div className="close-out" onClick={closePopup}>
              <img src="/close.svg" alt="Close" />
            </div>
            <h1>Please enter your name:</h1>
            <input type="text" placeholder="Your Name Here" value={ballotName} onChange={(e) => setBallotName(e.target.value)} />
            <button onClick={clickSubmit2} className="submit-button">SUBMIT</button>
          </div>
        </div>
      )}
      <Header />
      <div className="subheader">
        <button className="back-button" onClick={clickBack}>
          <img src="/chevron-left.svg" alt="Chevron Left" />
        </button>
        <div className="subheader-left">
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
          <p>{selectedWinners.length}/23</p>
        </div>
        {hasBallot ? (
        <button className='submit-button' onClick={clickSubmit1}>SAVE</button>
        ) : (
          <button className='submit-button' onClick={clickSubmit1}>SUBMIT</button>
        )}
      </div>
      <div className="subheader-fade"></div>
      <div className="my-ballot-content">
        <div className="ballot">
          {awards.map((award) => (
            <div key={award._id} className="award-item">
              <div className="award-header">
                <h1>{award.name.toUpperCase()}</h1>
                <div className="hl"></div>
              </div>
              <div className="award-nominees">
                {award.nominees.map((nominee) => {
                  return (
                    <div className="nominee-item" onClick={() => clickNominee(nominee.nomineeId, award.awardId, nominee.name, award.name, nominee.imageUrl)} key={nominee.nomineeId}>
                      <div className="nominee-item-left">
                        <div className="img-container">
                          {nominee.imageUrl !== "" ? (
                            <img src={nominee.imageUrl} alt={nominee.film} />
                          ) : (
                            <img src={null} alt={nominee.film} />
                          )}
                        </div>
                        {nominee.name !== nominee.film ? (
                          <div className="nominee-info">
                            <h4>{nominee.name}</h4>
                            <p>{nominee.film}</p>
                          </div>
                        ) : (
                          <div className="nominee-info">
                            <h4>{nominee.name}</h4>
                          </div>
                        )}
                      </div>
                      <div className="nominee-info-right">
                        {isSelected(nominee.nomineeId, award.awardId) ? (
                          <button className='selected'></button>
                        ) : (
                          <button className="unselected"></button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
