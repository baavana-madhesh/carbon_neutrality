import { useMemo, useState, useEffect } from "react";
import axios from "axios";
import { Card, Button, Row, Col, Badge } from "react-bootstrap";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import "./Dashboard.css";
import { FaLeaf, FaTree, FaIndustry, FaRecycle } from "react-icons/fa";
const COLORS = ["#00bfa5", "#ffb74d", "#f44336", "#42a5f5", "#ab47bc", "#7e57c2"];

export default function Dashboard() {
  const [entries, setEntries] = useState([]);
  const [view, setView] = useState("month"); // "month" | "year" | "category"
  const [loading, setLoading] = useState(false);

  // Fetch all carbon entries
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/carbon/history`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setEntries(res.data.entries || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helpers
  const treesRequired = (netCarbon) => Math.max(0, Math.ceil(Number(netCarbon || 0) / 21));

  // Sort entries by date (use entry.date if exists else createdAt)
  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      const da = new Date(a.date || a.createdAt || 0).getTime();
      const db = new Date(b.date || b.createdAt || 0).getTime();
      return da - db;
    });
  }, [entries]);

  // Totals
  const totals = useMemo(() => {
    const totalEmission = entries.reduce((sum, e) => sum + Number(e.totalEmission || 0), 0);
    const totalAbsorption = entries.reduce((sum, e) => sum + Number(e.totalAbsorption || 0), 0);
    const totalNet = entries.reduce((sum, e) => sum + Number(e.netCarbon || 0), 0);
    const totalTrees = entries.reduce((sum, e) => sum + treesRequired(e.netCarbon), 0);

    return { totalEmission, totalAbsorption, totalNet, totalTrees };
  }, [entries]);

  // Status & benchmark (based on total net)
  const status = totals.totalNet <= 1000 ? "Low" : totals.totalNet <= 5000 ? "Medium" : "High";
  const benchmark = totals.totalNet <= 5000 ? "Good" : "Needs Improvement";
  const statusVariant = status === "Low" ? "success" : status === "Medium" ? "warning" : "danger";

  // Month-to-month change (latest vs previous)
  const monthDelta = useMemo(() => {
    if (sortedEntries.length < 2) return null;
    const last = Number(sortedEntries[sortedEntries.length - 1].netCarbon || 0);
    const prev = Number(sortedEntries[sortedEntries.length - 2].netCarbon || 0);
    if (prev === 0) return { pct: null, direction: last > prev ? "up" : "down", last, prev };
    const pct = ((last - prev) / Math.abs(prev)) * 100;
    return { pct, direction: pct > 0 ? "up" : "down", last, prev };
  }, [sortedEntries]);

  // Chart data (always build clean arrays)
  const chartDataMonth = useMemo(() => {
    // group by month-year (keep chronological by using sortedEntries order)
    const map = new Map();
    sortedEntries.forEach((e) => {
      const key = `${e.month}-${e.year}`;
      map.set(key, (map.get(key) || 0) + Number(e.netCarbon || 0));
    });
    return Array.from(map.entries()).map(([name, carbon]) => ({ name, carbon }));
  }, [sortedEntries]);

  const chartDataYear = useMemo(() => {
    const map = new Map();
    sortedEntries.forEach((e) => {
      const y = String(e.year);
      map.set(y, (map.get(y) || 0) + Number(e.netCarbon || 0));
    });
    return Array.from(map.entries()).map(([name, carbon]) => ({ name, carbon }));
  }, [sortedEntries]);

  const chartDataCategory = useMemo(() => {
    const map = new Map();
    entries.forEach((e) => {
      (e.sources || []).forEach((s) => {
        const name = s.title || s.type || "Unknown";
        map.set(name, (map.get(name) || 0) + Number(s.co2 || 0));
      });
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // top 10 categories
  }, [entries]);
const insights = useMemo(() => {
  if (!chartDataCategory.length) return null;

  const top = chartDataCategory[0];
  const total = chartDataCategory.reduce((s, x) => s + Number(x.value || 0), 0) || 1;
  const pct = ((top.value / total) * 100).toFixed(1);

  const name = String(top.name || "").toLowerCase();

  let tips = [];
  if (name.includes("electric") || name.includes("diesel") || name.includes("petrol")) {
    tips = [
      "Switch to LED lighting + turn off idle loads (fans/labs).",
      "Schedule heavy usage to off-peak and maintain equipment efficiency.",
      "Consider solar rooftop for base-load electricity.",
    ];
  } else if (name.includes("bus") || name.includes("car") || name.includes("transport")) {
    tips = [
      "Promote carpooling / shuttle optimization and reduce empty trips.",
      "Encourage cycling / walking for short distance movement.",
      "Maintain vehicles + optimize routes to cut fuel burn.",
    ];
  } else if (name.includes("paper") || name.includes("waste") || name.includes("organic")) {
    tips = [
      "Improve segregation (paper/organic) and reduce contamination.",
      "Compost organic waste and partner with recyclers for paper.",
      "Run awareness drives to cut unnecessary printing.",
    ];
  } else {
    tips = [
      "Reduce this source by 10–20% with process optimization.",
      "Track usage weekly and set a reduction target.",
      "Assign ownership (block-wise) to control and monitor.",
    ];
  }

  const trees = Math.max(0, Math.ceil(Number(totals.totalNet || 0) / 21));

  return {
    topName: top.name,
    topValue: Number(top.value || 0).toFixed(0),
    pct,
    tips,
    trees,
  };
}, [chartDataCategory, totals.totalNet]);
  return (
  <motion.div className="dashboard-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <div className="container pt-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h2 className="m-0">Dashboard</h2>
          <div className="subtle">Track emissions, absorption and neutralization progress</div>
        </div>
        <span className="badge-soft px-3 py-2 rounded-pill">
          Status: {status} • Benchmark: {benchmark}
        </span>
      </div>

      {/* KPI CARDS */}
      <Row className="g-3 mb-3">
        <Col md={3}>
          <Card className="kpi-card">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div className="kpi-title">Total Emission</div>
                <FaIndustry />
              </div>
              <p className="kpi-value">{totals.totalEmission.toFixed(0)} kg</p>
              <div className="subtle small">All entries</div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="kpi-card">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div className="kpi-title">Total Absorption</div>
                <FaLeaf />
              </div>
              <p className="kpi-value">{totals.totalAbsorption.toFixed(0)} kg</p>
              <div className="subtle small">Green sources</div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="kpi-card">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div className="kpi-title">Net Carbon</div>
                <FaRecycle />
              </div>
              <p className="kpi-value">{totals.totalNet.toFixed(0)} kg</p>
              <div className="subtle small">
                {monthDelta ? (
                  <>
                    Latest vs Prev:{" "}
                    <span className={monthDelta.direction === "up" ? "text-danger fw-bold" : "text-success fw-bold"}>
                      {monthDelta.pct === null ? "—" : `${monthDelta.pct.toFixed(1)}%`}
                      {monthDelta.direction === "up" ? " ↑" : " ↓"}
                    </span>
                  </>
                ) : (
                  "Add at least 2 entries"
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="kpi-card">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div className="kpi-title">Trees Needed</div>
                <FaTree />
              </div>
              <p className="kpi-value">{totals.totalTrees}</p>
              <div className="subtle small">@ 21kg CO₂/tree/year</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* CHART PANEL */}
      <Card className="panel mb-3">
        <Card.Body>
          <div className="panel-header mb-2">
            <div>
              <div className="fw-semibold">
                {view === "month"
                  ? "Monthly Net Carbon Trend"
                  : view === "year"
                  ? "Yearly Net Carbon Trend"
                  : "Top Emission Categories"}
              </div>
              <div className="subtle small">{loading ? "Loading..." : `${entries.length} record(s)`}</div>
            </div>

            <div className="btn-group segment">
              <button
                className={`btn btn-sm ${view === "month" ? "btn-success" : "btn-outline-success"}`}
                onClick={() => setView("month")}
              >
                Month
              </button>
              <button
                className={`btn btn-sm ${view === "year" ? "btn-success" : "btn-outline-success"}`}
                onClick={() => setView("year")}
              >
                Year
              </button>
              <button
                className={`btn btn-sm ${view === "category" ? "btn-success" : "btn-outline-success"}`}
                onClick={() => setView("category")}
              >
                Category
              </button>
            </div>
          </div>

          <div style={{ width: "100%", height: 380 }}>
            {view === "month" || view === "year" ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={view === "month" ? chartDataMonth : chartDataYear}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="carbon" stroke="#00bfa5" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartDataCategory} dataKey="value" nameKey="name" outerRadius={130} label>
                    {chartDataCategory.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* INSIGHTS */}
      {insights && (
        <Row className="g-3">
          <Col md={8}>
            <Card className="panel h-100">
              <Card.Body>
                <div className="fw-semibold mb-1">Carbon Insights</div>
                <div className="subtle small mb-3">
                  Top contributor: <span className="fw-bold">{insights.topName}</span> ({insights.topValue} kg, {insights.pct}%)
                </div>
                <ul className="insight-list mb-0">
                  {insights.tips.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="panel h-100">
              <Card.Body>
                <div className="fw-semibold mb-1">Offset Snapshot</div>
                <div className="subtle small">Trees to neutralize current total net</div>
                <div className="display-6 fw-bold mt-2">{insights.trees}</div>
                <div className="subtle small">@ 21kg CO₂/tree/year</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  </motion.div>
);
}