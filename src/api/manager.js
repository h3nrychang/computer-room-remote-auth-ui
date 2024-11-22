import axios from './axiosConfig';

// 获取当前机房长信息
export const getCurrentManager = async () => {
  try {
    const response = await axios.get('/manager/me');
    return response.data;
  } catch (error) {
    throw new Error('获取当前机房长信息失败');
  }
};

// 查询指定机房长信息
export const getManagerByInfo = async (username, telephone) => {
  try {
    const response = await axios.get('/manager/get', {
      params: { username, telephone },
    });
    return response.data;
  } catch (error) {
    throw new Error('查询指定机房长信息失败');
  }
};

// 查询机房长列表
export const getManagerList = async (page = 1) => {
  try {
    const response = await axios.get('/manager/list', { params: { page } });
    return response.data;
  } catch (error) {
    throw new Error('查询机房长列表失败');
  }
};

// 新增机房长
export const createManager = async (username, telephone, address) => {
  try {
    const response = await axios.post('/manager/create', { username, telephone, address });
    return response.data;
  } catch (error) {
    throw new Error('新增机房长失败');
  }
};

// 删除机房长
export const deleteManager = async (username, telephone) => {
  try {
    const response = await axios.delete('/manager/delete', { data: { username, telephone } });
    return response.data;
  } catch (error) {
    throw new Error('删除机房长失败');
  }
};

// 修改机房长信息
export const changeManagerAddress = async (address) => {
  try {
    const response = await axios.post('/manager/change', { address });
    return response.data;
  } catch (error) {
    throw new Error('修改机房长信息失败');
  }
};

// 管理员修改机房长信息
export const adminChangeManagerAddress = async (username, telephone, address) => {
  try {
    const response = await axios.post('/manager/admin/change', { username, telephone, address });
    return response.data;
  } catch (error) {
    throw new Error('管理员修改机房长信息失败');
  }
};
