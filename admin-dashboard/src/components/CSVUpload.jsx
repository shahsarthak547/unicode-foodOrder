import { uploadCSV } from "../api/adminAPI";
import { useAuth } from "../auth/AuthContext";

export default function CSVUpload({ onSuccess }) {
  const { token } = useAuth();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    await uploadCSV(file, token);
    alert("CSV uploaded successfully");
    onSuccess();
  };

  return (
    <input type="file" accept=".csv" onChange={handleUpload} />
  );
}
