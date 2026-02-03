import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Form,
  Button,
  Container,
  Table,
  Image,
  OverlayTrigger,
  Tooltip,
  DropdownButton,
  Dropdown,
  Accordion,
} from "react-bootstrap";
import axios from "axios";
import moment from "moment";
import { useSelector } from "react-redux";
import "./Bid.css";

const Bid = () => {
  const user = useSelector((state) => state.authentication.user);

  const [player_id, setplayer_id] = useState("");
  const [currentBid, setCurrentBid] = useState(0);
  const [currentBidder, setCurrentBidder] = useState("");
  const [nextBid, setNextBid] = useState(0);

  const [budget, setbudget] = useState(0);
  const [players, setplayers] = useState([]);
  const [soldPlayers, setsoldPlayers] = useState([]);
  const [unsoldPlayers, setunsoldPlayers] = useState([]);
  const [activePlayer, setactivePlayer] = useState([]);
  const [teamSquad, setteamSquad] = useState([]);
  const [playerBids, setplayerBids] = useState([]);
  const [bidLock, setBidLock] = useState(false);

  const [ranNum, setranNum] = useState(0);
  const getResponse = async () => {
    const res = await axios.get(`/api/player/${player_id}`);
    setactivePlayer(res.data);
    const latestBid = res.data.basePrice * 1;
    setCurrentBid(0);
    setNextBid(calculateNextBid(latestBid));

    const res2 = await axios.get(`/api/players/`);
    const sortedPlayers = res2.data.sort((a, b) => a.id - b.id);
    setplayers(sortedPlayers);
    console.log(sortedPlayers);

    const sold = res2.data.filter((player) => player.assignedTo);
    setsoldPlayers(sold);

    const unsold = res2.data.filter((player) => !player.assignedTo);
    setunsoldPlayers(unsold);

    const filteredData = res2.data.filter(
      (player) => player.assignedTo === user.email,
    );
    setteamSquad(filteredData);
    console.log(user.user_id, filteredData);

    const totalAmt = filteredData.reduce(
      (sum, player) => sum + player.amt * 1,
      0,
    );

    const res3 = await axios.get(`/api/user/player/${user.user_id}`);
    const remainingBudget = res3.data.userbudget - totalAmt;
    console.log(res3.data.userbudget);
    setbudget(remainingBudget);
  };

  const [teamSquads, setTeamSquads] = useState({});
  const fetchAndCalculateTeamSquads = async () => {
    try {
      // Fetch users with the accessGroup "player"
      const res = await axios.get(`/api/user/players/`);
      const allUsers = res.data;

      // Filter users with accessGroup "player"
      const playerUsers = allUsers.filter(
        (user) => user.accessGroup === "player",
      );

      // Fetch players
      const res2 = await axios.get(`/api/players/`);
      const allPlayers = res2.data;

      setplayers(allPlayers);

      // Create squads, ensuring all users with accessGroup "player" are included
      const squads = playerUsers.reduce((teams, user) => {
        const userName = user.email; // Use user name or any unique identifier for the team

        if (!teams[userName]) {
          teams[userName] = {
            players: [],
            budget: user.userbudget, // Start with the total budget
          };
        }

        // Attach players assigned to this user
        const assignedPlayers = allPlayers.filter(
          (player) => player.assignedTo === userName,
        );
        teams[userName].players.push(...assignedPlayers);

        // Deduct the budget for assigned players
        assignedPlayers.forEach((player) => {
          teams[userName].budget -= player.amt;
        });

        return teams;
      }, {});

      setTeamSquads(squads);
      console.log(squads);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchAndCalculateTeamSquads();
    getResponse();
    setCurrentBidder("");
  }, [player_id, ranNum]);

  const [changingPlayer, setChangingPlayer] = useState(false);
  const getBids = async () => {
    if (changingPlayer) return;
    const activeplayer = await axios.get(`/api/active-player/2`);
    setplayer_id(activeplayer.data.activePlayer_id);

    const res4 = await axios.get(`/api/ran-num/${1}`);
    setranNum(res4.data.num);

    try {
      const bid = await axios.get(
        `/api/player-bids/${activeplayer.data.activePlayer_id}`,
      );
      setplayerBids(bid.data);

      if (bid.data.length > 0) {
        const latestBid = bid.data[bid.data.length - 1];
        setCurrentBid(latestBid.amount * 1);
        setCurrentBidder(latestBid.teamname);
        setNextBid(calculateNextBid(latestBid.amount * 1));

        // if (calculateNextBid(latestBid.amount * 1) > budget) {
        // } else
        if (latestBid.lock_timestamp) {
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
    if (!changingPlayer) {
      getBids();
      getResponse();
    }
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
    formField.append("teamname", user.email);

    await axios({
      method: "post",
      url: "/api/bids/",
      data: formField,
    })
      .then(function (response) {
        // console.log(response);
        setCurrentBid(response.data.amount);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  async function playerSold(event) {
    event.preventDefault();
    let formField = new FormData();

    formField.append("assignedTo", currentBidder);
    formField.append("amt", currentBid);
    // formField.append("teamname", user.email);

    await axios({
      method: "put",
      url: `/api/player/${player_id}/`,
      data: formField,
    })
      .then(function (response) {
        setranNum(ranNum + 1);
        // console.log(response);
        setCurrentBid(response.data.amount);
      })
      .catch(function (error) {
        console.log(error);
      });

    let formField2 = new FormData();

    formField2.append("num", ranNum * 1 + 1);
    // formField.append("teamname", user.email);

    await axios({
      method: "put",
      url: `/api/ran-num/1/`,
      data: formField2,
    })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  const handlePlayerChange = async (direction) => {
    setChangingPlayer(true); // Prevent `getBids` from running

    const newPlayerId = player_id + direction;

    // Ensure the new player ID exists in the players array
    if (!players.some((player) => player.id === newPlayerId)) {
      setChangingPlayer(false); // Reset if no valid player found
      return;
    }

    // Update state
    setplayer_id(newPlayerId);

    // Prepare form data
    const formField2 = new FormData();
    formField2.append("activePlayer_id", newPlayerId);

    // Send API request
    try {
      await axios.put(`/api/active-player/1/`, formField2);
    } catch (error) {
      console.error("Error updating active player:", error);
    } finally {
      setTimeout(() => {
        setChangingPlayer(false); // Allow getBids to run again after a short delay
      }, 500);
    }
  };

  return (
    <div>
      <Container>
        <Form onSubmit={FormSubmit}>
          <Row>
            <Col>
              <h2 style={{ textTransform: "capitalize" }}>
                Team - {user.email}
              </h2>
              {(() => {
                if (
                  (typeof user !== "undefined" &&
                    typeof user.email !== "undefined" &&
                    user.accessGroup === "player") ||
                  (typeof user !== "undefined" &&
                    typeof user.email !== "undefined" &&
                    user.accessGroup === "abc")
                ) {
                  return (
                    <>
                      <div className="squadHead">
                        <h4>
                          <i className="fa-solid fa-users"></i> Current Squad
                        </h4>
                        <h4>
                          <i className="fa-solid fa-wallet" /> - ₹
                          {budget / 10000000} CR
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
                    </>
                  );
                } else if (
                  typeof user !== "undefined" &&
                  typeof user.email !== "undefined" &&
                  user.accessGroup === "admin"
                ) {
                  return (
                    <>
                      <div>
                        <Button
                          className="btn--secondary"
                          style={{ margin: "0 5px" }}
                          onClick={() => handlePlayerChange(-1)}
                          disabled={player_id === 0}
                        >
                          Previous Player
                        </Button>
                        <Button
                          className="btn--secondary"
                          style={{ margin: "0 5px" }}
                          onClick={() => handlePlayerChange(1)}
                          disabled={player_id === players.length - 1}
                        >
                          Next Player
                        </Button>
                      </div>
                    </>
                  );
                }
              })()}
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
                    {(() => {
                      if (player_id === 2) {
                        return (
                          <OverlayTrigger
                            style={{ width: "100%" }}
                            overlay={
                              <Tooltip id="tooltip-disabled">
                                Please wait for the next player
                              </Tooltip>
                            }
                          >
                            <Row>
                              <Button
                                className="btn--four"
                                type="submit"
                                disabled="true"
                              >
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                Bid
                              </Button>
                            </Row>
                          </OverlayTrigger>
                        );
                      } else if (activePlayer.assignedTo !== null) {
                        return (
                          <OverlayTrigger
                            style={{ width: "100%" }}
                            overlay={
                              <Tooltip id="tooltip-disabled">
                                The player is already sold
                              </Tooltip>
                            }
                          >
                            <Row>
                              <Button
                                className="btn--four"
                                type="submit"
                                disabled="true"
                              >
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                Bid
                              </Button>
                            </Row>
                          </OverlayTrigger>
                        );
                      } else if (
                        typeof user !== "undefined" &&
                        typeof user.email !== "undefined" &&
                        user.accessGroup === "admin"
                      ) {
                        return (
                          <Button
                            className="btn--four"
                            onClick={playerSold}
                            // disabled={bidLock}
                          >
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            Sold
                          </Button>
                        );
                      } else if (nextBid > budget) {
                        return (
                          <OverlayTrigger
                            style={{ width: "100%" }}
                            overlay={
                              <Tooltip id="tooltip-disabled">
                                You've exceeded your budget
                              </Tooltip>
                            }
                          >
                            <Row>
                              <Button
                                className="btn--four"
                                type="submit"
                                disabled="true"
                              >
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                Bid
                              </Button>
                            </Row>
                          </OverlayTrigger>
                        );
                      } else if (currentBidder === user.email) {
                        return (
                          <OverlayTrigger
                            style={{ width: "100%" }}
                            overlay={
                              <Tooltip id="tooltip-disabled">
                                You are the Current Bidder
                              </Tooltip>
                            }
                          >
                            <Row>
                              <Button
                                className="btn--four"
                                type="submit"
                                disabled="true"
                              >
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                Bid
                              </Button>
                            </Row>
                          </OverlayTrigger>
                        );
                      } else if (
                        (typeof user !== "undefined" &&
                          typeof user.email !== "undefined" &&
                          user.accessGroup === "player") ||
                        (typeof user !== "undefined" &&
                          typeof user.email !== "undefined" &&
                          user.accessGroup === "abc")
                      ) {
                        return (
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
                        );
                      }
                    })()}
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
                    <td>Batting Average</td>
                    <td>{activePlayer.BattingAverage}</td>
                  </tr>
                  <tr>
                    <td>Batting Strike Rate</td>
                    <td>{activePlayer.BattingStrikeRate}</td>
                  </tr>
                  <tr>
                    <td>Overs</td>
                    <td>{activePlayer.Balls / 6} Overs</td>
                  </tr>
                  <tr>
                    <td>Bowling Type</td>
                    <td>{activePlayer.BowlingType2}</td>
                  </tr>
                  <tr>
                    <td>Wickets</td>
                    <td>{activePlayer.BowlingWickets}</td>
                  </tr>
                  <tr>
                    <td>Bowling Average</td>
                    <td>{activePlayer.BowlingAverage}</td>
                  </tr>
                  <tr>
                    <td>Bowling Economy</td>
                    <td>{activePlayer.BowlingEconomy}</td>
                  </tr>
                  <tr>
                    <td>Bowling Strike Rate</td>
                    <td>{activePlayer.BowlingStrikeRate}</td>
                  </tr>
                  <tr>
                    <td>Stumping</td>
                    <td>{activePlayer.Stumping}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>
        </Form>
        <h3>Team Pockets</h3>
        <Accordion defaultActiveKey="0">
          {Object.keys(teamSquads).length > 0 ? (
            Object.entries(teamSquads).map(
              ([teamName, { players: squad, budget }], index) => (
                <Accordion.Item eventKey={index.toString()} key={teamName}>
                  <Accordion.Header>
                    {teamName === user.email
                      ? `${teamName} (Your Team)`
                      : teamName}{" "}
                    | ₹{budget / 10000000} Cr
                  </Accordion.Header>
                  <Accordion.Body>
                    {squad.length > 0 ? (
                      <Table bordered hover responsive className="text-center">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Amount (₹)</th>
                            <th>Role</th>
                          </tr>
                        </thead>
                        <tbody>
                          {squad.map((player) => (
                            <tr key={player.id}>
                              <td>{player.name}</td>
                              <td>{player.amt / 10000000} Cr</td>
                              <td>{player.role || "N/A"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    ) : (
                      <p>No players in this squad.</p>
                    )}
                  </Accordion.Body>
                </Accordion.Item>
              ),
            )
          ) : (
            <p>No squads found.</p>
          )}
        </Accordion>
      </Container>
      {(() => {
        if (
          typeof user !== "undefined" &&
          typeof user.email !== "undefined" &&
          user.accessGroup === "admin"
        ) {
          return (
            <Container>
              <p>{player_id}</p>
              <h3>Previous Bids</h3>
              <Table responsive="md" striped bordered>
                <thead className="tableHead">
                  <tr>
                    <th>S. No.</th>
                    <th>Team Name</th>
                    <th>Bid Amount</th>
                  </tr>
                </thead>
                <tbody className="tableBody">
                  {playerBids
                    .slice(0)
                    .reverse()
                    .map((player, index) => (
                      <tr>
                        <td> {index + 1}</td>
                        <td style={{ textTransform: "capitalize" }}>
                          {player.teamname}
                        </td>
                        <td>₹{player.amount / 10000000} Cr</td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </Container>
          );
        }
      })()}
    </div>
  );
};

export default Bid;
