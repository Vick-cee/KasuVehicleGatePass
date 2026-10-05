import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { Car, ArrowRight, AlertCircle, ArrowLeft, Info, PlusCircle } from 'lucide-react';

export const RegisterVehicle = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    registrationNumber: '',
    vehicleType: 'CAR',
    make: '',
    model: '',
    colour: '',
    registeredYear: new Date().getFullYear(),
    identificationDocument: '',
    notes: '',
  });

  const [existingCount, setExistingCount] = useState(0);
  const [checkingCount, setCheckingCount] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const MAX_LIMIT = 3;

  useEffect(() => {
    fetchCurrentCount();
  }, []);

  const fetchCurrentCount = async () => {
    try {
      const res = await api.get('/vehicles/my-vehicles');
      const count = res.data.vehicles?.length || 0;
      setExistingCount(count);
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingCount(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (existingCount >= MAX_LIMIT) {
      return setError('Maximum limit reached: You can only register up to 3 vehicles on your account.');
    }

    if (!formData.registrationNumber.trim()) {
      return setError('Vehicle registration number (license plate) is required');
    }
    if (!formData.make.trim() || !formData.model.trim() || !formData.colour.trim()) {
      return setError('Please provide vehicle make, model, and colour');
    }

    setLoading(true);
    try {
      await api.post('/vehicles/register', {
        ...formData,
        registrationNumber: formData.registrationNumber.toUpperCase().trim(),
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to submit vehicle registration');
    } finally {
      setLoading(false);
    }
  };

  const isLimitReached = existingCount >= MAX_LIMIT;

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Register Vehicle for Gate Pass</h1>
          <p className="text-xs text-slate-600 font-medium">
            Submit vehicle details for review by Kaduna State University security administration.
          </p>
        </div>
      </div>

      {/* Quota Progress Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-kasu-red-50 text-kasu-red-800 flex items-center justify-center font-black text-xs border border-kasu-red-100">
            {existingCount}/{MAX_LIMIT}
          </div>
          <div>
            <div className="text-xs font-black text-slate-900">Vehicle Quota Allowance</div>
            <div className="text-[11px] text-slate-500 font-medium">
              {isLimitReached
                ? 'Maximum 3 vehicles reached'
                : `${MAX_LIMIT - existingCount} more vehicle(s) can be registered`}
            </div>
          </div>
        </div>

        <span
          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
            isLimitReached
              ? 'bg-amber-100 text-amber-900 border border-amber-200'
              : 'bg-kasu-green-100 text-kasu-green-900 border border-kasu-green-200'
          }`}
        >
          {isLimitReached ? 'Quota Full' : 'Slots Open'}
        </span>
      </div>

      {isLimitReached ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mx-auto border border-amber-200">
            <Info className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-slate-900">Maximum 3-Vehicle Limit Reached</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto font-medium">
            Kaduna State University traffic policy restricts registered passes to 3 vehicles per user. To register a new vehicle, please contact security administration or manage your existing passes.
          </p>
          <Link
            to="/dashboard"
            className="inline-block px-5 py-2.5 rounded-xl bg-kasu-red-800 text-white font-bold text-xs hover:bg-kasu-red-900 transition shadow-sm"
          >
            Return to Dashboard
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-700" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-800">License Plate / Registration Number *</label>
                <input
                  type="text"
                  name="registrationNumber"
                  required
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  placeholder="e.g. KASU-992-KD"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono font-bold text-sm uppercase focus:outline-none focus:ring-2 focus:ring-kasu-red-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Vehicle Type *</label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-kasu-red-700"
                >
                  <option value="CAR">Car / Sedan</option>
                  <option value="SUV">SUV / Crossover</option>
                  <option value="MOTORCYCLE">Motorcycle / Scooter</option>
                  <option value="VAN">Van / Bus</option>
                  <option value="TRUCK">Truck / Heavy Vehicle</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Vehicle Make *</label>
                <input
                  type="text"
                  name="make"
                  required
                  value={formData.make}
                  onChange={handleChange}
                  placeholder="e.g. Toyota, Honda, Hyundai"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-kasu-red-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Model *</label>
                <input
                  type="text"
                  name="model"
                  required
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g. Corolla, Civic, Tucson"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-kasu-red-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Colour *</label>
                <input
                  type="text"
                  name="colour"
                  required
                  value={formData.colour}
                  onChange={handleChange}
                  placeholder="e.g. Silver, Black, Blue"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-kasu-red-700"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-800">Vehicle Document Reference / Proof of Ownership</label>
                <input
                  type="text"
                  name="identificationDocument"
                  value={formData.identificationDocument}
                  onChange={handleChange}
                  placeholder="e.g. State Vehicle License # or Insurance policy ID"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-kasu-red-700"
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-kasu-red-800 hover:bg-kasu-red-900 text-white font-black text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Submitting Application...' : 'Submit Vehicle Registration'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
export default RegisterVehicle;
