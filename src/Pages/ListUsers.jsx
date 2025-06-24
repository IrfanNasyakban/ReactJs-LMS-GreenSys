import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getMe } from "../features/authSlice";
import { motion } from "framer-motion";
import { useStateContext } from "../contexts/ContextProvider";

import { 
  FaEdit, 
  FaTrash,
  FaUsers,
  FaPlus,
  FaLeaf,
  FaSearch,
  FaDownload,
  FaChalkboardTeacher,
  FaGraduationCap,
  FaUserShield,
  FaRecycle,
  FaTree,
  FaSeedling,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaFilter
} from "react-icons/fa";
import { MdScience, MdEco, MdNaturePeople, MdAdminPanelSettings, MdVerifiedUser } from "react-icons/md";
import { GiPlantSeed } from "react-icons/gi";

const ListUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const { currentColor, currentMode } = useStateContext();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isError } = useSelector((state) => state.auth);

  // Helper function for colors with opacity
  const getColorWithOpacity = (color, opacity) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const isDark = currentMode === 'Dark';

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      getUsers();
    } else {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const getUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      const response = await axios.get(`${apiUrl}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleTambah = () => {
    navigate("/users/tambah-users");
  };

  const handleEdit = (id) => {
    navigate(`/users/${id}`);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      await axios.delete(`${apiUrl}/users/${userToDelete.uuid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setShowDeleteModal(false);
      setUserToDelete(null);
      getUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const getRoleDisplayName = (role) => {
    switch(role) {
      case 'siswa': return 'Green Learner';
      case 'guru': return 'Green Educator';
      case 'admin': return 'System Admin';
      default: return role;
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'siswa': return <FaGraduationCap />;
      case 'guru': return <FaChalkboardTeacher />;
      case 'admin': return <MdAdminPanelSettings />;
      default: return <FaUsers />;
    }
  };

  const getRoleStats = () => {
    const adminCount = users.filter(u => u.role === 'admin').length;
    const guruCount = users.filter(u => u.role === 'guru').length;
    const siswaCount = users.filter(u => u.role === 'siswa').length;
    
    return { adminCount, guruCount, siswaCount, total: users.length };
  };

  const stats = getRoleStats();

  return (
    <div className="p-6">
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-3">
          <FaUserShield 
            className="absolute bottom-40 left-20 text-7xl animate-pulse" 
            style={{ color: currentColor, animationDelay: '0.5s' }} 
          />
          <MdScience 
            className="absolute top-60 left-1/3 text-5xl animate-pulse" 
            style={{ color: currentColor, animationDelay: '2s' }} 
          />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div 
            className="p-6 rounded-2xl shadow-lg backdrop-blur-sm border"
            style={{ 
              backgroundColor: getColorWithOpacity(currentColor, 0.1),
              borderColor: getColorWithOpacity(currentColor, 0.2)
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div 
                  className="p-3 rounded-full"
                  style={{ backgroundColor: currentColor }}
                >
                  <FaUsers className="text-white text-2xl" />
                </div>
                <div>
                  <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Green Science <span style={{ color: currentColor }}>Community</span>
                  </h1>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Manajemen pengguna Green Science Learning Management System
                  </p>
                </div>
              </div>
              <button
                onClick={handleTambah}
                className="flex items-center gap-2 px-6 py-3 text-white rounded-xl transition-all duration-300 hover:scale-105 shadow-lg font-medium"
                style={{ backgroundColor: currentColor }}
              >
                <FaPlus />
                Tambah Green User
              </button>
            </div>
          </div>
        </motion.div>

        {/* Search & Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-6"
        >
          <div 
            className="p-6 rounded-xl shadow-lg backdrop-blur-sm border"
            style={{ 
              backgroundColor: getColorWithOpacity(currentColor, 0.05),
              borderColor: getColorWithOpacity(currentColor, 0.2)
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <FaSearch 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                />
                <input
                  type="text"
                  placeholder="Cari username, email, atau role..."
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  style={{ 
                    focusRingColor: getColorWithOpacity(currentColor, 0.5),
                    borderColor: getColorWithOpacity(currentColor, 0.3)
                  }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Role Filter */}
              <div className="relative">
                <FaFilter 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                />
                <select
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  style={{ 
                    focusRingColor: getColorWithOpacity(currentColor, 0.5),
                    borderColor: getColorWithOpacity(currentColor, 0.3)
                  }}
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">Semua Role</option>
                  <option value="admin">System Admin</option>
                  <option value="guru">Green Educator</option>
                  <option value="siswa">Green Learner</option>
                </select>
              </div>

              {/* Spacer */}
              <div></div>

              {/* Export Button */}
              <button
                className="flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: currentColor }}
              >
                <FaDownload />
                Export Data
              </button>
            </div>
          </div>
        </motion.div>

        {/* Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="overflow-hidden rounded-xl shadow-lg backdrop-blur-sm border"
          style={{ 
            backgroundColor: getColorWithOpacity(currentColor, 0.05),
            borderColor: getColorWithOpacity(currentColor, 0.2)
          }}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}>
                  <th className={`px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-white' : 'text-gray-700'}`}>
                    No
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-white' : 'text-gray-700'}`}>
                    Green User
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-white' : 'text-gray-700'}`}>
                    Email Address
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-white' : 'text-gray-700'}`}>
                    Role & Status
                  </th>
                  <th className={`px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-white' : 'text-gray-700'}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div 
                          className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent"
                          style={{ borderColor: getColorWithOpacity(currentColor, 0.3) }}
                        ></div>
                        <span className={`ml-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          Loading green community...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.uuid}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`transition-colors duration-200 ${
                        isDark 
                          ? 'hover:bg-gray-700/50' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className={`px-6 py-4 text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {index + 1}
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div className="flex items-center gap-3">
                          <div 
                            className="p-2 rounded-full"
                            style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}
                          >
                            {getRoleIcon(user.role)}
                          </div>
                          <div>
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {user.username}
                            </p>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              Green Science Member
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div className="flex items-center gap-2">
                          <MdVerifiedUser style={{ color: currentColor }} className="text-sm" />
                          {user.email}
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div className="flex items-center gap-2">
                          <span 
                            className="px-3 py-1 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: currentColor }}
                          >
                            {getRoleDisplayName(user.role)}
                          </span>
                          <FaCheckCircle className="text-green-500 text-xs" title="Aktif" />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(user.uuid)}
                            className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
                            style={{ 
                              backgroundColor: getColorWithOpacity(currentColor, 0.1),
                              color: currentColor 
                            }}
                            title="Edit user"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-300 hover:scale-110"
                            title="Hapus user"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FaUsers 
                          className="text-6xl mb-4 opacity-50"
                          style={{ color: currentColor }}
                        />
                        <p className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          Tidak ada green users ditemukan
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Tambahkan user baru atau ubah filter pencarian
                        </p>
                        <button
                          onClick={handleTambah}
                          className="mt-4 flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all duration-300 hover:scale-105"
                          style={{ backgroundColor: currentColor }}
                        >
                          <FaPlus />
                          Tambah Green User
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Summary Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-6 text-center"
        >
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Menampilkan {filteredUsers.length} dari {users.length} green community members
          </p>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={handleDeleteCancel}
          ></div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md mx-auto rounded-2xl shadow-2xl overflow-hidden z-10"
            style={{ 
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              border: `1px solid ${getColorWithOpacity(currentColor, 0.2)}`
            }}
          >
            {/* Modal Header */}
            <div 
              className="px-6 py-4"
              style={{ 
                background: `linear-gradient(135deg, #ef4444 0%, #dc2626 100%)`
              }}
            >
              <div className="flex items-center gap-3">
                <FaTimesCircle className="h-6 w-6 text-white" />
                <h3 className="text-lg font-bold text-white">
                  Hapus Green User
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-red-100 flex-shrink-0">
                  <FaTrash className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className={`text-sm leading-relaxed mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Apakah Anda yakin ingin menghapus user ini dari Green Science Community?
                  </p>
                  {userToDelete && (
                    <div 
                      className="p-3 rounded-lg border"
                      style={{ 
                        backgroundColor: getColorWithOpacity(currentColor, 0.05),
                        borderColor: getColorWithOpacity(currentColor, 0.2)
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {getRoleIcon(userToDelete.role)}
                        <div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {userToDelete.username}
                          </p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {getRoleDisplayName(userToDelete.role)} • {userToDelete.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <p className={`text-xs mt-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div 
              className="px-6 py-4 border-t flex gap-3 justify-end"
              style={{ 
                backgroundColor: getColorWithOpacity(currentColor, 0.05),
                borderColor: getColorWithOpacity(currentColor, 0.2)
              }}
            >
              <button
                type="button"
                onClick={handleDeleteCancel}
                className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all duration-300 ${
                  isDark 
                    ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all duration-300"
              >
                Hapus User
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ListUsers;