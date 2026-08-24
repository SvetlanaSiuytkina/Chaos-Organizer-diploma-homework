import Koa from 'koa';
import Router from 'koa-router';
import koaBody from 'koa-body';
import koaStatic from 'koa-static';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import cors from '@koa/cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = new Koa();
const router = new Router();
const port = process.env.PORT || 7070;

//папка для загруженных файлов
const uploadDir = path.join(__dirname, '../public/uploads');

//cоздаем папку
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

let messages = [
  {
    id: uuidv4(),
    text: 'Добро пожаловать в Chaos Organizer!',
    type: 'incoming',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    pinned: false,
    favorited: false,
    file: null
  }
]

//разрешаем запросы сфронтенда порт 8080
app.use(cors());

//Middleware парсинг JSON и файлов
app.use(koaBody({
  multipart: true,
  formidable: { uploadDir, keepExtensions: true },
}));

//API получить сообщ
router.get('/api/messages', (ctx) => {
  const offset = parseInt(ctx.query.offset) || 0;
  const limit = parseInt(ctx.query.limit) || 10;
  const query = ctx.query.q?.toLowerCase() || '';

  let filteredMessages = messages.filter(msg => {
    const textMatch = msg.text && msg.text.toLowerCase().includes(query);
    const fileMatch = msg.file && msg.file.name.toLowerCase().includes(query);
    return textMatch || fileMatch;
  });

  const total = messages.length;
  const paginated = filteredMessages
    .slice(Math.max(0, total - offset - limit), total - offset)
    .reverse();

  ctx.body = {
    messages: paginated,
    hasMore: offset + limit < total,
    offset: offset + limit
  }
});

//API отправить cообщ
router.post('/api/messages', async (ctx) => {
  const { text } = ctx.request.body;
  
  if (!text || !text.trim()) {
    ctx.status = 400;
    ctx.body = { error: 'Текст сообщения не может быть пустым' };
    return;
  }

  const newMessage = {
    id: uuidv4(),
    text,
    type: 'outgoing',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    pinned: false,
    favorited: false,
    file: null  
  };

  messages.push(newMessage);
  ctx.body = newMessage;
});

//API загрузить файл
router.post('/api/upload', async (ctx) => {
  const file = ctx.request.files.file;

  if (!file) {
    ctx.status = 400;
    ctx.body = { error: 'Нет файла' };
    return;
  }

  const originalName = file.name;
  const uniqueName = `${Date.now()}_${originalName}`;
  const savePath = path.join(uploadDir, uniqueName);

  fs.renameSync(file.path, savePath);

  const fileUrl = `/uploads/${uniqueName}`;

  ctx.body = {
    name: originalName,
    size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
    url: fileUrl,
  };
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(port, () => {
  console.log(`сервер запустился на http://localhost:${port}`);
});