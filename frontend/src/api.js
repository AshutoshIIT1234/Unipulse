import axios from "axios";

const BASE = "http://localhost:8000/api";

export const fetchIITSentiment = (iitKey) =>
  axios.get(`${BASE}/sentiment/${iitKey}`).then(r => r.data);

export const fetchAllIITs = () =>
  axios.get(`${BASE}/compare`).then(r => r.data);