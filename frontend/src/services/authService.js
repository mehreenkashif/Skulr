import axios from 'axios'

const API = 'http://127.0.0.1:5000'

const setToken = (token) => localStorage.setItem('skulr_token', token)
const getToken = () => localStorage.getItem('skulr_token')
const removeToken = () => localStorage.removeItem('skulr_token')

const authAxios = axios.create({ baseURL: API })
authAxios.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const register = async (name, email, password) => {
  const res = await axios.post(`${API}/auth/register`, { name, email, password })
  setToken(res.data.token)
  return res.data
}

const login = async (email, password) => {
  const res = await axios.post(`${API}/auth/login`, { email, password })
  setToken(res.data.token)
  return res.data
}

const logout = () => removeToken()
const getMe = async () => { const res = await authAxios.get('/auth/me'); return res.data }
const isLoggedIn = () => !!getToken()

export default { register, login, logout, getMe, isLoggedIn, getToken, authAxios }