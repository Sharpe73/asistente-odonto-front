import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ChatBot from "./components/ChatBot";
import Login from "./pages/Login";
import AdminPanel from "./pages/AdminPanel";
import PrivateRoute from "./components/PrivateRoute";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<ChatBot />} />
      <Route path="/login" element={<Login />} />

      {/* 🔒 Ruta protegida */}
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <AdminPanel />
          </PrivateRoute>
        }
      />
    </Routes>
  </BrowserRouter>
);
