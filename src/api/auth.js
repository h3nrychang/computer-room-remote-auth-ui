import axios from 'axios';

const API_BASE_URL = 'http://113.45.195.128:8081';

// 登录请求
export const login = async (username, password, telephone) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/token`, { username, password, telephone });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || '登录失败');
  }
};

// 注册请求
export const register = async (username, password, telephone) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/create`, { username, password, telephone });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || '注册失败');
  }
};

// 获取用户角色
export const getUserRole = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/me/role`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || '获取用户角色失败');
  }
};

// 获取用户角色（管理员权限）
export const getUserRoleByAdmin = async (username, telephone) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/role/get`, {
      data: { username, telephone },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || '获取用户角色失败');
  }
};

// 修改用户角色（管理员权限）
export const changeUserRole = async (username, telephone, role_id) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/change/role`, {
      username,
      telephone,
      role_id,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || '修改用户角色失败');
  }
};
