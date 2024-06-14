const HOST = process.env.HOST;
const API_ENDPOINT = process.env.API_ENDPOINT;
const domainUrl = `${window.location.protocol}//${window.location.hostname}`;

//* host jangan diakhiri '/'
//* path harus diawali dengan '/' dan diakhiri '/'

const CacheThisURL = [
  {
    host: `${HOST || domainUrl}`,
    path: [
      "/views/",
      "/public/assets/",
    ],
  },
  {
    host: `${API_ENDPOINT}`,
    path: [
      "",
    ],
  },
];
export { CacheThisURL };
