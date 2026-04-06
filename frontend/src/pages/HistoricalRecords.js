import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Form, Button, Row, Col, Card, Badge, Spinner } from "react-bootstrap";

export default function HistoricalRecords() {
  const [records, setRecords] = useState([]);
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch all carbon history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/carbon/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecords(res.data.entries || []);
      } catch (err) {
        console.error(err);
        setMessage("Failed to load records");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Safe date formatter
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const treesRequired = (netCarbon) => Math.max(0, Math.ceil(Number(netCarbon || 0) / 21));

  // Filter records by month/year
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (yearFilter && r.year !== Number(yearFilter)) return false;
      if (monthFilter && r.month !== monthFilter) return false;
      return true;
    });
  }, [records, monthFilter, yearFilter]);

  // Unique months and years for filters
  const months = useMemo(() => [...new Set(records.map((r) => r.month))].filter(Boolean), [records]);
  const years = useMemo(() => [...new Set(records.map((r) => r.year))].filter(Boolean).sort((a, b) => b - a), [records]);

  // Quick stats for header
  const stats = useMemo(() => {
    const totalNet = filteredRecords.reduce((s, r) => s + Number(r.netCarbon || 0), 0);
    const totalEmission = filteredRecords.reduce((s, r) => s + Number(r.totalEmission || 0), 0);
    const totalAbs = filteredRecords.reduce((s, r) => s + Number(r.totalAbsorption || 0), 0);
    const totalTrees = filteredRecords.reduce((s, r) => s + treesRequired(r.netCarbon), 0);
    return { totalNet, totalEmission, totalAbs, totalTrees };
  }, [filteredRecords]);

  // Download CSV
  const downloadCSV = (filterType) => {
    let dataToDownload = [];

    if (filterType === "month") {
      if (!monthFilter || !yearFilter) {
        alert("Please select both month and year for monthly report!");
        return;
      }
      dataToDownload = records.filter(
        (r) => r.month === monthFilter && r.year === Number(yearFilter)
      );
    } else if (filterType === "year") {
      if (!yearFilter) {
        alert("Please select a year for yearly report!");
        return;
      }
      dataToDownload = records.filter((r) => r.year === Number(yearFilter));
    }

    if (dataToDownload.length === 0) {
      alert("No records found for the selected filter!");
      return;
    }

    const csvRows = [
      ["Date", "Month", "Year", "Campus Block", "Source", "CO2 (kg)", "Net Carbon", "Remarks"],
    ];

    dataToDownload.forEach((r) => {
      (r.sources || []).forEach((s) => {
        csvRows.push([
          formatDate(r.date || r.createdAt),
          r.month || "",
          r.year || "",
          r.campusBlock || "",
          s.title || s.type || "",
          s.co2 ?? "",
          r.netCarbon ?? "",
          r.remarks || "",
        ]);
      });
    });

    const csvContent =
      "data:text/csv;charset=utf-8," + csvRows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `carbon_history_${filterType}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const netBadge = (net) => {
    const n = Number(net || 0);
    if (n <= 1000) return <Badge bg="success">Low</Badge>;
    if (n <= 5000) return <Badge bg="warning" text="dark">Medium</Badge>;
    return <Badge bg="danger">High</Badge>;
  };

  return (
    <div className="container mt-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3"
      >
        <div>
          <h2 className="m-0">Historical Records</h2>
          <div className="text-muted small">Filter, review, and export carbon history</div>
        </div>

        <div className="d-flex gap-2">
          <Button variant="info" onClick={() => downloadCSV("month")}>
            Download Monthly
          </Button>
          <Button variant="success" onClick={() => downloadCSV("year")}>
            Download Yearly
          </Button>
        </div>
      </motion.div>

      {/* Filters + summary */}
      <Card className="shadow-sm border-0 mb-3" style={{ borderRadius: 16 }}>
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={4}>
              <Form.Label className="small text-muted">Month Filter</Form.Label>
              <Form.Select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
                <option value="">All Months</option>
                {months.map((m, i) => (
                  <option key={i} value={m}>
                    {m}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={4}>
              <Form.Label className="small text-muted">Year Filter</Form.Label>
              <Form.Select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
                <option value="">All Years</option>
                {years.map((y, i) => (
                  <option key={i} value={y}>
                    {y}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={4} className="text-md-end">
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setMonthFilter("");
                  setYearFilter("");
                }}
              >
                Clear Filters
              </Button>
            </Col>
          </Row>

          <hr className="my-3" />

          <Row className="g-3">
            <Col md={3}>
              <div className="text-muted small">Total Emission</div>
              <div className="fw-bold fs-5">{stats.totalEmission.toFixed(0)} kg</div>
            </Col>
            <Col md={3}>
              <div className="text-muted small">Total Absorption</div>
              <div className="fw-bold fs-5">{stats.totalAbs.toFixed(0)} kg</div>
            </Col>
            <Col md={3}>
              <div className="text-muted small">Total Net Carbon</div>
              <div className="fw-bold fs-5">{stats.totalNet.toFixed(0)} kg</div>
            </Col>
            <Col md={3}>
              <div className="text-muted small">Trees Needed</div>
              <div className="fw-bold fs-5">{stats.totalTrees}</div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Table */}
      <Card className="shadow-sm border-0" style={{ borderRadius: 16 }}>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <div className="text-muted mt-2">Loading records...</div>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-5">
              <div className="fw-semibold">No historical records found.</div>
              <div className="text-muted small">Try changing filters or add new entries.</div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle table-hover">
                <thead style={{ position: "sticky", top: 0, background: "white", zIndex: 1 }}>
                  <tr className="text-muted small">
                    <th>Date</th>
                    <th>Month</th>
                    <th>Year</th>
                    <th>Campus Block</th>
                    <th>Net</th>
                    <th>Status</th>
                    <th>Trees</th>
                    <th>Source</th>
                    <th>CO₂ (kg)</th>
                    <th>Remarks</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRecords.map((r) =>
                    (r.sources || []).map((s, i) => (
                      <tr key={`${r._id}-${i}`}>
                        <td className="fw-semibold">{formatDate(r.date || r.createdAt)}</td>
                        <td>{r.month}</td>
                        <td>{r.year}</td>
                        <td>{r.campusBlock}</td>
                        <td className="fw-semibold">{Number(r.netCarbon || 0).toFixed(0)}</td>
                        <td>{netBadge(r.netCarbon)}</td>
                        <td>{treesRequired(r.netCarbon)}</td>
                        <td>{s.title || s.type}</td>
                        <td>{Number(s.co2 || 0).toFixed(0)}</td>
                        <td className="text-muted">{r.remarks || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {message && <p className="mt-3 text-danger">{message}</p>}
        </Card.Body>
      </Card>
    </div>
  );
}