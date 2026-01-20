import React, { useState, useEffect } from 'react';
import { shiftAPI } from '../../services/shiftAPI';

const ShiftModal = ({ shift, organizations, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    organization_id: '',
    shift_name: '',
    shift_code: '',
    start_time: '09:00',
    end_time: '18:00',
    grace_time_minutes: 15,
    half_day_duration_hours: 4.0,
    full_day_duration_hours: 8.0,
    break_time_minutes: 60,
    week_off_days: [0, 6], // Sunday and Saturday
    is_night_shift: false,
    is_flexible: false,
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const weekDays = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ];

  useEffect(() => {
    if (shift) {
      setFormData({
        organization_id: shift.organization_id || '',
        shift_name: shift.shift_name || '',
        shift_code: shift.shift_code || '',
        start_time: shift.start_time?.substring(0, 5) || '09:00',
        end_time: shift.end_time?.substring(0, 5) || '18:00',
        grace_time_minutes: shift.grace_time_minutes || 15,
        half_day_duration_hours: shift.half_day_duration_hours || 4.0,
        full_day_duration_hours: shift.full_day_duration_hours || 8.0,
        break_time_minutes: shift.break_time_minutes || 60,
        week_off_days: shift.week_off_days || [0, 6],
        is_night_shift: shift.is_night_shift || false,
        is_flexible: shift.is_flexible || false,
        description: shift.description || '',
      });
    }
  }, [shift]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.organization_id) {
      newErrors.organization_id = 'Organization is required';
    }
    if (!formData.shift_name.trim()) {
      newErrors.shift_name = 'Shift name is required';
    }
    if (!formData.shift_code.trim()) {
      newErrors.shift_code = 'Shift code is required';
    }
    if (!formData.start_time) {
      newErrors.start_time = 'Start time is required';
    }
    if (!formData.end_time) {
      newErrors.end_time = 'End time is required';
    }
    if (formData.grace_time_minutes < 0 || formData.grace_time_minutes > 60) {
      newErrors.grace_time_minutes = 'Grace time must be between 0 and 60 minutes';
    }
    if (formData.half_day_duration_hours <= 0 || formData.half_day_duration_hours > 12) {
      newErrors.half_day_duration_hours = 'Half day duration must be between 0 and 12 hours';
    }
    if (formData.full_day_duration_hours <= 0 || formData.full_day_duration_hours > 24) {
      newErrors.full_day_duration_hours = 'Full day duration must be between 0 and 24 hours';
    }
    if (formData.break_time_minutes < 0 || formData.break_time_minutes > 240) {
      newErrors.break_time_minutes = 'Break time must be between 0 and 240 minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        organization_id: parseInt(formData.organization_id, 10),
        shift_name: formData.shift_name.trim(),
        shift_code: formData.shift_code.trim().toUpperCase(),
        start_time: `${formData.start_time}:00`,
        end_time: `${formData.end_time}:00`,
        grace_time_minutes: parseInt(formData.grace_time_minutes, 10),
        half_day_duration_hours: parseFloat(formData.half_day_duration_hours),
        full_day_duration_hours: parseFloat(formData.full_day_duration_hours),
        break_time_minutes: parseInt(formData.break_time_minutes, 10),
        week_off_days: formData.week_off_days,
        is_night_shift: formData.is_night_shift,
        is_flexible: formData.is_flexible,
        description: formData.description.trim() || null,
      };

      if (shift) {
        await shiftAPI.updateShift(shift.shift_id, submitData);
        alert('✅ Shift updated successfully');
      } else {
        await shiftAPI.createShift(submitData);
        alert('✅ Shift created successfully');
      }
      onSuccess();
    } catch (error) {
      console.error('Submit error:', error);
      if (error.errors && Array.isArray(error.errors)) {
        const errorMessages = error.errors.map(e => e.message).join('\n');
        alert(`❌ Validation Error:\n${errorMessages}`);
      } else {
        alert(`❌ ${error.message || 'Failed to save shift'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleWeekOffToggle = (dayValue) => {
    setFormData(prev => {
      const newWeekOffDays = prev.week_off_days.includes(dayValue)
        ? prev.week_off_days.filter(day => day !== dayValue)
        : [...prev.week_off_days, dayValue].sort((a, b) => a - b);
      return { ...prev, week_off_days: newWeekOffDays };
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative inline-block w-full max-w-3xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl">
          <div className="absolute top-4 right-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-secondary-700">
              {shift ? 'Edit Shift' : 'Add New Shift'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-3">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Organization <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="organization_id"
                    value={formData.organization_id}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${
                      errors.organization_id ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                  >
                    <option value="">Select Organization</option>
                    {organizations.map(org => (
                      <option key={org.organization_id} value={org.organization_id}>
                        {org.organization_name}
                      </option>
                    ))}
                  </select>
                  {errors.organization_id && (
                    <p className="text-red-500 text-xs mt-1">{errors.organization_id}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Shift Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="shift_name"
                    value={formData.shift_name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${
                      errors.shift_name ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                    placeholder="General Shift"
                  />
                  {errors.shift_name && (
                    <p className="text-red-500 text-xs mt-1">{errors.shift_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Shift Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="shift_code"
                    value={formData.shift_code}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${
                      errors.shift_code ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm uppercase`}
                    placeholder="GEN"
                    maxLength="10"
                  />
                  {errors.shift_code && (
                    <p className="text-red-500 text-xs mt-1">{errors.shift_code}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Timing Configuration */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-green-900 mb-3">Timing Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${
                      errors.start_time ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                  />
                  {errors.start_time && (
                    <p className="text-red-500 text-xs mt-1">{errors.start_time}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${
                      errors.end_time ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                  />
                  {errors.end_time && (
                    <p className="text-red-500 text-xs mt-1">{errors.end_time}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Grace Time (minutes)
                  </label>
                  <input
                    type="number"
                    name="grace_time_minutes"
                    value={formData.grace_time_minutes}
                    onChange={handleChange}
                    min="0"
                    max="60"
                    className={`w-full px-3 py-2 border ${
                      errors.grace_time_minutes ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                    placeholder="15"
                  />
                  {errors.grace_time_minutes && (
                    <p className="text-red-500 text-xs mt-1">{errors.grace_time_minutes}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Break Time (minutes)
                  </label>
                  <input
                    type="number"
                    name="break_time_minutes"
                    value={formData.break_time_minutes}
                    onChange={handleChange}
                    min="0"
                    max="240"
                    className={`w-full px-3 py-2 border ${
                      errors.break_time_minutes ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                    placeholder="60"
                  />
                  {errors.break_time_minutes && (
                    <p className="text-red-500 text-xs mt-1">{errors.break_time_minutes}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Duration Configuration */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-purple-900 mb-3">Duration Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Day Duration (hours)
                  </label>
                  <input
                    type="number"
                    name="full_day_duration_hours"
                    value={formData.full_day_duration_hours}
                    onChange={handleChange}
                    min="1"
                    max="24"
                    step="0.5"
                    className={`w-full px-3 py-2 border ${
                      errors.full_day_duration_hours ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                    placeholder="8.0"
                  />
                  {errors.full_day_duration_hours && (
                    <p className="text-red-500 text-xs mt-1">{errors.full_day_duration_hours}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Half Day Duration (hours)
                  </label>
                  <input
                    type="number"
                    name="half_day_duration_hours"
                    value={formData.half_day_duration_hours}
                    onChange={handleChange}
                    min="1"
                    max="12"
                    step="0.5"
                    className={`w-full px-3 py-2 border ${
                      errors.half_day_duration_hours ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                    placeholder="4.0"
                  />
                  {errors.half_day_duration_hours && (
                    <p className="text-red-500 text-xs mt-1">{errors.half_day_duration_hours}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Week Off Days */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-orange-900 mb-3">Week Off Days</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {weekDays.map(day => (
                  <label
                    key={day.value}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition ${
                      formData.week_off_days.includes(day.value)
                        ? 'bg-orange-200 border-2 border-orange-400'
                        : 'bg-white border-2 border-gray-300 hover:border-orange-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.week_off_days.includes(day.value)}
                      onChange={() => handleWeekOffToggle(day.value)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-900">{day.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Shift Type */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-indigo-900 mb-3">Shift Type</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-300 cursor-pointer hover:border-indigo-400 transition">
                  <input
                    type="checkbox"
                    name="is_night_shift"
                    checked={formData.is_night_shift}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-gray-900">Night Shift</span>
                    <p className="text-xs text-gray-600">Shift runs overnight (e.g., 8 PM to 4 AM)</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-300 cursor-pointer hover:border-indigo-400 transition">
                  <input
                    type="checkbox"
                    name="is_flexible"
                    checked={formData.is_flexible}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-gray-900">Flexible Shift</span>
                    <p className="text-xs text-gray-600">Employees can choose their own timings</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition resize-none text-sm"
                placeholder="Standard office hours shift"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium disabled:opacity-50 text-sm"
              >
                {loading ? 'Saving...' : shift ? 'Update Shift' : 'Create Shift'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShiftModal;
