import axios from "axios";

const BASE = "http://localhost:8000/api";

export const fetchIITSentiment = (iitKey) =>
  axios.get(`${BASE}/sentiment/${iitKey}`).then(r => r.data);

export const fetchIITReport = (iitKey) =>
  axios.get(`${BASE}/sentiment/report/${iitKey}`).then(r => r.data);

export const fetchAllIITs = () =>
  axios.get(`${BASE}/compare`).then(r => r.data);

export const indexChatbotData = (iitKey) =>
  axios.get(`${BASE}/chatbot/index`, { params: { iit_key: iitKey } }).then(r => r.data);

export const askChatbot = (question, iitKey) =>
  axios.get(`${BASE}/chatbot`, { params: { question, iit_key: iitKey } }).then(r => r.data);

export const listAgents = () =>
  axios.get(`${BASE}/agents`).then(r => r.data);

export const runAgent = (agentName, action = null, params = {}) =>
  axios.get(`${BASE}/agents/run/${agentName}`, { params: { action, ...params } }).then(r => r.data);

export const runAllInsights = () =>
  axios.get(`${BASE}/agents/insights`).then(r => r.data);

export const getTrends = () =>
  axios.get(`${BASE}/trends`).then(r => r.data);

export const getAnomalies = () =>
  axios.get(`${BASE}/trends/anomalies`).then(r => r.data);

export const getWeeklySummary = () =>
  axios.get(`${BASE}/trends/weekly`).then(r => r.data);

export const getCategoryComparison = () =>
  axios.get(`${BASE}/trends/categories`).then(r => r.data);

export const getImprovements = () =>
  axios.get(`${BASE}/improve`).then(r => r.data);

export const compareIITs = (iitList) =>
  axios.get(`${BASE}/sentiment/compare`, { params: { iit_list: iitList?.join(",") } }).then(r => r.data);