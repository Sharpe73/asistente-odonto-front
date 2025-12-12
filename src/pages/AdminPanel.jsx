import { useState } from "react";
import axios from "axios";
import ListadoDocumentos from "../components/ListadoDocumentos";

export default function AdminPanel() {
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [progreso, setProgreso] = useState(0);

  // 🔐 LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setProgreso(0);

    if (!archivo) {
      setMensaje("Debes seleccionar un archivo PDF");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setMensaje("Sesión expirada. Inicia sesión nuevamente.");
      return;
    }

    const formData = new FormData();
    formData.append("archivo", archivo);

    try {
      setLoading(true);

      await axios.post(
        "https://asistente-odonto-production.up.railway.app/documentos/subir",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const porcentaje = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgreso(porcentaje);
          },
        }
      );

      setMensaje("Documento subido correctamente ✔");
      setArchivo(null);

      setTimeout(() => window.location.reload(), 800);
    } catch (error) {
      setMensaje(
        error.response?.data?.mensaje || "Error al subir el documento"
      );
    } finally {
      setLoading(false);
      setTimeout(() => setProgreso(0), 1000);
    }
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Odonto.bot</h1>
          <p style={styles.subtitle}>
            Panel administrativo – Universidad de Chile
          </p>
        </div>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          Cerrar sesión
        </button>
      </header>

      {/* BIENVENIDA */}
      <section style={styles.welcome}>
        <h2>Bienvenido al panel administrativo</h2>
        <p>
          Desde aquí puedes subir y administrar los documentos que alimentan el
          conocimiento del asistente Odonto.bot.
        </p>
      </section>

      {/* SUBIR PDF */}
      <section style={styles.card}>
        <h3>Subir nuevo documento PDF</h3>

        <form onSubmit={handleSubmit}>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setArchivo(e.target.files[0])}
          />

          <br /><br />

          <button type="submit" style={styles.primaryBtn} disabled={loading}>
            {loading ? "Subiendo documento..." : "Subir PDF"}
          </button>
        </form>

        {/* BARRA DE PROGRESO */}
        {loading && (
          <div style={{ marginTop: 20 }}>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${progreso}%`,
                }}
              />
            </div>
            <p style={{ marginTop: 8 }}>{progreso}%</p>
          </div>
        )}

        {mensaje && <p style={styles.message}>{mensaje}</p>}
      </section>

      {/* LISTADO */}
      <section style={styles.card}>
        <h3>Documentos cargados</h3>
        <ListadoDocumentos />
      </section>
    </div>
  );
}

/* =======================
   🎨 ESTILOS
======================= */

const styles = {
  page: {
    backgroundColor: "#F5F7FA",
    minHeight: "100vh",
    padding: 30,
    fontFamily: "Arial, sans-serif",
    color: "#444",
  },
  header: {
    backgroundColor: "#0033A0", // Azul U. de Chile
    color: "#FFFFFF",
    padding: "20px 30px",
    borderRadius: 8,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    margin: 0,
    fontSize: 28,
  },
  subtitle: {
    margin: 0,
    fontSize: 14,
    opacity: 0.9,
  },
  logoutBtn: {
    backgroundColor: "#E4002B", // Rojo U. de Chile
    color: "#FFFFFF",
    border: "none",
    padding: "10px 16px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "bold",
  },
  welcome: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  primaryBtn: {
    backgroundColor: "#0033A0",
    color: "#FFFFFF",
    border: "none",
    padding: "10px 18px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "bold",
  },
  message: {
    marginTop: 12,
    fontWeight: "bold",
  },
  progressBar: {
    height: 10,
    width: "100%",
    backgroundColor: "#E0E0E0",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#0033A0",
    transition: "width 0.3s ease",
  },
};
