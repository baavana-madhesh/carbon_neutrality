import React, { useMemo, useState } from "react";
import axios from "axios";
import { Card, Button, Form, Row, Col, Badge } from "react-bootstrap";
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
  const [submitting, setSubmitting] = useState(false);

  const [sources, setSources] = useState([
    { title: "Electricity", co2: "0", type: "energy" },
    { title: "Diesel", co2: "0", type: "energy" },
    { title: "Petrol", co2: "0", type: "energy" },
    { title: "Bus km", co2: "0", type: "transport" },
    { title: "Car km", co2: "0", type: "transport" },
    { title: "Paper Waste", co2: "0", type: "waste" },
    { title: "Organic Waste", co2: "0", type: "waste" },
  ]);

  const [others, setOthers] = useState([]); // can include green too

  const handleSourceChange = (index, value) => {
    const updated = [...sources];
    updated[index].co2 = value;
    setSources(updated);
  };

  const addOther = (type = "other") => {
    setOthers([...others, { title: "", co2: "0", type }]);
  };

  const removeOther = (index) => {
    const updated = [...others];
    updated.splice(index, 1);
    setOthers(updated);
  };

  const handleOtherChange = (index, field, value) => {
    const updated = [...others];
    updated[index][field] = value;
    setOthers(updated);
  };

  // Live totals preview
  const totals = useMemo(() => {
    const all = [...sources, ...others].map((s) => ({
      ...s,
      co2: Number(s.co2 || 0),
    }));

    let emission = 0;
    let absorption = 0;

    all.forEach((s) => {
      if (s.type === "green") absorption += s.co2;
      else emission += s.co2;
    });

    return {
      emission,
      absorption,
      net: emission - absorption,
      trees: Math.max(0, Math.ceil((emission - absorption) / 21)),
    };
  }, [sources, others]);

  const getStatusComment = (totalNet) => {
    if (totalNet <= 1000)
      return "Great! 🌱 Your campus carbon footprint is low. Continue maintaining sustainable practices and energy efficiency.";
    if (totalNet <= 5000)
      return "Moderate carbon footprint ⚠️. Consider improving waste management and optimizing transport usage to reduce emissions.";
    return "High carbon footprint ❌. Immediate action required. Focus on renewable energy, reduce fuel usage, and implement green initiatives.";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setResult(null);
    setSubmitting(true);

    const sourcesNum = sources.map((s) => ({ ...s, co2: Number(s.co2 || 0) }));
    const othersNum = others.map((o) => ({ ...o, co2: Number(o.co2 || 0) }));

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

      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/carbon/add`, payload, {
        headers: { Authorization: `Bearer ${token?.trim()}` },
      });

      setMessage(res.data.message || "Submitted successfully!");

      setResult({
        net: totals.net,
        comment: getStatusComment(totals.net),
      });

      // Reset
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
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div className="container mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="mb-4 text-center">Data Entry</h2>

      {/* Live totals */}
      <Row className="g-3 mb-3">
        <Col md={3}>
          <Card className="p-3 shadow-sm">
            <div className="text-muted small">Emission</div>
            <div className="fs-4 fw-bold">{totals.emission.toFixed(0)} kg</div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 shadow-sm">
            <div className="text-muted small">Absorption</div>
            <div className="fs-4 fw-bold">{totals.absorption.toFixed(0)} kg</div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 shadow-sm">
            <div className="text-muted small">Net Carbon</div>
            <div className="fs-4 fw-bold">{totals.net.toFixed(0)} kg</div>
            <Badge bg={totals.net <= 1000 ? "success" : totals.net <= 5000 ? "warning" : "danger"}>
              {totals.net <= 1000 ? "Low" : totals.net <= 5000 ? "Medium" : "High"}
            </Badge>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 shadow-sm">
            <div className="text-muted small">Trees Needed</div>
            <div className="fs-4 fw-bold">{totals.trees}</div>
            <div className="text-muted small">@21kg/tree/year</div>
          </Card>
        </Col>
      </Row>

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
              <Form.Control type="text" value={month} onChange={(e) => setMonth(e.target.value)} />
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
              <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Col>
          </Row>

          <h5 className="mt-2">Sources</h5>
          {sources.map((s, i) => (
            <Form.Group key={i} className="mb-2">
              <Form.Label className="small text-muted">{s.title} ({s.type})</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={s.co2}
                onChange={(e) => handleSourceChange(i, e.target.value)}
                required
              />
            </Form.Group>
          ))}

          <div className="d-flex align-items-center justify-content-between mt-4">
            <h5 className="m-0">Other Sources</h5>
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" size="sm" onClick={() => addOther("other")}>
                + Add Other
              </Button>
              <Button variant="outline-success" size="sm" onClick={() => addOther("green")}>
                + Add Green (Absorption)
              </Button>
            </div>
          </div>

          {others.map((o, i) => (
            <Row key={i} className="mb-2 mt-2 align-items-end">
              <Col md={6}>
                <Form.Label className="small text-muted">Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder={o.type === "green" ? "Ex: Trees planted / Solar / Compost" : "Ex: Generator / Water / Other"}
                  value={o.title}
                  onChange={(e) => handleOtherChange(i, "title", e.target.value)}
                  required
                />
              </Col>
              <Col md={4}>
                <Form.Label className="small text-muted">CO₂ (kg)</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={o.co2}
                  onChange={(e) => handleOtherChange(i, "co2", e.target.value)}
                  required
                />
              </Col>
              <Col md={2}>
                <Form.Label className="small text-muted">Type</Form.Label>
                <Form.Control
                  type="text"
                  value={o.type}
                  disabled
                />
              </Col>
              <Col md={12} className="mt-2">
                <Button variant="outline-danger" size="sm" onClick={() => removeOther(i)}>
                  Remove
                </Button>
              </Col>
            </Row>
          ))}

          <Form.Group className="mb-3 mt-3">
            <Form.Label>Remarks</Form.Label>
            <Form.Control as="textarea" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          </Form.Group>

          <Button type="submit" variant="success" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </Form>

        {message && <p className="mt-3">{message}</p>}

        {result && (
          <Card className="mt-3 p-3 bg-light">
            <h5>Net Carbon: {result.net.toFixed(0)} kg</h5>
            <p className="mb-0">{result.comment}</p>
          </Card>
        )}
      </Card>
    </motion.div>
  );
}