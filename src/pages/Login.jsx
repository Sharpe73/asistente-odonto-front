import { useState } from "react";
import axios from "axios";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setLoading(true);

    try {
      const res = await axios.post(
        "https://asistente-odonto-production.up.railway.app/auth/login",
        {
          usuario,
          password,
        }
      );

      // ✅ Guardar token JWT
      localStorage.setItem("token", res.data.token);

      setMensaje("Login correcto ✔ Redirigiendo...");

      // ✅ Redirigir al panel admin
      setTimeout(() => {
        window.location.href = "/admin";
      }, 800);

    } catch (error) {
      setMensaje(
        error.response?.data?.mensaje || "Error al iniciar sesión"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", textAlign: "center" }}>
      <h2>Login Admin</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
          style={{ width: "100%", padding: 8 }}
        />

        <br /><br />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: 8 }}
        />

        <br /><br />

        <button type="submit" disabled={loading}>
          {loading ? "Ingresando..." : "Entrar"}
        </button>
      </form>

      {mensaje && <p>{mensaje}</p>}
    </div>
  );
}
