// Centralized API functions
import http from '@/axiosConfig.js'

// Auth
export async function login(role, payload) {
  const { data } = await http.post(`/${role}/login`, payload, {
    headers: { 'Content-Type': 'application/json' },
  })
  return data
}

export async function tokenLogin(role, token) {
  const { data } = await http.post(
    `/${role}/tokenLogin`,
    {},
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )
  return data
}

export async function register(role, payload) {
  const { data } = await http.post(`/${role}/register`, payload, {
    headers: { 'Content-Type': 'application/json' },
  })
  return data
}

export async function forgetPassword(role, payload) {
  const { data } = await http.post(`/${role}/forgetPassword`, payload, {
    headers: { 'Content-Type': 'application/json' },
  })
  return data
}

export async function resetPassword(payload) {
  const { data } = await http.post('/reset-password', payload, {
    headers: { 'Content-Type': 'application/json' },
  })
  return data
}

// User profile
export async function getProfile(role, id) {
  const { data } = await http.get(`/${role}/${id}`)
  return data
}

export async function updateProfile(role, id, payload) {
  const { data } = await http.put(`/${role}/${id}`, payload, {
    headers: { 'Content-Type': 'application/json' },
  })
  return data
}

export async function getAllUsers() {
  const { data } = await http.get('/user/allUser')
  return data
}

// Animals
export async function getAnimalsForHospital(hospitalId) {
  const { data } = await http.get(`/animal/${hospitalId}`)
  return data
}

export async function createAnimal(formData) {
  const { data } = await http.post('/animal/create', formData)
  return data
}

export async function editAnimal(formData) {
  const { data } = await http.put('/animal/edit', formData)
  return data
}

export async function deleteAnimal(animalId) {
  const { data } = await http.delete(`/animal/delete/${animalId}`)
  return data
}

export async function getAnimalDetail(animalId) {
  const { data } = await http.get(`/animal/detail/${animalId}`)
  return data
}

export async function getSharedAnimals(userId) {
  const { data } = await http.get(`/animal/share/${userId}`)
  return data
}

// Weight
export async function createWeight(payload) {
  const { data } = await http.post('/animal/createWeight', payload, {
    headers: { 'Content-Type': 'application/json' },
  })
  return data
}

export async function updateWeight(animalId, weightId, payload) {
  const { data } = await http.put(`/animal/updateWeight/${animalId}/${weightId}`, payload, {
    headers: { 'Content-Type': 'application/json' },
  })
  return data
}

export async function deleteWeight(animalId, weightId) {
  const { data } = await http.delete(`/animal/deleteWeight/${animalId}/${weightId}`, {
    headers: { 'Content-Type': 'application/json' },
  })
  return data
}

// Blood sugar diary
export async function getDiary(params) {
  const { data } = await http.get('/bloodSugar/diary', { params })
  return data
}

export async function createBloodSugar(payload) {
  const { data } = await http.post('/bloodSugar/create', payload, {
    headers: { 'Content-Type': 'application/json' },
  })
  return data
}

export async function updateBloodSugar(recordId, payload) {
  const { data } = await http.put(`/bloodSugar/update/${recordId}`, payload)
  return data
}

export async function deleteBloodSugarTask(dataId, payload) {
  const { data } = await http.delete(`/bloodSugar/task/${dataId}`, {
    data: payload,
    headers: { 'content-Type': 'application/json' },
  })
  return data
}

export async function getAverage(params) {
  const { data } = await http.get('/bloodSugar/average', { params })
  return data
}

// Blood sugar curve
export async function getCurve(params) {
  const { data } = await http.get('/bloodSugar/getCurve', { params })
  return data
}

export async function createCurve(payload) {
  const { data } = await http.post('/bloodSugar/createCurve', payload, {
    headers: { 'Content-Type': 'application/json' },
  })
  return data
}

export async function updateCurve(id, payload) {
  const { data } = await http.put(`/bloodSugar/updateCurve/${id}`, payload, {
    headers: { 'Content-Type': 'application/json' },
  })
  return data
}

export async function deleteCurve(curveId, payload) {
  const { data } = await http.delete(`/bloodSugar/deleteCurve/${curveId}`, {
    data: payload,
    headers: { 'Content-Type': 'application/json' },
  })
  return data
}

// Dashboard
export async function getDashboard(params) {
  const { data } = await http.get('/dashboard', { params })
  return data
}
