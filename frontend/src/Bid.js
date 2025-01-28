import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Form,
  Button,
  Container,
  Table,
  Image,
} from "react-bootstrap";
import axios from "axios";
import moment from "moment";
import { useSelector } from "react-redux";
import "./Bid.css";

const Bid = () => {
  const user = useSelector((state) => state.authentication.user);

  const [player_id, setplayer_id] = useState("1");
  const [currentBid, setCurrentBid] = useState(0);
  const [currentBidder, setCurrentBidder] = useState("");
  const [nextBid, setNextBid] = useState(0);

  const [budget, setbudget] = useState(200000000);
  const [activePlayer, setactivePlayer] = useState([]);
  const [teamSquad, setteamSquad] = useState([]);
  const [bidLock, setBidLock] = useState(false);

  const getResponse = async () => {
    const res = await axios.get(`/api/player/${player_id}`);
    setactivePlayer(res.data);
    const latestBid = res.data.basePrice * 1;
    setCurrentBid(0);
    setNextBid(calculateNextBid(latestBid));

    const res2 = await axios.get(`/api/players/`);
    console.log("res", res2.data);
    const filteredData = res2.data.filter(
      (player) => player.assignedTo === user.user_id.toString()
    );
    setteamSquad(filteredData);
    console.log(user.user_id, filteredData);

    const totalAmt = filteredData.reduce(
      (sum, player) => sum + player.amt * 1,
      0
    );
    const remainingBudget = 200000000 - totalAmt;
    setbudget(remainingBudget);
  };

  const [teamPurse, setTeamPurse] = useState([]); // Store all data in one state

  const calculateTeamPurse = async () => {
    try {
      // Fetch teams and players
      const teamsRes = await axios.get(`/api/user/players/`);
      const playersRes = await axios.get(`/api/players/`);

      // Create a mapping of teamId -> totalSpentAmount
      const teamBudgetMap = {};
      playersRes.data.forEach((player) => {
        const teamId = player.assignedTo;
        if (!teamBudgetMap[teamId]) {
          teamBudgetMap[teamId] = 0;
        }
        teamBudgetMap[teamId] += player.amt * 1;
      });

      // Ensure all teams are considered, even those with no players
      const teamPurseData = teamsRes.data.map((team) => {
        const spentAmount = teamBudgetMap[team.id] || 0; // If no players, spent amount = 0
        return {
          teamId: team.id,
          teamName: team.username, // Using username as team name
          remainingBudget: 200000000 - spentAmount, // 20 Crores - spent amount
        };
      });

      setTeamPurse(teamPurseData); // Store all data in one state
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    calculateTeamPurse();
    getResponse();
  }, [player_id]);

  const getBids = async () => {
    const activeplayer = await axios.get(`/api/active-player/1`);
    setplayer_id(activeplayer.data.activePlayer_id);

    try {
      const bid = await axios.get(
        `/api/player-bids/${activeplayer.data.activePlayer_id}`
      );

      if (bid.data.length > 0) {
        console.log(bid.data);

        const latestBid = bid.data[bid.data.length - 1];
        setCurrentBid(latestBid.amount * 1);
        setCurrentBidder(latestBid.teamname);
        setNextBid(calculateNextBid(latestBid.amount * 1));

        if (calculateNextBid(latestBid.amount * 1) > budget) {
          setBidLock(calculateNextBid(latestBid.amount * 1) > budget);
        } else if (latestBid.lock_timestamp) {
          const lockTime = new Date(latestBid.lock_timestamp).getTime();
          const currentTime = new Date().getTime();
          const bidAmount = latestBid.amount * 1; // Ensure it's a number

          // Set lock duration based on bid amount
          const lockDuration = bidAmount < 20000000 ? 1500 : 3000;

          setBidLock(currentTime - lockTime < lockDuration);
        } else {
          setBidLock(false);
        }
      }
    } catch (error) {
      console.error("Error fetching bids:", error);
    }
  };

  const calculateNextBid = (amount) => {
    if (amount < 2 * 10000000) return amount + 1000000; // 10 lakhs
    if (amount < 3 * 10000000) return amount + 2000000; // 20 lakhs
    if (amount < 5 * 10000000) return amount + 3000000; // 30 lakhs
    return amount + 4000000; // 40 lakhs
  };

  useEffect(() => {
    getBids(); // Fetch initially
    const interval = setInterval(getBids, 1000); // Fetch every second

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  async function FormSubmit(event) {
    event.preventDefault();
    let formField = new FormData();

    formField.append("user", user.user_id);
    if (currentBid === 0) {
      formField.append("amount", activePlayer.basePrice * 1);
    } else {
      formField.append("amount", nextBid);
    }
    formField.append("player_id", player_id);
    formField.append("teamname", user.username);

    await axios({
      method: "post",
      url: "/api/bids/",
      data: formField,
    })
      .then(function (response) {
        console.log(response);
        setCurrentBid(response.data.amount);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  return (
    <div>
      <Container>
        <Form onSubmit={FormSubmit}>
          <Row>
            <Col>
              <h2 style={{ textTransform: "capitalize" }}>
                Team - {user.username}
              </h2>
              <div className="squadHead">
                <h4>
                  <i className="fa-solid fa-users"></i> Current Squad
                </h4>
                <h4>
                  <i className="fa-solid fa-wallet" /> - ₹{budget / 10000000} CR
                </h4>
              </div>
              <Table responsive="md" striped bordered>
                <thead className="tableHead">
                  <tr>
                    <th>Player Name</th>
                    <th>Type</th>
                    <th>Sold For</th>
                  </tr>
                </thead>
                <tbody className="tableBody">
                  {teamSquad
                    .slice(0)
                    .reverse()
                    .map((player, index) => (
                      <tr>
                        <td>{player.name}</td>
                        <td>{player.role}</td>
                        <td>₹{player.amt / 10000000} Cr</td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </Col>

            <Col>
              <h2>Current Player</h2>
              <Row style={{ marginBottom: "10px" }}>
                <Col md={4}>
                  <Image src={activePlayer.image} fluid />
                </Col>
                <Col>
                  <div className="playerHead">
                    <h4>
                      <i className="fa-solid fa-user"></i> - {activePlayer.name}
                    </h4>
                    <h4>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="28px"
                        viewBox="0 -960 960 960"
                        width="28px"
                        fill="#212529"
                      >
                        <path d="M460-252 65-647l168-168 395 395-168 168ZM744-80 574-250l56-56 170 170-56 56Zm-4-520q-58 0-99-41t-41-99q0-58 41-99t99-41q58 0 99 41t41 99q0 58-41 99t-99 41Z" />
                      </svg>
                      - {activePlayer.role}
                    </h4>
                    <h4>
                      <i className="fa-solid fa-tag"></i> - ₹
                      {activePlayer.basePrice / 10000000} CR
                    </h4>
                  </div>
                  <div className="bidBox">
                    <h5 style={{ textTransform: "capitalize" }}>
                      <i className="fa-solid fa-gavel"></i> - ₹
                      {currentBid / 10000000} Cr | {currentBidder}
                    </h5>
                    <h5>Next Bid - ₹{nextBid / 10000000} Cr</h5>
                    <Button
                      className="btn--four"
                      type="submit"
                      disabled={bidLock}
                    >
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                      Bid
                    </Button>
                  </div>
                </Col>
              </Row>
              <Table responsive="md" striped bordered>
                <thead className="tableHead">
                  <tr>
                    <th>Stat</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody className="tableBody">
                  <tr>
                    <td>Innings</td>
                    <td>{activePlayer.BattingInnings}</td>
                  </tr>
                  <tr>
                    <td>Runs</td>
                    <td>{activePlayer.BattingRuns}</td>
                  </tr>
                  <tr>
                    <td>Average</td>
                    <td>{activePlayer.BattingAverage}</td>
                  </tr>
                  <tr>
                    <td>SR</td>
                    <td>{activePlayer.BattingStrikeRate}</td>
                  </tr>
                  <tr>
                    <td>Overs</td>
                    <td>{activePlayer.Balls}</td>
                  </tr>
                  <tr>
                    <td>Wkts</td>
                    <td>{activePlayer.BowlingWickets}</td>
                  </tr>
                  <tr>
                    <td>Ave</td>
                    <td>{activePlayer.BowlingAverage}</td>
                  </tr>
                  <tr>
                    <td>Econ</td>
                    <td>{activePlayer.BowlingEconomy}</td>
                  </tr>
                  <tr>
                    <td>SR</td>
                    <td>{activePlayer.BowlingStrikeRate}</td>
                  </tr>
                  <tr>
                    <td>St</td>
                    <td>{activePlayer.Stumping}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>
        </Form>
        <Row>
          <h3>Team Pockets</h3>
          <Table bordered hover responsive className="text-center">
            <thead>
              <tr>
                <th>Team Name</th>
                <th>Remaining Budget (₹)</th>
              </tr>
            </thead>
            <tbody>
              {teamPurse.map(({ teamId, teamName, remainingBudget }) => (
                <tr key={teamId}>
                  <td style={{ textTransform: "uppercase" }}>{teamName}</td>
                  <td>₹{remainingBudget / 10000000} Cr</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Row>
      </Container>
    </div>
  );
};

export default Bid;
