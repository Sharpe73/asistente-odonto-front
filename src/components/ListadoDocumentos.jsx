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
    <div style={{ marginTop: 40 }}>
      <h3>Documentos subidos</h3>

      {documentos.length === 0 ? (
        <p>No hay documentos registrados</p>
      ) : (
        <ul>
          {documentos.map((doc) => (
            <li key={doc.id}>
              <strong>{doc.nombre_original}</strong>
              <br />
              Subido por: {doc.subido_por}
              <br />
              Fecha: {new Date(doc.creado_en).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
