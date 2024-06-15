const HOST = process.env.HOST;
const API_ENDPOINT = process.env.API_ENDPOINT;

//* host jangan diakhiri '/'
//* path harus diawali dengan '/' dan diakhiri '/'

const CacheThisURL = [
  {
    host: `${HOST}`,
    path: [
      "/views/",
      "/public/assets/",
      "/public/img/",
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
