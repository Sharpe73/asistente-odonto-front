import { useEffect, useState } from "react";
import axios from "axios";

export default function ListadoDocumentos() {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 paginado
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // modal
  const [modal, setModal] = useState({
    visible: false,
    tipo: "info",
    mensaje: "",
    onConfirm: null,
  });

  const token = localStorage.getItem("token");

  // ===============================
  // 📄 CARGAR DOCUMENTOS (PAGINADO)
  // ===============================
  const cargarDocumentos = async (pagina = 1) => {
    if (!token) {
      mostrarModal("error", "Sesión no válida. Vuelve a iniciar sesión.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const res = await axios.get(
        `https://asistente-odonto-production.up.railway.app/documentos/listar?page=${pagina}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setDocumentos(res.data.documentos || []);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
      setPage(res.data.page || pagina);
    } catch (error) {
      mostrarModal(
        "error",
        error.response?.data?.mensaje || "Error al cargar documentos"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDocumentos(page);
    // eslint-disable-next-line
  }, [page]);

  // ===============================
  // 🗑️ ELIMINAR DOCUMENTO
  // ===============================
  const eliminarDocumento = async (id) => {
    try {
      await axios.delete(
        `https://asistente-odonto-production.up.railway.app/documentos/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      mostrarModal("success", "Documento eliminado correctamente ✔");
      cargarDocumentos(page);
    } catch (error) {
      mostrarModal(
        "error",
        error.response?.data?.mensaje || "Error al eliminar el documento"
      );
    }
  };

  // ===============================
  // 🪟 MODAL HELPERS
  // ===============================
  const mostrarModal = (tipo, mensaje, onConfirm = null) => {
    setModal({ visible: true, tipo, mensaje, onConfirm });
  };

  const cerrarModal = () => {
    setModal({ visible: false, tipo: "info", mensaje: "", onConfirm: null });
  };

  // ===============================
  // 🖼️ RENDER
  // ===============================
  if (loading) {
    return <p style={styles.info}>Cargando documentos...</p>;
  }

  if (documentos.length === 0) {
    return <p style={styles.info}>No hay documentos registrados</p>;
  }

  const desde = (page - 1) * limit + 1;
  const hasta = Math.min(page * limit, total);

  return (
    <>
      <div style={{ marginTop: 20, overflowX: "auto" }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Nombre</th>
              <th style={styles.th}>Subido por</th>
              <th style={styles.th}>Fecha</th>
              <th style={{ ...styles.th, textAlign: "right" }}>Tamaño</th>
              <th style={{ ...styles.th, textAlign: "center" }}>Acciones</th>
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
                <td style={{ ...styles.td, textAlign: "center" }}>
                  <button
                    style={styles.deleteBtn}
                    onClick={() =>
                      mostrarModal(
                        "confirm",
                        `¿Seguro que deseas eliminar "${doc.nombre_original}"?`,
                        () => eliminarDocumento(doc.id)
                      )
                    }
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔹 CONTADOR */}
      <p style={styles.counter}>
        Mostrando {desde}–{hasta} de {total} documentos
      </p>

      {/* ===============================
          🔢 PAGINADO
      =============================== */}
      <div style={styles.pagination}>
        <button
          style={styles.pageBtn}
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          ← Anterior
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            style={{
              ...styles.pageNumber,
              backgroundColor: p === page ? "#0033A0" : "#F3F4F6",
              color: p === page ? "#FFFFFF" : "#1F2937",
            }}
          >
            {p}
          </button>
        ))}

        <button
          style={styles.pageBtn}
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Siguiente →
        </button>
      </div>

      {/* ===============================
          🪟 MODAL
      =============================== */}
      {modal.visible && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>
              {modal.tipo === "confirm"
                ? "Confirmar acción"
                : modal.tipo === "success"
                ? "Operación exitosa"
                : modal.tipo === "error"
                ? "Error"
                : "Información"}
            </h3>

            <p style={styles.modalMessage}>{modal.mensaje}</p>

            <div style={styles.modalActions}>
              {modal.tipo === "confirm" ? (
                <>
                  <button style={styles.modalCancel} onClick={cerrarModal}>
                    Cancelar
                  </button>
                  <button
                    style={styles.modalConfirm}
                    onClick={() => {
                      modal.onConfirm();
                      cerrarModal();
                    }}
                  >
                    Eliminar
                  </button>
                </>
              ) : (
                <button style={styles.modalConfirm} onClick={cerrarModal}>
                  Aceptar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
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
    backgroundColor: "#0033A0",
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
  deleteBtn: {
    backgroundColor: "#E4002B",
    color: "#FFFFFF",
    border: "none",
    padding: "6px 12px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 13,
  },
  info: {
    marginTop: 10,
    fontStyle: "italic",
    color: "#666",
  },
  counter: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 14,
    color: "#4B5563",
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
  },
  pageBtn: {
    padding: "6px 12px",
    borderRadius: 6,
    border: "1px solid #D1D5DB",
    backgroundColor: "#FFFFFF",
    cursor: "pointer",
  },
  pageNumber: {
    padding: "6px 12px",
    borderRadius: 6,
    border: "1px solid #D1D5DB",
    cursor: "pointer",
    fontWeight: 500,
  },

  /* MODAL */
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 24,
    width: "90%",
    maxWidth: 420,
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  },
  modalTitle: {
    marginTop: 0,
    marginBottom: 12,
    color: "#0033A0",
  },
  modalMessage: {
    marginBottom: 20,
    color: "#333",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },
  modalCancel: {
    backgroundColor: "#CCCCCC",
    border: "none",
    padding: "8px 14px",
    borderRadius: 4,
    cursor: "pointer",
  },
  modalConfirm: {
    backgroundColor: "#0033A0",
    color: "#FFFFFF",
    border: "none",
    padding: "8px 14px",
    borderRadius: 4,
    cursor: "pointer",
  },
};
