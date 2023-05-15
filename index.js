const dotenv = require("dotenv");
const net = require("net");
const axios = require("axios");
const ser = require("serialport");

// load the dotenv
dotenv.config({ path: ".env" });

const axiosHeaders = {
  "Content-Type": "application/json",
  "product-code": process.env.PRODUCT_CODE,
};

let sendPortUpdate = async (port, value) => {
  const url = `${process.env.SERVER_URL}/ports/${port}/update`;
  const data = {
    value: value,
  };

  axios
    .post(url, data, { headers: axiosHeaders })
    .then(() => {
      console.log(`[CONTROLLER]: Value update on port ${port} submitted!`);
    })
    .catch((e) => {
      console.log(e);
    });
};

const sp = new ser.SerialPort({
  path: process.env.SERIAL_PORT,
  baudRate: 115200,
});

// Open the serial port
sp.on("open", () => {
  console.log("[CONTROLLER]: Serial port is open");

  // Listen for data
  sp.on("data", (data) => {
    const receivedData = data.toString("utf-8");
    process.stdout.write(receivedData);
    if (receivedData.startsWith("[DATA]:")) {
      const payload = receivedData.substring(7, receivedData.indexOf("\n"));
      sendPortUpdate(payload.split(":")[0], payload.split(":")[1]);
    }
  });
});

// Handle errors
sp.on("error", (error) => {
  console.error("Serial port error:", error);
});

// // setup the tcp server
// const server = net.createServer((socket) => {
//   console.log("Client connected");

//   socket.on("data", (data) => {
//     const packet = data.toString();
//     console.log("Received packet:", packet);
//     if (packet.split(":").length == 2) {
//       const channel = packet.split(":")[0];
//       const value = packet.split(":")[1];
//       sendPortUpdate(channel, value);
//     }
//   });

//   socket.on("end", () => {
//     console.log("Client disconnected");
//   });
// });

// server.listen(3001, "192.168.152.245", () => {
//   console.log("TCP server started on port 3001");
// });
