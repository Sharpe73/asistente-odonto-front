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

      {/* CONTEXTO */}
      <div style={styles.context}>
        Desde este panel puedes gestionar los documentos oficiales que alimentan
        el conocimiento del asistente Odonto.bot.
      </div>

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
  );
}

/* =========================
   🎨 ESTILOS PROFESIONALES
========================= */

const styles = {
  page: {
    backgroundColor: "#F3F4F6",
    minHeight: "100vh",
    padding: 24,
    fontFamily: "Inter, Arial, sans-serif",
    color: "#374151",
  },

  header: {
    backgroundColor: "#FFFFFF",
    padding: "14px 22px",
    borderRadius: 8,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    border: "1px solid #E5E7EB",
  },

  title: {
    margin: 0,
    fontSize: 22,
    fontWeight: 600,
    color: "#0033A0",
  },

  subtitle: {
    margin: 0,
    fontSize: 13,
    color: "#6B7280",
  },

  logoutBtn: {
    backgroundColor: "transparent",
    color: "#6B7280",
    border: "1px solid #D1D5DB",
    padding: "8px 14px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
  },

  context: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 18,
  },

  primaryCard: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 10,
    marginBottom: 28,
    borderLeft: "5px solid #0033A0",
  },

  secondaryCard: {
    backgroundColor: "#FFFFFF",
    padding: 22,
    borderRadius: 10,
  },

  cardTitle: {
    margin: "0 0 8px 0",
    fontSize: 18,
    fontWeight: 600,
  },

  cardDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },

  fileInput: {
    display: "block",
    marginBottom: 14,
  },

  primaryBtn: {
    backgroundColor: "#0033A0",
    color: "#FFFFFF",
    border: "none",
    padding: "10px 20px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
  },

  message: {
    marginTop: 14,
    fontWeight: 500,
  },

  progressBar: {
    height: 8,
    width: "100%",
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#0033A0",
    transition: "width 0.3s ease",
  },

  progressText: {
    marginTop: 6,
    fontSize: 12,
    color: "#6B7280",
  },
};
