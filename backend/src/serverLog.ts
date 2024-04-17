import fs from 'fs';

export const serverLog = (msg: string) => {
  const log = `[server: ${new Date().toLocaleString()}] ${msg}`;
  console.log(log);
  //log.txtにログを出力
  fs.appendFile('log.txt', `${log}\n`, (err) => {
    if (err) {
      console.error(err);
    }
  });
};
