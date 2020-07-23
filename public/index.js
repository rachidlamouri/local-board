const [canvas] = document.getElementsByTagName('canvas');
const context = canvas.getContext('2d');
const random = () => `${Math.floor(Math.random()*100000000)}`;

let wsPort;
let connectionId;
const segments = {};
let segmentId;
let lastButton;

const messageQueue = [];

const setup = () => {
  const socket = new WebSocket(`ws://${window.location.hostname}:${wsPort}`);

  socket.addEventListener('message', (event) => {
    if (!connectionId) {
      connectionId = event.data;
      console.log('Connected:', connectionId)
    } else {
      const messages = JSON.parse(event.data);
      messages.forEach(([otherSegmentId, [x, y]]) => {
        if (!segments[otherSegmentId]) {
          segments[otherSegmentId] = {};
        }
        segments[otherSegmentId][`${x}-${y}`] = [x, y];
      })
    }
  });

  canvas.addEventListener('mousemove', (event) => {
    if (lastButton !== 1 && event.buttons === 1) {
      segmentId = random();
      segments[segmentId] = {};
    }

    lastButton = event.buttons;

    if (event.buttons === 1) {
      const { offsetX, offsetY } = event;

      const pointId = `${offsetX}-${offsetY}`;
      const point = [offsetX, offsetY];

      const segment = segments[segmentId];
      segment[pointId] = point;

      messageQueue.push([segmentId, point])
    }
  })

  const draw = () => {
    context.clearRect(0, 0, canvas.width, canvas.width);

    context.fillStyle = '#000000';
    context.lineWidth = '2';
    Object.values(segments).forEach((segment) => {
      context.beginPath();
      Object.values(segment).forEach(([x, y]) => {
        context.arc(x, y, 2, 0, Math.PI*2);
      });
      context.stroke();
    });

    window.requestAnimationFrame(draw);
  };
  draw();

  const sendData = () => {
    const points = messageQueue.splice(0, 100);
    if (points.length > 0) {
      console.log(`Sending ${points.length} points`);
      socket.send(JSON.stringify([connectionId, points]));
    }
  };
  setInterval(sendData, 1000)

};

(async () => {
  wsPort = await fetch('/wsport')
    .then((response) => response.json());

  setup();
})();
