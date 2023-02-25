import React, { useState } from 'react';
import Axios from 'axios';
import { Col, Container, Row } from "reactstrap";

export default function EventCreator() {

    const url = ""
    const [data, setData] = useState({
        name: "",
        date: new Date,
        location: "",
        description: "",
        FirstRoundGameCount: ""
    })

    function handleSubmit(e) {
        e.preventDefault();

        //Axios.post("/Events", {
        //    "Name": data.name,
        //    "Date": data.date,
        //    "Location": data.location,
        //    "Description": data.description,
        //    "FirstRoundGameCount": data.FirstRoundGameCount
        //}).then(() => { console.log('new event added') })

        fetch('/api/Events.json', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: {
                "Name": data.name,
                "Date": data.date,
                "Location": data.location,
                "Description": data.description,
                "FirstRoundGameCount": data.FirstRoundGameCount
            }
        }).then(() => { console.log('new event added') })
    }

    function handle(e) {
        const newdata = { ...data }
        newdata[e.target.name] = e.target.value
        setData(newdata)
        console.log(newdata)
    }

    return (
        <Container>
            <Row>
                <Col sm="3"></Col>
                <Col sm="6">
                    <form method="post" action="/api/Events/post.json" href="/api/Events">
                        <Container>
                            <Row>
                                <label>
                                    Name:
                        
                                </label>
                                <input onChange={(e) => handle(e)} value={data.name} type="text" name="name" placeholder="Enter the event name..." />
                            </Row>
                            <Row>
                                <label>
                                    Date:
                                </label>
                                <input onChange={(e) => handle(e)} value={data.date} type="datetime-local" name="date" />
                            </Row>
                            <Row>
                                <label>
                                    Location:
                                </label>
                                <input onChange={(e) => handle(e)} value={data.location} type="text" name="location" placeholder="Enter Location or Online" />
                            </Row>
                            <Row>
                                <label>
                                    Description:
                                </label>
                                <input onChange={(e) => handle(e)} value={data.description} type="text" name="description" placeholder="Add the details of the event..." />
                            </Row>
                            <Row>
                                <label>
                                    Number of Games:
                                </label>
                                <input onChange={(e) => handle(e)} value={data.FirstRoundGameCount} type="number" name="FirstRoundGameCount" />
                            </Row>
                            <Row>
                                <button type="submit">Submit</button>
                            </Row>
                        </Container>
                    </form>
                </Col>
                <Col sm="3"></Col>
            </Row>
        </Container>
    );
}