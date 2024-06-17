import { Workbox } from "workbox-window";

const workBoxServiceWorker = async (path) => {
  if (!("serviceWorker" in navigator)) {
    return;
  }
  const wb = new Workbox(path);
  try {
    await wb.register();
  } catch (error) {
    console.error(error);
  }
};

export default workBoxServiceWorker;
