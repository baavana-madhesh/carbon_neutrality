import React, { useState } from "react";
import axios from "axios";
import { Card, Button, Form, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";

export default function DataEntry() {
  const today = new Date();
  const defaultMonth = today.toLocaleString("default", { month: "long" });
  const defaultYear = today.getFullYear();
  const defaultDate = today.toISOString().split("T")[0];

  const [campusBlock, setCampusBlock] = useState("");
  const [month, setMonth] = useState(defaultMonth);
  const [year, setYear] = useState(defaultYear);
  const [date, setDate] = useState(defaultDate);
  const [remarks, setRemarks] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);

  const [sources, setSources] = useState([
    { title: "Electricity", co2: "0", type: "energy" },
    { title: "Diesel", co2: "0", type: "energy" },
    { title: "Petrol", co2: "0", type: "energy" },
    { title: "Bus km", co2: "0", type: "transport" },
    { title: "Car km", co2: "0", type: "transport" },
    { title: "Paper Waste", co2: "0", type: "waste" },
    { title: "Organic Waste", co2: "0", type: "waste" },
  ]);

  const [others, setOthers] = useState([]);

  // Update source CO2 as string while typing
  const handleSourceChange = (index, value) => {
    const updated = [...sources];
    updated[index].co2 = value;
    setSources(updated);
  };

  // Add a new Other source
  const addOther = () => {
    setOthers([...others, { title: "", co2: "0", type: "other" }]);
  };

  // Update Other source fields as string while typing
  const handleOtherChange = (index, field, value) => {
    const updated = [...others];
    updated[index][field] = value;
    setOthers(updated);
  };

  // Carbon footprint comment logic
  const getStatusComment = (total) => {
    if (total <= 1000)
      return "Great! 🌱 Your campus carbon footprint is low. Continue maintaining sustainable practices and energy efficiency.";
    if (total <= 5000)
      return "Moderate carbon footprint ⚠️. Consider improving waste management and optimizing transport usage to reduce emissions.";
    return "High carbon footprint ❌. Immediate action required. Focus on renewable energy, reduce fuel usage, and implement green initiatives.";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setResult(null);

    // Convert string CO2 values to numbers
    const sourcesNum = sources.map((s) => ({
      ...s,
      co2: Number(s.co2 || 0),
    }));
    const othersNum = others.map((o) => ({
      ...o,
      co2: Number(o.co2 || 0),
    }));

    const total =
      sourcesNum.reduce((sum, s) => sum + s.co2, 0) +
      othersNum.reduce((sum, o) => sum + o.co2, 0);

    try {
      const token = localStorage.getItem("token");

      const payload = {
        campusBlock,
        month,
        year,
        date,
        sources: [...sourcesNum, ...othersNum],
        remarks,
      };

      const res = await axios.post(
        "http://localhost:5000/api/carbon/add",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token?.trim()}`,
          },
        }
      );

      setMessage(res.data.message || "Submitted successfully!");

      setResult({
        total,
        comment: getStatusComment(total),
      });

      // Reset form
      setSources(sources.map((s) => ({ ...s, co2: "0" })));
      setOthers([]);
      setRemarks("");
      setDate(defaultDate);
    } catch (err) {
      console.error(err.response?.data || err.message);
      if (err.response?.status === 401) {
        setMessage("Unauthorized. Please login again.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        setMessage(err.response?.data?.message || "Server error. Try again.");
      }
    }
  };

  return (
    <motion.div
      className="container mt-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2 className="mb-4 text-center">Data Entry</h2>

      <Card className="p-4 shadow mb-3">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Campus Block</Form.Label>
            <Form.Control
              type="text"
              value={campusBlock}
              onChange={(e) => setCampusBlock(e.target.value)}
              required
            />
          </Form.Group>

          <Row className="mb-3">
            <Col>
              <Form.Label>Month</Form.Label>
              <Form.Control
                type="text"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </Col>
            <Col>
              <Form.Label>Year</Form.Label>
              <Form.Control
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              />
            </Col>
            <Col>
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Col>
          </Row>

          <h5>Sources</h5>
          {sources.map((s, i) => (
            <Form.Group key={i} className="mb-2">
              <Form.Label>{s.title}</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={s.co2}
                onChange={(e) => handleSourceChange(i, e.target.value)}
                required
              />
            </Form.Group>
          ))}

          <h5 className="mt-3">Other Sources</h5>
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
              </Col>
              <Col>
                <Form.Control
                  type="number"
                  min="0"
                  placeholder="CO₂ kg"
                  value={o.co2}
                  onChange={(e) =>
                    handleOtherChange(i, "co2", e.target.value)
                  }
                  required
                />
              </Col>
            </Row>
          ))}

          <Button variant="secondary" className="mb-3" onClick={addOther}>
            + Add Other
          </Button>

          <Form.Group className="mb-3">
            <Form.Label>Remarks</Form.Label>
            <Form.Control
              as="textarea"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </Form.Group>

          <Button type="submit" variant="success">
            Submit
          </Button>
        </Form>

        {message && <p className="mt-3">{message}</p>}

        {result && (
          <Card className="mt-3 p-3 bg-light">
            <h5>Carbon Score: {result.total} kg</h5>
            <p>{result.comment}</p>
          </Card>
        )}
      </Card>
    </motion.div>
  );
}
