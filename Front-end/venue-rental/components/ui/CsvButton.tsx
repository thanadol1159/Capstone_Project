import { useState } from "react";
import axios from "axios";
import { apiJson } from "@/hook/api";

export default function ExportCSVButton() {
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setFileUrl(null);

    try {
      const response = await axios.get(
        "http://localhost:8080/api/export-venues/"
      );
      if (response.data.file_url) {
        setFileUrl(`http://localhost:8080${response.data.file_url}`);
      }
    } catch (error) {
      console.error("Error exporting CSV:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleExport}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? "Generating..." : "Export CSV"}
      </button>
    </div>
  );
}
