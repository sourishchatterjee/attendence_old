import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

const EditUserModal = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role_id: 1,
  });

  const roles = [
    { id: 1, name: 'Employee' },
    { id: 2, name: 'Manager' },
    { id: 3, name: 'Admin' },
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        role_id: roles.find(r => r.name === user.role)?.id || 1,
      });
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // API: PUT /users/:id/role
    onSave({ ...user, ...formData, role: roles.find(r => r.id === formData.role_id)?.name });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-lg hover:bg-primary-50 transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-secondary-600" />
            </button>

            {/* Header */}
            <h2 className="text-2xl font-bold text-secondary-700 mb-6">Edit User</h2>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-secondary-700 mb-2">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-3 bg-accent-lightBlue border-2 border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-500 transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-accent-lightBlue border-2 border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-500 transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary-700 mb-2">Role</label>
                <select
                  value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-accent-lightBlue border-2 border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-500 transition-all duration-200"
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-5 py-3 bg-secondary-100 text-secondary-700 rounded-xl font-semibold hover:bg-secondary-200 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 20px rgba(59, 130, 246, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold shadow-lg"
                >
                  Save Changes
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditUserModal;
