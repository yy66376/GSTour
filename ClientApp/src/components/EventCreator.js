import React, { useState } from "react";
import { Form, Label, Input, Button, FormGroup, FormText } from "reactstrap";
import { useNavigate } from "react-router-dom";
import authService from "./api-authorization/AuthorizeService";
import SelectSearch from "react-select-search";
import "./EventCreator.css";
import { toast } from "react-toastify";

const minLen = 2;

export default function EventCreator() {
    const navigate = useNavigate();
    const [data, setData] = useState({
        name: "",
        date: new Date(),
        location: "",
        description: "",
        gameId: "",
        FirstRoundGameCount: "4",
    });

    const getGames = async (searchQuery) => {
        // Do not search if the search query is too short. Will overload server
        if (searchQuery.length <= minLen) {
            return;
        }

        const response = await fetch(`/api/Games/SearchAll?q=${searchQuery}`);
        if (response.ok) {
            const games = await response.json();
            return games.map((g) => ({
                name: g.name,
                value: g.id,
                headerImageUrl: g.headerImageUrl,
            }));
        } else if (response.status === 404) {
            return [];
        } else {
            // tell user that the games API is down
            toast.error("🛑 Cannot contact games API to search for games. 🛑", {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = await authService.getAccessToken();
        const response = await fetch("/api/Events", {
            method: "POST",
            headers: !token
                ? { "Content-Type": "application/json" }
                : {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            navigate("/Events");
        } else {
            // tell user that the events API is down
            toast.error("🛑 Cannot contact Events API to create Event. 🛑", {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        }
    };

    const handleChange = (e) => {
        setData((data) => {
            const newData = { ...data };
            newData[e.target.name] = e.target.value;
            return newData;
        });
    };

    const changeGameHandler = (newGameId) => {
        setData((data) => {
            return { ...data, gameId: newGameId };
        });
    };

    const renderGameOption = (props, option, snapshot, className) => {
        const imgStyle = {
            marginRight: 15,
            height: "75%",
            "border-radius": "5px",
        };

        return (
            <button {...props} className={className} type="button">
                <span>
                    <img
                        className="img-fluid"
                        alt="Game thumbnail"
                        style={imgStyle}
                        src={option.headerImageUrl}
                    />
                    <span>{option.name}</span>
                </span>
            </button>
        );
    };

    const cancelClickHandler = () => {
        navigate("/Events");
    };

    return (
        <>
            <h1 className="text-center mb-4">Create an event</h1>
            <img
                className="img-fluid m-auto d-block"
                style={{ height: "150px" }}
                src={process.env.PUBLIC_URL + "/images/trophy.png"}
                alt="Trophy"
            />
            <Form id="event-create-form" action="/api/Events" onSubmit={handleSubmit}>
                <FormGroup>
                    <Label for="event-name-input">Name:</Label>
                    <Input
                        id="event-name-input"
                        onChange={handleChange}
                        value={data.name}
                        type="text"
                        name="name"
                        placeholder="Enter the event name..."
                    />
                    <FormText>Give your event a cool name!</FormText>
                </FormGroup>
                <FormGroup>
                    <Label for="event-game-input">Game:</Label>
                    <SelectSearch
                        getOptions={getGames}
                        search
                        placeholder="Select a game"
                        onChange={changeGameHandler}
                        renderOption={renderGameOption}
                    />
                    <FormText>Select a game from our catalogue.</FormText>
                </FormGroup>
                <FormGroup>
                    <Label for="event-date-input">Date:</Label>
                    <Input
                        id="event-date-input"
                        onChange={handleChange}
                        value={data.date}
                        type="datetime-local"
                        name="date"
                    />
                    <FormText>Pick a date for this event.</FormText>
                </FormGroup>
                <FormGroup>
                    <Label for="event-location-input">Location:</Label>
                    <Input
                        id="event-location-input"
                        onChange={handleChange}
                        value={data.location}
                        type="text"
                        name="location"
                        placeholder="Enter Location or Online"
                    />
                    <FormText>Pick a location for this event.</FormText>
                </FormGroup>
                <FormGroup>
                    <Label for="event-description-input">Description:</Label>
                    <Input
                        id="event-description-input"
                        onChange={handleChange}
                        value={data.description}
                        type="text"
                        name="description"
                        placeholder="Add the details of the event..."
                    />
                    <FormText>Give your event a short description.</FormText>
                </FormGroup>
                <FormGroup>
                    <Label for="event-number-of-games-input">
                        Number of Participants/Teams:
                    </Label>
                    <Input
                        id="event-number-of-games-input"
                        onChange={handleChange}
                        value={data.FirstRoundGameCount}
                        type="select"
                        name="FirstRoundGameCount"
                    >
                        <option value="4">4</option>
                        <option value="8">8</option>
                        <option value="16">16</option>
                        <option value="32">32</option>
                    </Input>
                    <FormText>
                        Choose the number of players/teams that will play in this event.
                        Must be a power of 2.
                    </FormText>
                </FormGroup>

                <div className="event-actions mt-3 d-flex justify-content-end">
                    <Button
                        className="me-3"
                        color="primary"
                        type="submit"
                        form="event-create-form"
                    >
                        Submit
                    </Button>
                    <Button color="secondary" onClick={cancelClickHandler}>
                        Cancel
                    </Button>
                </div>
            </Form>
        </>
    );
}