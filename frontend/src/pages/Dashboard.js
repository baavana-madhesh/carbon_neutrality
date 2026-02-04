import { useState, useEffect } from "react";
import axios from "axios";
import { Card, Button } from "react-bootstrap";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

const COLORS = ["#00bfa5", "#ffb74d", "#f44336"]; // Low, Medium, High

export default function Dashboard() {
  const [entries, setEntries] = useState([]);
  const [view, setView] = useState("month"); // "month" | "year" | "category"

  // Fetch all carbon entries
  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get("http://localhost:5000/api/carbon/history", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setEntries(res.data.entries || []);
    };
    fetchData();
  }, []);

  // Calculate total carbon
  const totalCarbon = entries.reduce((sum, e) => sum + e.netCarbon, 0);

  // Status & benchmark
  const status = totalCarbon <= 1000 ? "Low" : totalCarbon <= 5000 ? "Medium" : "High";
  const benchmark = totalCarbon <= 5000 ? "Good" : "Needs Improvement";

  // Prepare chart data
  const chartDataMonth = [];
  const chartDataYear = [];
  const chartDataCategory = [];

  entries.forEach(e => {
    if (view === "month") {
      chartDataMonth.push({
        name: e.month + "-" + e.year,
        carbon: e.netCarbon
      });
    }
    if (view === "year") {
      const existing = chartDataYear.find(y => y.name === e.year);
      if (existing) existing.carbon += e.netCarbon;
      else chartDataYear.push({ name: e.year, carbon: e.netCarbon });
    }
    if (view === "category") {
  e.sources.forEach(s => {
    const name = s.title || s.type; // use title if exists, else type
    const existing = chartDataCategory.find(c => c.name === name);
    if (existing) {
      existing.value += s.co2; // add CO2
    } else {
      chartDataCategory.push({ name: name, value: s.co2 });
    }
  });
}

  });

  return (
    <motion.div className="container mt-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2 className="mb-4">Dashboard</h2>

      {/* Summary Cards */}
      <div className="d-flex flex-wrap gap-3 mb-4">
        <Card className="p-3 shadow-sm flex-fill" style={{ minWidth: "200px", background: "linear-gradient(90deg,#00bfa5,#1de9b6)", color: "white" }}>
          <h5>Total Carbon Score</h5>
          <h3>{totalCarbon} kg CO₂</h3>
        </Card>
        <Card className="p-3 shadow-sm flex-fill" style={{ minWidth: "200px", background: status==="Low"?"#00c853":status==="Medium"?"#ffab00":"#d50000", color: "white" }}>
          <h5>Status</h5>
          <h3>{status}</h3>
        </Card>
        <Card className="p-3 shadow-sm flex-fill" style={{ minWidth: "200px", background: "#26c6da", color: "white" }}>
          <h5>Benchmark Result</h5>
          <h3>{benchmark}</h3>
        </Card>
      </div>

      {/* Toggle Buttons */}
      <div className="mb-3">
        <Button variant={view==="month"?"success":"outline-success"} className="me-2" onClick={()=>setView("month")}>Month</Button>
        <Button variant={view==="year"?"success":"outline-success"} className="me-2" onClick={()=>setView("year")}>Year</Button>
        <Button variant={view==="category"?"success":"outline-success"} onClick={()=>setView("category")}>Category</Button>
      </div>

      {/* Charts */}
      <div style={{ width: "100%", height: 400 }}>
        {view==="month" || view==="year" ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={view==="month"?chartDataMonth:chartDataYear} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="carbon" stroke="#00bfa5" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartDataCategory} dataKey="value" nameKey="name" outerRadius={120} fill="#8884d8" label>
                {chartDataCategory.map((entry, index) => <Cell key={index} fill={COLORS[index%COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
