const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

/* === 🧾 後端設定票數總量 === */
const TOTAL_TICKETS = {
  A: 225,
  B: 340,
  C: 250
};
/* ========================== */

// 實際剩餘票數（伺服器啟動時初始化一次）
let remaining = { ...TOTAL_TICKETS };

io.on('connection', socket => {
  console.log('🟢 新連線');

  // 傳送初始票數
  socket.emit('update', { total: TOTAL_TICKETS, remaining });

  // 售出
  socket.on('sell', zone => {
    if (remaining[zone] > 0) {
      remaining[zone]--;
      io.emit('update', { total: TOTAL_TICKETS, remaining });
    }
  });

  // 退回
  socket.on('refund', zone => {
    if (remaining[zone] < TOTAL_TICKETS[zone]) {
      remaining[zone]++;
      io.emit('update', { total: TOTAL_TICKETS, remaining });
    }
  });
});

const PORT = 5000;
server.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
