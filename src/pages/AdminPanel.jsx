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
          onUploadProgress: (e) => {
            const porcentaje = Math.round((e.loaded * 100) / e.total);
            setProgreso(porcentaje);
          },
        }
      );

      setMensaje("Documento subido correctamente ✔");
      setArchivo(null);
      setTimeout(() => window.location.reload(), 900);
    } catch (error) {
      setMensaje(error.response?.data?.mensaje || "Error al subir el documento");
    } finally {
      setLoading(false);
      setTimeout(() => setProgreso(0), 1200);
    }
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Odonto.bot</h1>
          <p style={styles.subtitle}>
            Panel administrativo · Universidad de Chile
          </p>
        </div>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          Cerrar sesión
        </button>
      </header>

      {/* CONTENEDOR */}
      <div style={styles.container}>
        {/* CONTEXTO */}
        <p style={styles.context}>
          Desde este panel puedes gestionar los documentos oficiales que alimentan
          el conocimiento del asistente Odonto.bot.
        </p>

        {/* ACCIÓN PRINCIPAL */}
        <section style={styles.primaryCard}>
          <h3 style={styles.cardTitle}>Agregar documento PDF</h3>
          <p style={styles.cardDescription}>
            Sube documentos oficiales en formato PDF para incorporarlos al
            conocimiento del asistente.
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="file"
              accept="application/pdf"
              style={styles.fileInput}
              onChange={(e) => setArchivo(e.target.files[0])}
            />

            <button
              type="submit"
              style={styles.primaryBtn}
              disabled={loading}
            >
              {loading ? "Subiendo documento..." : "Subir documento"}
            </button>
          </form>

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
              <p style={styles.progressText}>{progreso}%</p>
            </div>
          )}

          {mensaje && <p style={styles.message}>{mensaje}</p>}
        </section>

        {/* LISTADO */}
        <section style={styles.secondaryCard}>
          <h3 style={styles.cardTitle}>Documentos cargados</h3>
          <ListadoDocumentos />
        </section>
      </div>
    </div>
  );
}

/* =========================
   🎨 ESTILOS INSTITUCIONALES
========================= */

const styles = {
  page: {
    backgroundColor: "#EEF1F5",
    minHeight: "100vh",
    fontFamily: "Inter, Arial, sans-serif",
    color: "#1F2937",
  },

  header: {
    backgroundColor: "#0033A0",
    padding: "22px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#FFFFFF",
    boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
  },

  title: {
    margin: 0,
    fontSize: 26,
    fontWeight: 600,
  },

  subtitle: {
    margin: 0,
    fontSize: 14,
    opacity: 0.9,
  },

  logoutBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    color: "#FFFFFF",
    border: "1px solid rgba(255,255,255,0.3)",
    padding: "10px 18px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
  },

  container: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "28px 24px",
  },

  context: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 22,
  },

  primaryCard: {
    backgroundColor: "#FFFFFF",
    padding: 28,
    borderRadius: 12,
    marginBottom: 32,
    borderLeft: "6px solid #0033A0",
    boxShadow: "0 8px 18px rgba(0,0,0,0.08)",
  },

  secondaryCard: {
    backgroundColor: "#FFFFFF",
    padding: 26,
    borderRadius: 12,
    boxShadow: "0 6px 14px rgba(0,0,0,0.06)",
  },

  cardTitle: {
    margin: "0 0 10px 0",
    fontSize: 20,
    fontWeight: 600,
  },

  cardDescription: {
    fontSize: 15,
    color: "#4B5563",
    marginBottom: 18,
  },

  fileInput: {
    display: "block",
    marginBottom: 16,
  },

  primaryBtn: {
    backgroundColor: "#0033A0",
    color: "#FFFFFF",
    border: "none",
    padding: "12px 26px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 15,
  },

  message: {
    marginTop: 16,
    fontWeight: 500,
  },

  progressBar: {
    height: 10,
    width: "100%",
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#0033A0",
    transition: "width 0.3s ease",
  },

  progressText: {
    marginTop: 6,
    fontSize: 13,
    color: "#4B5563",
  },
};
