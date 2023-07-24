import Base64 from 'Base64';

const baseUrl = 'https://demo.oui.cd/attendance/';
// const baseUrl = "https://oui.cd/attendance/";
const token = 'ouicd:1223345';
const hash = Base64.btoa(token);
const Basic = 'Basic ' + hash;

export default {
  baseUrl: baseUrl,
  apiurl: baseUrl + 'api/',
  token: Basic,
};
