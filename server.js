const http = require("http");
const dgram = require("dgram");

const UDP_IP = "192.168.4.1";
const UDP_PORT = 4210;
const HTTP_PORT = 3000;

const sock = dgram.createSocket("udp4");

// Sensor listener
const sensorSock = dgram.createSocket("udp4");
sensorSock.bind(4211);

let latestSensors = { s1: -1, s2: -1, spd: 0 };

sensorSock.on("message", (msg) => {
  try {
    latestSensors = JSON.parse(msg.toString());
  } catch (e) {
    console.error("Bad sensor packet:", msg.toString());
  }
});

function sendUDP(msg) {
  const buf = Buffer.from(msg, "utf8");
  sock.send(buf, 0, buf.length, UDP_PORT, UDP_IP);
}

const server = http.createServer((req, res) => {
  const parsed = new URL(req.url, `http://${req.headers.host}`);
  const q = parsed.searchParams;

  const cmd = q.get("q") || "";
  const spd = q.get("spd") || "";

  if (spd !== "") sendUDP(`spd:${spd}`);

  if (cmd === "cf") sendUDP("forward");
  else if (cmd === "cb") sendUDP("backward");
  else if (cmd === "cl") sendUDP("left");
  else if (cmd === "cr") sendUDP("right");
  else if (cmd === "cs") sendUDP("stop");

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(latestSensors));
});

server.listen(HTTP_PORT, () => {
  console.log(`UDP bridge running at http://localhost:${HTTP_PORT}/robot`);
});
