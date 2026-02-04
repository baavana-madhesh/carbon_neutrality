import React, { useState } from "react";
import axios from "axios";
import { Card, Button, Form, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";

export default function DataEntry() {
  const today = new Date();
  const defaultMonth = today.toLocaleString("default", {
    month: "long",
  });
  const defaultYear = today.getFullYear();
  const defaultDate = today.toISOString().split("T")[0]; // yyyy-mm-dd

  const [campusBlock, setCampusBlock] = useState("");
  const [month, setMonth] = useState(defaultMonth);
  const [year, setYear] = useState(defaultYear);
  const [date, setDate] = useState(defaultDate);
  const [remarks, setRemarks] = useState("");
  const [sources, setSources] = useState([
    {
      title: "Electricity",
      co2: 0,
      type: "energy",
    },
    {
      title: "Diesel",
      co2: 0,
      type: "energy",
    },
    {
      title: "Petrol",
      co2: 0,
      type: "energy",
    },
    {
      title: "Bus km",
      co2: 0,
      type: "transport",
    },
    {
      title: "Car km",
      co2: 0,
      type: "transport",
    },
    {
      title: "Paper Waste",
      co2: 0,
      type: "waste",
    },
    {
      title: "Organic Waste",
      co2: 0,
      type: "waste",
    },
  ]);
  const [others, setOthers] = useState([]);
  const [message, setMessage] = useState("");

  const handleSourceChange = (index, value) => {
    const updated = [...sources];
    updated[index].co2 = Number(value);
    setSources(updated);
  };

  const addOther = () =>
    setOthers([
      ...others,
      {
        title: "",
        co2: 0,
        type: "other",
      },
    ]);

  const handleOtherChange = (index, field, value) => {
    const updated = [...others];
    updated[index][field] = field === "co2" ? Number(value) : value;
    setOthers(updated);
  };

  const totalCO2 =
    sources.reduce((sum, s) => sum + s.co2, 0) +
    others.reduce((sum, o) => sum + o.co2, 0);

  const getStatusComment = (total) => {
    if (total <= 1000) return "Low carbon footprint ✅";
    if (total <= 5000) return "Medium footprint ⚠️";
    return "High footprint ❌ Consider reduction!";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const payload = {
        campusBlock,
        month,
        year,
        date,
        sources: [...sources, ...others],
        remarks,
      };
      const res = await axios.post(
        "http://localhost:5000/api/carbon/add",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setMessage(res.data.message || "Submitted successfully!");
      setSources(
        sources.map((s) => ({
          ...s,
          co2: 0,
        })),
      );
      setOthers([]);
      setRemarks("");
      setDate(defaultDate); // reset date to today
    } catch (err) {
      console.error(err);
      setMessage("Failed to submit. Try again!");
    }
  };

  return (
    <motion.div
      className="container mt-4"
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
    >
      <h2 className="mb-4 text-center"> Data Entry </h2>
      <Card className="p-4 shadow mb-3">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label> Campus Block </Form.Label>{" "}
            <Form.Control
              type="text"
              value={campusBlock}
              onChange={(e) => setCampusBlock(e.target.value)}
              required
            />
          </Form.Group>
          <Row className="mb-3">
            <Col>
              <Form.Label> Month </Form.Label>{" "}
              <Form.Control
                type="text"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />{" "}
            </Col>{" "}
            <Col>
              <Form.Label> Year </Form.Label>{" "}
              <Form.Control
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              />{" "}
            </Col>{" "}
            <Col>
              <Form.Label> Date </Form.Label>{" "}
              <Form.Control
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />{" "}
            </Col>{" "}
          </Row>
          <h5> Sources </h5>{" "}
          {sources.map((s, i) => (
            <Form.Group key={i} className="mb-2">
              <Form.Label> {s.title}(CO₂ kg) </Form.Label>{" "}
              <Form.Control
                type="number"
                min="0"
                value={s.co2}
                onChange={(e) => handleSourceChange(i, e.target.value)}
                required
              />
            </Form.Group>
          ))}
          <h5> Other Sources </h5>{" "}
          {others.map((o, i) => (
            <Row key={i} className="mb-2">
              <Col>
                <Form.Control
                  type="text"
                  placeholder="Resource title"
                  value={o.title}
                  onChange={(e) =>
                    handleOtherChange(i, "title", e.target.value)
                  }
                  required
                />
              </Col>{" "}
              <Col>
                <Form.Control
                  type="number"
                  min="0"
                  placeholder="CO₂ kg"
                  value={o.co2}
                  onChange={(e) => handleOtherChange(i, "co2", e.target.value)}
                  required
                />
              </Col>{" "}
            </Row>
          ))}{" "}
          <Button variant="secondary" className="mb-3" onClick={addOther}>
            +Add Other{" "}
          </Button>
          <Form.Group className="mb-3">
            <Form.Label> Remarks </Form.Label>{" "}
            <Form.Control
              as="textarea"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />{" "}
          </Form.Group>
          <h5>
            {" "}
            Total CO₂: {totalCO2}
            kg{" "}
          </h5>{" "}
          <p> {getStatusComment(totalCO2)} </p>
          <Button type="submit" variant="success">
            {" "}
            Submit{" "}
          </Button>{" "}
        </Form>{" "}
        {message && <p className="mt-3"> {message} </p>}{" "}
      </Card>{" "}
    </motion.div>
  );
}
