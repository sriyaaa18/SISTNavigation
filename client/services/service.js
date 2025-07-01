import axiosInstance from "../axiosInstance.js";

export const submitUser = async (userdata) => {
    const response = await axiosInstance.post('/users', userdata)
    return response.data;
};