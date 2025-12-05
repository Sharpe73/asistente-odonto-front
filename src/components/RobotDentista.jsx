import React from "react";
import { Box } from "@mui/material";

const RobotDentista = () => {
  return (
    <Box
      sx={{
        position: "absolute",
        top: 20,
        right: 20,
        width: 160,
        zIndex: 20,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <img
        src="/robot-dentista.png"
        alt="Robot Dentista"
        style={{ width: "100%", height: "auto" }}
      />
    </Box>
  );
};

export default RobotDentista;
