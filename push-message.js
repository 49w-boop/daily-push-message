const axios = require('axios');

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

// 获取用户 OpenID 列表
async function getOpenIds(accessToken) {
  const response = await axios.get('https://api.weixin.qq.com/cgi-bin/user/get', {
    params: {
      access_token: accessToken,
    },
  });
  return response.data.data.openid;
}

// 发送消息
async function sendMessage(accessToken, openId) {
  const message = {
    touser: openId,
    msgtype: 'text',
    text: {
      content: `早上好！今天是${new Date().toLocaleDateString()}，祝您一天好心情！`,
    },
  };
  await axios.post(`https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${accessToken}`, message);
}

// 主逻辑
async function main() {
  const accessToken = await getAccessToken();
  const openIds = await getOpenIds(accessToken);
  for (const openId of openIds) {
    await sendMessage(accessToken, openId);
    console.log(`消息已发送给用户 ${openId}`);
  }
}

main().catch(console.error);