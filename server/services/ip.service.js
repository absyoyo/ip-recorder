import { Searcher } from 'ip2region.js';
import path from 'path';
import fs from 'fs';

export const getIpInfo = async (ip) => {
  const xdbPath = path.resolve('data/ip2region.xdb');
  
  if (!fs.existsSync(xdbPath)) {
    return { country: '未知', province: '未知', city: '未知', isp: '未知' };
  }

  try {
    const searcher = Searcher.newWithFileOnly(xdbPath);
    const data = await searcher.search(ip);
    
    if (data && data.region) {
      // 格式: 国家|区域|省份|城市|ISP
      const [country, region, province, city, isp] = data.region.split('|');
      return { 
        country: country === '0' ? '未知' : country, 
        province: province === '0' ? '未知' : province, 
        city: city === '0' ? '未知' : city, 
        isp: isp === '0' ? '未知' : isp 
      };
    }
    return { country: '未知', province: '未知', city: '未知', isp: '未知' };
  } catch (e) {
    // console.error('IP search error:', e);
    return { country: '未知', province: '未知', city: '未知', isp: '未知' };
  }
};
