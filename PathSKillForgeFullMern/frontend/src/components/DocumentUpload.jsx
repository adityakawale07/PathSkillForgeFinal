import React, { useState } from 'react';
import API from '../api';
import { UploadCloud, CheckCircle } from 'lucide-react';

export default function DocumentUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('pdf', file);

    setLoading(true);
    setError('');
    try {
      const res = await API.post('/documents/upload', formData);
      onUploadSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm text-center">
      <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <UploadCloud size={32} />
      </div>
      <h3 className="text-xl font-bold text-slate-800">Upload your Study PDF</h3>
      <p className="text-slate-500 text-sm mt-1">Upload lecture notes, textbooks, or research papers</p>

      {error && <div className="mt-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg">{error}</div>}

      <form onSubmit={handleUpload} className="mt-6 space-y-4">
        <label className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-8 flex flex-col items-center cursor-pointer transition">
          <input 
            type="file" 
            accept="application/pdf" 
            className="hidden" 
            onChange={(e) => setFile(e.target.files[0])} 
          />
          <span className="text-sm font-medium text-slate-700">
            {file ? file.name : 'Click to browse or drag and drop PDF here'}
          </span>
          <span className="text-xs text-slate-400 mt-1">Maximum file size: 10MB</span>
        </label>

        <button
          type="submit"
          disabled={!file || loading}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl disabled:opacity-50 transition"
        >
          {loading ? 'Processing Document...' : 'Upload & Analyze'}
        </button>
      </form>
    </div>
  );
}