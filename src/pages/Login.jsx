import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setLoading(true);

    try {
      const res = await axios.post(
        "https://asistente-odonto-production.up.railway.app/auth/login",
        { usuario, password }
      );

      // ✅ Guardar token JWT
      localStorage.setItem("token", res.data.token);

      setMensaje("Acceso correcto ✔ Redirigiendo al panel administrativo...");

      setTimeout(() => {
        navigate("/admin");
      }, 900);

    } catch (error) {
      setMensaje(
        error.response?.data?.mensaje || "Credenciales inválidas"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>Odonto.bot</h1>
          <p style={styles.subtitle}>
            Acceso administrativo – Universidad de Chile
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Usuario</label>
          <input
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
            style={styles.input}
            placeholder="Ingresa tu usuario"
          />

          <label style={styles.label}>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
            placeholder="Ingresa tu contraseña"
          />

          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            disabled={loading}
          >
            {loading ? "Validando acceso..." : "Entrar"}
          </button>
        </form>

        {/* MENSAJE */}
        {mensaje && (
          <div
            style={{
              ...styles.message,
              backgroundColor: mensaje.includes("correcto")
                ? "#E6F0FF"
                : "#FDECEA",
              color: mensaje.includes("correcto")
                ? "#0033A0"
                : "#E4002B",
            }}
          >
            {mensaje}
          </div>
        )}
      </div>
    </div>
  );
}

/* =======================
   🎨 ESTILOS INSTITUCIONALES
======================= */

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#F5F7FA",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    fontFamily: "Arial, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: "30px 28px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
  header: {
    textAlign: "center",
    marginBottom: 25,
  },
  title: {
    margin: 0,
    fontSize: 30,
    color: "#0033A0", // Azul U. de Chile
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#555",
  },
  label: {
    display: "block",
    marginBottom: 6,
    marginTop: 16,
    fontWeight: "bold",
    fontSize: 13,
    color: "#333",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    fontSize: 14,
    borderRadius: 6,
    border: "1px solid #CCC",
    outline: "none",
  },
  button: {
    width: "100%",
    marginTop: 24,
    padding: "12px",
    fontSize: 15,
    fontWeight: "bold",
    color: "#FFFFFF",
    backgroundColor: "#0033A0",
    border: "none",
    borderRadius: 6,
  },
  message: {
    marginTop: 18,
    padding: "10px 12px",
    borderRadius: 6,
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 14,
  },
};
