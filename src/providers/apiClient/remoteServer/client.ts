import axios from 'axios';
import { setupAxios } from '../../../utils/setupAxios';

const client = axios.create({ baseURL: process.env.REACT_APP_PROVIDERS_REMOTE_SERVER_BASE_URL });

setupAxios(client);

export default client;
