import React from "react";
import { motion } from "framer-motion";

const Card = ({ title, value, color }) => (
  <motion.div
    className={`card dashboard-card text-center ${color ? color : ""} mb-3`}
    style={{
      minWidth: "150px",
    }}
    whileHover={{
      scale: 1.05,
    }}
    transition={{
      duration: 0.28,
    }}
  >
    <div className="card-body">
      <h5 className="card-title"> {title} </h5>{" "}
      <p className="card-text fs-4"> {value} </p>{" "}
    </div>{" "}
  </motion.div>
);

export default Card;
