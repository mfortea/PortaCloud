// utils/deviceInfo.js
const UAParser = require('ua-parser-js');

const getDeviceInfo = (userAgent) => {
  const parser = new UAParser();
  const result = parser.setUA(userAgent).getResult();

  const os = result.os.name || "Desconocido";
  const browser = result.browser.name || "Desconocido";

  let deviceType = result.device.type || "equipo";
  if (deviceType === "mobile") {
    deviceType = "smartphone"; 
  }

  return { os, browser, deviceType };
};

module.exports = getDeviceInfo; 