import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { PassCard } from '../../components/PassCard';
import { ArrowLeft, Loader2 } from 'lucide-react';

export const PassDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pass, setPass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPass = async () => {
      try {
        const res = await api.get(`/passes/${id}`);
        setPass(res.data.pass);
      } catch (err) {
        setError(err.message || 'Failed to retrieve pass details');
      } finally {
        setLoading(false);
      }
    };
    fetchPass();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-900" />
        <span className="text-xs font-semibold">Loading official digital pass credentials...</span>
      </div>
    );
  }

  if (error || !pass) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <div className="p-6 bg-white rounded-2xl border border-rose-200 text-rose-700 text-xs">
          {error || 'Pass record not found.'}
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <span className="text-xs font-mono text-slate-400">Pass Reference: {pass.passNumber}</span>
      </div>

      <PassCard
        pass={pass}
        vehicle={pass.vehicleId}
        owner={pass.ownerId}
      />
    </div>
  );
};
export default PassDetails;
