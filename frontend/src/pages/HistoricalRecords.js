import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Form, Button, Row, Col } from "react-bootstrap";

export default function HistoricalRecords() {
  const [records, setRecords] = useState([]);
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [message, setMessage] = useState("");

  // Fetch all carbon history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/carbon/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecords(res.data.entries || []);
      } catch (err) {
        console.error(err);
        setMessage("Failed to load records");
      }
    };
    fetchHistory();
  }, []);

  // Format date as DD/MM/YYYY
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Filter records by month/year
  const filteredRecords = records.filter((r) => {
    if (yearFilter && r.year !== Number(yearFilter)) return false;
    if (monthFilter && r.month !== monthFilter) return false;
    return true;
  });

  // Download CSV: filterType = "month" | "year"
  const downloadCSV = (filterType) => {
    let dataToDownload = [];

    if (filterType === "month") {
      if (!monthFilter || !yearFilter) {
        alert("Please select both month and year for monthly report!");
        return;
      }
      dataToDownload = records.filter(
        r => r.month === monthFilter && r.year === Number(yearFilter)
      );
    } else if (filterType === "year") {
      if (!yearFilter) {
        alert("Please select a year for yearly report!");
        return;
      }
      dataToDownload = records.filter(
        r => r.year === Number(yearFilter)
      );
    }

    if (dataToDownload.length === 0) {
      alert("No records found for the selected filter!");
      return;
    }

    // Flatten sources
    const csvRows = [
      ["Date", "Month", "Year", "Campus Block", "Source", "CO2 (kg)", "Remarks"]
    ];

    dataToDownload.forEach((r) => {
      r.sources.forEach((s) => {
        csvRows.push([
          formatDate(r.date),
          r.month,
          r.year,
          r.campusBlock,
          s.title,
          s.co2,
          r.remarks || ""
        ]);
      });
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `carbon_history_${filterType}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  // Unique months and years for filters
  const months = [...new Set(records.map(r => r.month))];
  const years = [...new Set(records.map(r => r.year))];

  return (
    <div className="container mt-4">
      <motion.h2 className="mb-4 text-center" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        Historical Records
      </motion.h2>

      <Form className="mb-3">
        <Row className="align-items-end">
          <Col md={4}>
            <Form.Label>Month Filter</Form.Label>
            <Form.Select value={monthFilter} onChange={e => setMonthFilter(e.target.value)}>
              <option value="">All Months</option>
              {months.map((m, i) => <option key={i} value={m}>{m}</option>)}
            </Form.Select>
          </Col>
          <Col md={4}>
            <Form.Label>Year Filter</Form.Label>
            <Form.Select value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
              <option value="">All Years</option>
              {years.map((y, i) => <option key={i} value={y}>{y}</option>)}
            </Form.Select>
          </Col>
          <Col md={4}>
            <Button variant="info" className="me-2" onClick={() => downloadCSV("month")}>
              Download Monthly
            </Button>
            <Button variant="success" onClick={() => downloadCSV("year")}>
              Download Yearly
            </Button>
          </Col>
        </Row>
      </Form>

      {filteredRecords.length === 0 ? (
        <div className="card p-4 shadow text-center">
          <p>No historical records found.</p>
        </div>
      ) : (
        <div className="card p-4 shadow">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Date</th>
                <th>Month</th>
                <th>Year</th>
                <th>Campus Block</th>
                <th>Source</th>
                <th>CO₂ (kg)</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r) =>
                r.sources.map((s, i) => (
                  <tr key={`${r._id}-${i}`}>
                    <td>{formatDate(r.date)}</td>
                    <td>{r.month}</td>
                    <td>{r.year}</td>
                    <td>{r.campusBlock}</td>
                    <td>{s.title}</td>
                    <td>{s.co2}</td>
                    <td>{r.remarks}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {message && <p className="mt-3 text-danger">{message}</p>}
    </div>
  );
}
