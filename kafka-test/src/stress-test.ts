process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const axios = require('axios');

const cookie =
  'session=eyJqd3QiOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcFpDSTZJalk1TldObVpqSTFNV1k1TW1KaE5HTmxPREE1WkRreU1DSXNJbVZ0WVdsc0lqb2lkR1Z6ZEVCMFpYTjBMbU52YlNJc0ltbGhkQ0k2TVRjMk56Y3dNak14TTMwLkRfbkVqS3ZtVVdkMWJPTHBlTFZFb0tGOUhiWVVTOGRTWDJuZU4yYzFWV1kifQ';


const doRequest = async () => {

  const { data } = await axios.post(
    `https://ticketing.dev/api/tickets`,
    { title: 'ticket', price: 5 },
    {
      headers: { cookie },
    }
  );

  //console.log({ data })

  await axios.put(
    `https://ticketing.dev/api/tickets/${data.id}`,
    { title: 'ticket', price: 10 },
    {
      headers: { cookie },
    }
  );

  await axios.put(
    `https://ticketing.dev/api/tickets/${data.id}`,
    { title: 'ticket', price: 15 },
    {
      headers: { cookie },
    }
  );
};

(async () => {
  const limit = 200
  console.log('Running...');
  for (let i = 0; i < limit; i++) {
    await doRequest();
  }
  console.log('Request complete: ', limit);
})();