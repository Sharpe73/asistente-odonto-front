import { useEffect, useState } from "react";
import axios from "axios";

export default function ListadoDocumentos() {
  const [documentos, setDocumentos] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDocumentos = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setMensaje("No estás autenticado");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          "https://asistente-odonto-production.up.railway.app/documentos/listar",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setDocumentos(res.data.documentos || []);
      } catch (error) {
        setMensaje(
          error.response?.data?.mensaje || "Error al cargar documentos"
        );
      } finally {
        setLoading(false);
      }
    };

    cargarDocumentos();
  }, []);

  if (loading) {
    return <p style={styles.info}>Cargando documentos...</p>;
  }

  if (mensaje) {
    return <p style={styles.error}>{mensaje}</p>;
  }

  if (documentos.length === 0) {
    return <p style={styles.info}>No hay documentos registrados</p>;
  }

  return (
    <div style={{ marginTop: 20, overflowX: "auto" }}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Nombre</th>
            <th style={styles.th}>Subido por</th>
            <th style={styles.th}>Fecha</th>
            <th style={{ ...styles.th, textAlign: "right" }}>Tamaño</th>
          </tr>
        </thead>

        <tbody>
          {documentos.map((doc) => (
            <tr key={doc.id} style={styles.tr}>
              <td style={styles.td}>{doc.nombre_original}</td>
              <td style={styles.td}>{doc.subido_por}</td>
              <td style={styles.td}>
                {new Date(doc.creado_en).toLocaleDateString("es-CL")}
              </td>
              <td style={{ ...styles.td, textAlign: "right" }}>
                {(doc.tamano / 1024 / 1024).toFixed(2)} MB
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* =======================
   🎨 ESTILOS
======================= */

const styles = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    overflow: "hidden",
  },
  th: {
    backgroundColor: "#0033A0", // Azul U. de Chile
    color: "#FFFFFF",
    padding: "12px 14px",
    textAlign: "left",
    fontSize: 14,
    fontWeight: "bold",
  },
  td: {
    padding: "12px 14px",
    borderBottom: "1px solid #E6E6E6",
    fontSize: 14,
    color: "#333",
  },
  tr: {
    transition: "background-color 0.2s",
  },
  info: {
    marginTop: 10,
    fontStyle: "italic",
    color: "#666",
  },
  error: {
    marginTop: 10,
    color: "#E4002B",
    fontWeight: "bold",
  },
};
