import { useState } from "react";
import axios from "axios";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    try {
      const res = await axios.post(
        "https://TU_BACKEND_RAILWAY_URL/auth/login",
        { usuario, password }
      );

      // guardamos token
      localStorage.setItem("token", res.data.token);

      setMensaje("Login correcto ✔");
    } catch (error) {
      setMensaje(
        error.response?.data?.mensaje || "Error al iniciar sesión"
      );
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "80px auto" }}>
      <h2>Login Admin</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
        />

        <br /><br />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <br /><br />

        <button type="submit">Entrar</button>
      </form>

      {mensaje && <p>{mensaje}</p>}
    </div>
  );
}
