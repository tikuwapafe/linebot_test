require('dotenv').config();

const express = require('express');
const line = require('@line/bot-sdk');

console.log("ACCESS TOKEN:", process.env.CHANNEL_ACCESS_TOKEN);
console.log("SECRET:", process.env.CHANNEL_SECRET);

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const app = express();
const client = new line.Client(config);

app.get('/', (req, res) => {
  res.send('LINE BOT is running!');
});

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then(result => res.json(result))
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
});

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  // 「メニュー」って送ってきたらFlexを返す
  if (event.message.text === 'メニュー') {
    const flexMessage = {
      type: 'flex',
      altText: '限定商品のお知らせ！',
      contents: {
        type: 'bubble',
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '今だけの限定商品！',
              weight: 'bold',
              size: 'lg'
            },
            {
              type: 'button',
              action: {
                type: 'uri',
                label: 'Webで見る',
                uri: 'https://linebot-test-eu32.onrender.com/'
              },
              style: 'primary'
            }
          ]
        }
      }
    };

    return client.replyMessage(event.replyToken, flexMessage);
  }

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: `「${event.message.text}」ですね！`,
  });
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
