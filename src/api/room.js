import axios from './axiosConfig';

// 获取机房列表
export const getRoomList = async (page = 1) => {
  try {
    const response = await axios.get('/room/list', { params: { page } });
    return response.data;
  } catch (error) {
    throw new Error('获取机房列表失败');
  }
};

// 用户名模糊获取机房
export const getRoomByName = async (name) => {
  try {
    const response = await axios.get('/room/get', { params: { name } });
    return response.data;
  } catch (error) {
    throw new Error('按用户名模糊查询机房失败');
  }
};

// 通过ID获取机房
export const getRoomById = async (room_id) => {
  try {
    const response = await axios.get('/room/get/id', { params: { room_id } });
    return response.data;
  } catch (error) {
    throw new Error('通过ID获取机房失败');
  }
};

// 新建机房（管理员）
export const createRoom = async (name, address, manager_id) => {
  try {
    const response = await axios.post('/room/create', { name, address, manager_id });
    return response.data;
  } catch (error) {
    throw new Error('新建机房失败');
  }
};

// 删除机房（管理员）
export const deleteRoom = async (name) => {
  try {
    const response = await axios.delete('/room/delete', { data: { name } });
    return response.data;
  } catch (error) {
    throw new Error('删除机房失败');
  }
};
