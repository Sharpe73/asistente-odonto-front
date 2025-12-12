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

        setDocumentos(res.data.data || []);
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

  if (loading) return <p>Cargando documentos...</p>;
  if (mensaje) return <p>{mensaje}</p>;

  return (
    <div style={{ marginTop: 20, overflowX: "auto" }}>
      {documentos.length === 0 ? (
        <p>No hay documentos registrados</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Nombre</th>
              <th style={styles.th}>Subido por</th>
              <th style={styles.th}>Fecha</th>
              <th style={styles.th}>Tamaño</th>
            </tr>
          </thead>
          <tbody>
            {documentos.map((doc) => (
              <tr key={doc.id}>
                <td style={styles.td}>{doc.nombre_original}</td>
                <td style={styles.td}>{doc.subido_por}</td>
                <td style={styles.td}>
                  {new Date(doc.creado_en).toLocaleDateString()}
                </td>
                <td style={styles.td}>
                  {(doc.tamano / 1024 / 1024).toFixed(2)} MB
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
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
    marginTop: 10,
    backgroundColor: "#FFFFFF",
  },
  th: {
    backgroundColor: "#0033A0", 
    color: "#FFFFFF",
    padding: "10px",
    textAlign: "left",
    fontSize: 14,
  },
  td: {
    padding: "10px",
    borderBottom: "1px solid #E0E0E0",
    fontSize: 14,
  },
};
