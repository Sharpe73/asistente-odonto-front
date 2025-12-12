import { useState } from "react";
import axios from "axios";

export default function AdminPanel() {
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    if (!archivo) {
      setMensaje("Debes seleccionar un archivo PDF");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setMensaje("No estás autenticado. Inicia sesión nuevamente.");
      return;
    }

    const formData = new FormData();
    formData.append("archivo", archivo);

    try {
      setLoading(true);

      const res = await axios.post(
        "https://asistente-odonto-production.up.railway.app/documentos/subir",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMensaje("✅ PDF subido correctamente");
      setArchivo(null);

    } catch (error) {
      setMensaje(
        error.response?.data?.mensaje || "Error al subir el PDF"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "80px auto", textAlign: "center" }}>
      <h2>Panel Admin – Subir PDF</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setArchivo(e.target.files[0])}
        />

        <br /><br />

        <button type="submit" disabled={loading}>
          {loading ? "Subiendo..." : "Subir PDF"}
        </button>
      </form>

      {mensaje && <p>{mensaje}</p>}
    </div>
  );
}
