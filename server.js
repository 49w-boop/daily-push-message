const express = require('express');
const { parseString } = require('xml2js');
const axios = require('axios');
const app = express();
const PORT = 80;

const WECHAT_TOKEN = '1234567890';

// 关键词-回复配置
const keywordResponses = {
  '今日天气': '今天晴天，25℃~30℃，适合外出~', // 静态回复
  '今日运势': "今日运势爆棚,好运加加加!",
  '帮助': '支持查询：今日天气、每日一言',
};

// 处理微信验证
app.get('/wechat', (req, res) => {
  const { signature, timestamp, nonce, echostr } = req.query;
  if (isValidWeChatSignature(signature, timestamp, nonce, WECHAT_TOKEN)) {
    res.send(echostr);
  } else {
    res.status(403).send('Invalid signature');
  }
});
// 使用 express.text() 解析 XML 数据
app.post('/wechat', express.text({ type: 'application/xml' }), async (req, res) => {
  parseString(req.body, async (err, result) => {
    if (err) {
      console.error('XML 解析失败:', err);
      return res.status(400).send('Invalid XML');
    }

    const { xml } = result;
    const msgType = xml.MsgType?.[0];
    const fromUser = xml.FromUserName?.[0];
    const toUser = xml.ToUserName?.[0];

    console.log('xml', xml);

    if (msgType === 'text') {
      const userText = xml.Content?.[0]?.trim();
      let replyText;

      // 检查是否为关键词
      if (userText && keywordResponses[userText]) {
        replyText = typeof keywordResponses[userText] === 'function'
          ? keywordResponses[userText]()
          : keywordResponses[userText];
      } else {
        replyText = `你发送了：${userText}`;
      }

      // 返回 XML
      const replyXml = `
        <xml>
          <ToUserName><![CDATA[${fromUser}]]></ToUserName>
          <FromUserName><![CDATA[${toUser}]]></FromUserName>
          <CreateTime>${Math.floor(Date.now() / 1000)}</CreateTime>
          <MsgType><![CDATA[text]]></MsgType>
          <Content><![CDATA[${replyText}]]></Content>
        </xml>
      `;
      res.type('application/xml').send(replyXml);
    } else {
      // 其他消息类型
      console.log('收到消息:', xml);
      res.send('success');
    }
  });
});


// 从环境变量中获取配置
const APP_ID = 'wx22228a1ac8bb90b3';
const APP_SECRET = '688f6c83f6399364f5d14059b62f3fe7';

// 获取 Access Token
async function getAccessToken() {
  const response = await axios.get('https://api.weixin.qq.com/cgi-bin/token', {
    params: {
      grant_type: 'client_credential',
      appid: APP_ID,
      secret: APP_SECRET,
    },
  });
  console.log(response);

  return response.data.access_token;
}
// 发送消息
async function sendMenu() {
  let accessToken=await  getAccessToken()
    const message ={
        "button":[
        {
             "type":"click",
             "name":"今日天气",
             "key":"click_1"
         },
         {
            "type":"click",
            "name":"今日运势",
            "key":"click_2"
        },
        ]
    }
    await axios.post(`https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${accessToken}`, message);
  }




// 校验签名
function isValidWeChatSignature(signature, timestamp, nonce, token) {
  const crypto = require('crypto');
  const str = [token, timestamp, nonce].sort().join('');
  const sha1 = crypto.createHash('sha1').update(str).digest('hex');
  return sha1 === signature;
}

app.listen(PORT, () =>{
    sendMenu()
    console.log(`Server running on http://101.42.101.250:${PORT}`)
});