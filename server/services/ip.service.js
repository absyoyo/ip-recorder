import { newWithFileOnly, versionFromHeader, loadHeaderFromFile } from 'ip2region.js';
import path from 'path';
import fs from 'fs';

const xdbPath = path.resolve('data/ip2region.xdb');

let searcher = null;

function getSearcher() {
  if (searcher) return searcher;
  if (!fs.existsSync(xdbPath)) return null;
  const header = loadHeaderFromFile(xdbPath);
  const version = versionFromHeader(header);
  searcher = newWithFileOnly(version, xdbPath);
  return searcher;
}

const UNKNOWN = '未知';

export const getIpInfo = async (ip) => {
  const s = getSearcher();
  if (!s) return { country: UNKNOWN, province: UNKNOWN, city: UNKNOWN, isp: UNKNOWN };

  try {
    const region = await s.search(ip);
    if (!region) return { country: UNKNOWN, province: UNKNOWN, city: UNKNOWN, isp: UNKNOWN };

    // 格式: 国家|省份|城市|ISP|国家代码
    const [country, province, city, isp] = region.split('|');
    return {
      country:  (!country  || country  === '0' || country  === 'Reserved') ? UNKNOWN : country,
      province: (!province || province === '0' || province === 'Reserved') ? UNKNOWN : province,
      city:     (!city     || city     === '0' || city     === 'Reserved') ? UNKNOWN : city,
      isp:      (!isp      || isp      === '0' || isp      === 'Reserved') ? UNKNOWN : isp,
    };
  } catch {
    return { country: UNKNOWN, province: UNKNOWN, city: UNKNOWN, isp: UNKNOWN };
  }
};
