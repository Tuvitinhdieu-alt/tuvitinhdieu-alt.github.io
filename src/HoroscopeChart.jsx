import React, { useMemo, useEffect } from 'react';
import { getTuanTrietPosition } from './horoscopeCalculator';
import HoroscopeCanvas from './HoroscopeCanvas';
import KhamThienTuHoa from './KhamThienTuHoa';

function HoroscopeChart({ chartData, birthInfo, isTuHoaMode = false, isAnSaoLuu = false, isNamPhaiOff = false, onCalculated }) {
  if (!chartData) return null;

  const { chart = [], lunarInfo = {} } = chartData || {};

  const cungArray = [
    { name: 'Ty', label: 'Tỵ', row: 1, col: 1 },
    { name: 'Ngo', label: 'Ngọ', row: 1, col: 2 },
    { name: 'Mui', label: 'Mùi', row: 1, col: 3 },
    { name: 'Than', label: 'Thân', row: 1, col: 4 },
    { name: 'Dau', label: 'Dậu', row: 2, col: 4 },
    { name: 'Tuat', label: 'Tuất', row: 3, col: 4 },
    { name: 'Hoi', label: 'Hợi', row: 4, col: 4 },
    { name: 'Ty2', label: 'Tý', row: 4, col: 3 },
    { name: 'Suu', label: 'Sửu', row: 4, col: 2 },
    { name: 'Dan', label: 'Dần', row: 4, col: 1 },
    { name: 'Mao', label: 'Mão', row: 3, col: 1 },
    { name: 'Thin', label: 'Thìn', row: 2, col: 1 }
  ];

  const palaceCoordinates = useMemo(() => {
    const result = {};
    cungArray.forEach((slot) => {
      result[slot.label] = {
        x: ((slot.col - 1) / 4) * 100,
        y: ((slot.row - 1) / 4) * 100,
        width: 25,
        height: 25
      };
    });
    return result;
  }, []);

  const TUAN_TRIET_POSITIONS = {
    'Thìn_Tỵ': { position: 'absolute', top: '25%', left: '12.5%', transform: 'translate(-50%, -50%)', zIndex: 10 },
    'Dần_Mão': { position: 'absolute', top: '75%', left: '12.5%', transform: 'translate(-50%, -50%)', zIndex: 10 },
    'Thân_Dậu': { position: 'absolute', top: '25%', left: '87.5%', transform: 'translate(-50%, -50%)', zIndex: 10 },
    'Tuất_Hợi': { position: 'absolute', top: '75%', left: '87.5%', transform: 'translate(-50%, -50%)', zIndex: 10 },
    'Ngọ_Mùi': { position: 'absolute', top: '25%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 },
    'Tý_Sửu': { position: 'absolute', top: '75%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }
  };

  const CHI_ORDER = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
  const CUNG_RING_CLOCKWISE = ['Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn'];
  const CUNG_TITLES = ['Mệnh', 'Phụ Mẫu', 'Phúc Đức', 'Điền Trạch', 'Quan Lộc', 'Nô Bộc', 'Thiên Di', 'Tật Ách', 'Tài Bạch', 'Tử Tức', 'Phu Thê', 'Huynh Đệ'];
  const DIA_CHI_TU_DAN = ['Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu'];

  const canCungMap = useMemo(() => {
    const yearCan = String(lunarInfo?.yearCanChi || '').split(' ')[0] || '';
    const thienCanDayDu = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
    const thienCanVietTat = {
      'Giáp': 'G',
      'Ất': 'Ấ',
      'Bính': 'B',
      'Đinh': 'Đ',
      'Mậu': 'M',
      'Kỷ': 'K',
      'Canh': 'C',
      'Tân': 'T',
      'Nhâm': 'N',
      'Quý': 'Q'
    };

    let startCanIndex = 0;
    if (['Giáp', 'Kỷ'].includes(yearCan)) startCanIndex = 2;
    else if (['Ất', 'Canh'].includes(yearCan)) startCanIndex = 4;
    else if (['Bính', 'Tân'].includes(yearCan)) startCanIndex = 6;
    else if (['Đinh', 'Nhâm'].includes(yearCan)) startCanIndex = 8;
    else if (['Mậu', 'Quý'].includes(yearCan)) startCanIndex = 0;

    const result = {};
    DIA_CHI_TU_DAN.forEach((chi, idx) => {
      const can = thienCanDayDu[(startCanIndex + idx) % 10];
      result[chi] = thienCanVietTat[can] || can;
    });
    return result;
  }, [lunarInfo?.yearCanChi]);

  const toKey = (value) =>
    String(value || '')
      .toLowerCase()
      .trim();

  const getChiPolaritySign = (chi) => {
    const idx = CHI_ORDER.findIndex((c) => c === chi);
    if (idx === -1) return '';
    return idx % 2 === 0 ? '+' : '-';
  };

  const palaceMap = useMemo(() => {
    const map = {};
    if (Array.isArray(chart)) {
      chart.forEach((p) => {
        if (p) {
          const candidates = [p.name, p.palaceName, p.chi, p.branch].filter(Boolean);
          candidates.forEach((c) => {
            if (c) map[toKey(c)] = p;
          });
        }
      });
    }
    return map;
  }, [chart]);

  const getSubStars = (palace, chi) => {
    const list = palace?.subStars || palace?.phuTinh || [];
    const base = Array.isArray(list) ? list : [];
    const extra = subStarsMap[chi] || [];
    return [...new Set([...base, ...extra])];
  };

  const BAD_STARS = new Set([
    'Kình Dương', 'Đà La', 'Hỏa Tinh', 'Linh Tinh', 'Địa Không', 'Địa Kiếp',
    'Lưu Hà', 'Thiên Hình', 'Thiên Diêu', 'Thiên Khốc', 'Thiên Hư', 'Cô Thần',
    'Quả Tú', 'Phá Toái', 'Phi Liêm', 'Bệnh Phù', 'Đại Hao', 'Phục Binh',
    'Quan Phủ', 'Tang Môn', 'Quan Phù', 'Tử Phù', 'Tuế Phá', 'Bạch Hổ',
    'Điếu Khách', 'Trực Phù', 'Kiếp Sát', 'Thiên Không', 'T.Không', 'Thiên La', 'Địa Võng',
    'Đẩu Quân', 'Hóa Kỵ', 'Tiểu Hao'
  ]);

  const TU_HOA_ORDER = ['Hóa Lộc', 'Hóa Quyền', 'Hóa Khoa', 'Hóa Kỵ'];
  const LOC_TON_RING_ORDER = [
    'Lộc Tồn',
    'Bác Sĩ', 'Lực Sỹ', 'Thanh Long', 'Tiểu Hao', 'Tướng Quân',
    'Tấu Thư', 'Phi Liêm', 'Hỉ Thần', 'Bệnh Phù', 'Đại Hao', 'Phục Binh', 'Quan Phủ'
  ];
  const THAI_TUE_RING_ORDER = [
    'Thái Tuế', 'Thiếu Dương', 'Tang Môn', 'Thiếu Âm', 'Quan Phù',
    'Tử Phù', 'Tuế Phá', 'Long Đức', 'Bạch Hổ', 'Phúc Đức', 'Điếu Khách', 'Trực Phù'
  ];
  const DAO_KHONG_SAT_ORDER = ['Đào Hoa', 'Thiên Không', 'Kiếp Sát'];
  const BAD_STAR_HEAD_ORDER = ['Hóa Kỵ', 'Kình Dương', 'Đà La', 'Hỏa Tinh', 'Linh Tinh', 'Địa Không', 'Địa Kiếp'];

  const makeOrderMap = (arr, start = 0) => {
    const map = {};
    arr.forEach((name, idx) => {
      map[name] = start + idx;
    });
    return map;
  };

  const globalPriorityMap = {
    ...makeOrderMap(TU_HOA_ORDER, 0),
    ...makeOrderMap(LOC_TON_RING_ORDER, 20),
    ...makeOrderMap(THAI_TUE_RING_ORDER, 60),
    ...makeOrderMap(DAO_KHONG_SAT_ORDER, 90)
  };
  const badHeadPriorityMap = makeOrderMap(BAD_STAR_HEAD_ORDER, 0);

  const sortSubStarsForDisplay = (stars) => {
    return [...stars]
      .map((name, idx) => ({ name: String(name), idx }))
      .sort((a, b) => {
        const pa = Object.prototype.hasOwnProperty.call(globalPriorityMap, a.name) ? globalPriorityMap[a.name] : 1000 + a.idx;
        const pb = Object.prototype.hasOwnProperty.call(globalPriorityMap, b.name) ? globalPriorityMap[b.name] : 1000 + b.idx;
        return pa - pb;
      })
      .map((item) => item.name);
  };

  const sortBadStarsForDisplay = (stars) => {
    return [...stars]
      .map((name, idx) => ({ name: String(name), idx }))
      .sort((a, b) => {
        const aInHead = Object.prototype.hasOwnProperty.call(badHeadPriorityMap, a.name);
        const bInHead = Object.prototype.hasOwnProperty.call(badHeadPriorityMap, b.name);
        if (aInHead && bInHead) return badHeadPriorityMap[a.name] - badHeadPriorityMap[b.name];
        if (aInHead && !bInHead) return -1;
        if (!aInHead && bInHead) return 1;

        const pa = Object.prototype.hasOwnProperty.call(globalPriorityMap, a.name) ? globalPriorityMap[a.name] : 1000 + a.idx;
        const pb = Object.prototype.hasOwnProperty.call(globalPriorityMap, b.name) ? globalPriorityMap[b.name] : 1000 + b.idx;
        return pa - pb;
      })
      .map((item) => item.name);
  };

  const FIXED_BOTTOM_STARS = new Set(['Thiên La', 'Địa Võng', 'Thiên Thương', 'Thiên Sứ']);

  const SUB_STAR_STATUS_BY_STAR = {
    'Kình Dương': ['H', 'Đ', '-', 'H', 'Đ', '-', 'H', 'Đ', '-', 'H', 'Đ', '-'],
    'Đà La': ['-', 'Đ', 'H', '-', 'Đ', 'H', '-', 'Đ', 'H', '-', 'Đ', 'H'],
    'Hỏa Tinh': ['H', 'H', 'Đ', 'Đ', 'Đ', 'Đ', 'Đ', 'H', 'H', 'H', 'H', 'H'],
    'Linh Tinh': ['H', 'H', 'Đ', 'Đ', 'Đ', 'Đ', 'Đ', 'H', 'H', 'H', 'H', 'H'],
    'Địa Không': ['H', 'H', 'Đ', 'H', 'H', 'Đ', 'H', 'H', 'Đ', 'H', 'H', 'Đ'],
    'Địa Kiếp': ['H', 'H', 'Đ', 'H', 'H', 'Đ', 'H', 'H', 'Đ', 'H', 'H', 'Đ'],
    'Thiên Hình': ['H', 'H', 'Đ', 'Đ', 'H', 'H', 'H', 'H', 'Đ', 'Đ', 'H', 'H'],
    'Thiên Khốc': ['Đ', 'H', 'Đ', 'H', 'H', 'H', 'Đ', 'H', 'Đ', 'H', 'H', 'H'],
    'Thiên Mã': ['-', '-', 'Đ', '-', '-', 'Đ', '-', '-', 'Đ', '-', '-', 'H'],
    'Đại Hao': ['H', 'H', 'Đ', 'Đ', 'H', 'H', 'H', 'H', 'Đ', 'Đ', 'H', 'H'],
    'Tiểu Hao': ['H', 'H', 'Đ', 'Đ', 'H', 'H', 'H', 'H', 'Đ', 'Đ', 'H', 'H'],
    'Tang Môn': ['H', 'H', 'Đ', 'Đ', 'H', 'H', 'H', 'H', 'Đ', 'Đ', 'H', 'H'],
    'Bạch Hổ': ['H', 'H', 'Đ', 'Đ', 'H', 'H', 'H', 'H', 'Đ', 'Đ', 'H', 'H']
  };

  const formatSubStarWithStatus = (starName, chi) => {
    const name = String(starName);
    const branch = String(chi || '');
    const hoaStatusRules = {
      'Hóa Kỵ': {
        dac: new Set(['Thìn', 'Tuất', 'Sửu', 'Mùi']),
        ham: new Set(['Tý', 'Dần', 'Mão', 'Tỵ', 'Ngọ', 'Thân', 'Dậu', 'Hợi'])
      },
      'Hóa Lộc': {
        dac: new Set(['Thìn', 'Tuất', 'Sửu', 'Mùi', 'Dần', 'Mão']),
        ham: new Set(['Tý', 'Ngọ', 'Thân', 'Dậu'])
      },
      'Hóa Quyền': {
        dac: new Set(['Thìn', 'Tuất', 'Sửu', 'Mùi']),
        ham: new Set(['Tý', 'Ngọ', 'Thân', 'Dậu', 'Hợi'])
      }
    };

    const hoaRule = hoaStatusRules[name];
    if (hoaRule) {
      if (hoaRule.dac.has(branch)) return `${name}(Đ)`;
      if (hoaRule.ham.has(branch)) return `${name}(H)`;
      return name;
    }

    const rule = SUB_STAR_STATUS_BY_STAR[name];
    const chiIdx = CHI_ORDER.findIndex((c) => c === chi);
    if (!rule || chiIdx === -1) return name;
    const status = rule[chiIdx];
    if (status === 'Đ' || status === 'H') return `${name}(${status})`;
    return name;
  };

  const SUB_STAR_ELEMENT_COLOR = {
    Kim: '#857f7f',
    Moc: '#2bac31',
    Thuy: '#111111',
    Hoa: '#df4949',
    Tho: '#ceab1fea'
  };

  const SUB_STAR_ELEMENT_MAP = {
    'Kình Dương': 'Kim', 'Tử Phù': 'Kim', 'Tấu Thư': 'Kim', 'Thai Phụ': 'Kim', 'Bạch Hổ': 'Kim', 'Văn Xương': 'Kim', 'Hoa Cái': 'Kim', 'Đà La': 'Kim',

    'Phượng Các': 'Moc', 'Giải Thần': 'Moc', 'Tang Môn': 'Moc', 'Hóa Quyền': 'Moc', 'Hóa Khoa': 'Moc', 'Đào Hoa': 'Moc', 'Tướng Quân': 'Moc',
    'Hóa Lộc': 'Moc', 'Đường Phù': 'Moc', 'Ân Quang': 'Moc',

    'Bác Sĩ': 'Thuy', 'Thiên Hỉ': 'Thuy', 'Thiên Hỷ': 'Thuy', 'Lưu Hà': 'Thuy', 'Thiếu Âm': 'Thuy', 'Thanh Long': 'Thuy', 'Hóa Kỵ': 'Thuy',
    'Long Trì': 'Thuy', 'Văn Khúc': 'Thuy', 'Thiên Hư': 'Thuy', 'Long Đức': 'Thuy', 'Âm Sát': 'Thuy', 'Thiên Khốc': 'Thuy', 'Thiên Y': 'Thuy',
    'Thiên Diêu': 'Thuy', 'Thiên Sứ': 'Thuy', 'Tam Thai': 'Thuy', 'Hữu Bật': 'Thuy', 'Hồng Loan': 'Thuy',

    'Địa Không': 'Hoa', 'Địa Kiếp': 'Hoa', 'Thiên Không': 'Hoa', 'Kiếp Sát': 'Hoa', 'Thái Tuế': 'Hoa', 'Thiên Việt': 'Hoa', 'Thiên Mã': 'Hoa',
    'Hỏa Tinh': 'Hoa', 'Quan Phủ': 'Hoa', 'Tiểu Hao': 'Hoa', 'Thiên Giải': 'Hoa', 'Nguyệt Đức': 'Hoa', 'Đẩu Quân': 'Hoa', 'Đấu Quân': 'Hoa',
    'Tuế Phá': 'Hoa', 'Thiên Hình': 'Hoa', 'Phi Liêm': 'Hoa', 'Hỷ Thần': 'Hoa', 'Hỉ Thần': 'Hoa', 'Thiên Khôi': 'Hoa',
    'Thiên Đức': 'Hoa', 'Phá Toái': 'Hoa', 'Điếu Khách': 'Hoa', 'Đại Hao': 'Hoa', 'Thiên Quan': 'Hoa', 'Trực Phù': 'Hoa', 'Phục Binh': 'Hoa',
    'Linh Tinh': 'Hoa', 'Lực Sĩ': 'Hoa', 'Lực Sỹ': 'Hoa',

    'Tả Phù': 'Tho', 'Thiếu Dương': 'Hoa', 'Lộc Tồn': 'Tho', 'Cô Thần': 'Tho', 'Thiên Trù': 'Tho',
    'Phong Cáo': 'Tho', 'Địa Giải': 'Tho', 'Địa Võng': 'Kim', 'Thiên Quý': 'Tho', 'Phúc Đức': 'Tho',
    'Quốc Ấn': 'Tho', 'Thiên Thọ': 'Tho', 'Bệnh Phù': 'Tho', 'Quả Tú': 'Tho', 'Thiên Tài': 'Tho', 'Thiên Thương': 'Tho',
    'Thiên Phúc': 'Tho',

    'Bát Tọa': 'Moc',
    'Thiên La': 'Kim'
  };

  const getSubStarColor = (starName) => {
    const element = SUB_STAR_ELEMENT_MAP[String(starName)];
    if (!element) return undefined;
    return SUB_STAR_ELEMENT_COLOR[element];
  };

  const getLuuStarColor = (luuStarLabel) => {
    const baseStar = String(luuStarLabel || '').replace(/^L\./, '').trim();
    return getSubStarColor(baseStar);
  };

  const getMainStarColor = (starName) => {
    const elementByStar = {
      'Thiên Cơ': 'Mộc',
      'Thiên Lương': 'Mộc',
      'Tử Vi': 'Thổ',
      'Thiên Phủ': 'Thổ',
      'Thái Âm': 'Thủy',
      'Tham Lang': 'Thủy',
      'Cự Môn': 'Thủy',
      'Thiên Đồng': 'Thủy',
      'Phá Quân': 'Thủy',
      'Thiên Tướng': 'Thủy',
      'Liêm Trinh': 'Hỏa',
      'Thái Dương': 'Hỏa',
      'Vũ Khúc': 'Kim',
      'Thất Sát': 'Kim'
    };

    const colorByElement = {
      'Mộc': '#16a34a',
      'Hỏa': '#ef4444',
      'Thổ': '#d4a017',
      'Kim': '#7a8796',
      'Thủy': '#1f2937'
    };

    const element = elementByStar[String(starName || '').trim()];
    return colorByElement[element] || '#111111';
  };

  const CHINH_TINH_TRANG_THAI = {
    'Tử Vi': { 'Tý': 'B', 'Sửu': 'Đ', 'Dần': 'M', 'Mão': 'B', 'Thìn': 'V', 'Tỵ': 'M', 'Ngọ': 'M', 'Mùi': 'Đ', 'Thân': 'M', 'Dậu': 'B', 'Tuất': 'V', 'Hợi': 'B' },
    'Thiên Tướng': { 'Tý': 'V', 'Sửu': 'Đ', 'Dần': 'M', 'Mão': 'H', 'Thìn': 'V', 'Tỵ': 'Đ', 'Ngọ': 'V', 'Mùi': 'Đ', 'Thân': 'M', 'Dậu': 'H', 'Tuất': 'V', 'Hợi': 'Đ' },
    'Thiên Lương': { 'Tý': 'V', 'Sửu': 'Đ', 'Dần': 'V', 'Mão': 'V', 'Thìn': 'M', 'Tỵ': 'H', 'Ngọ': 'M', 'Mùi': 'Đ', 'Thân': 'V', 'Dậu': 'H', 'Tuất': 'M', 'Hợi': 'H' },
    'Thất Sát': { 'Tý': 'M', 'Sửu': 'Đ', 'Dần': 'M', 'Mão': 'H', 'Thìn': 'H', 'Tỵ': 'V', 'Ngọ': 'M', 'Mùi': 'Đ', 'Thân': 'M', 'Dậu': 'H', 'Tuất': 'H', 'Hợi': 'V' },
    'Liêm Trinh': { 'Tý': 'V', 'Sửu': 'Đ', 'Dần': 'V', 'Mão': 'H', 'Thìn': 'M', 'Tỵ': 'H', 'Ngọ': 'V', 'Mùi': 'Đ', 'Thân': 'V', 'Dậu': 'H', 'Tuất': 'M', 'Hợi': 'H' },
    'Phá Quân': { 'Tý': 'M', 'Sửu': 'V', 'Dần': 'H', 'Mão': 'H', 'Thìn': 'Đ', 'Tỵ': 'H', 'Ngọ': 'M', 'Mùi': 'V', 'Thân': 'H', 'Dậu': 'H', 'Tuất': 'Đ', 'Hợi': 'H' },
    'Thiên Đồng': { 'Tý': 'V', 'Sửu': 'H', 'Dần': 'M', 'Mão': 'Đ', 'Thìn': 'H', 'Tỵ': 'Đ', 'Ngọ': 'H', 'Mùi': 'H', 'Thân': 'M', 'Dậu': 'H', 'Tuất': 'H', 'Hợi': 'Đ' },
    'Vũ Khúc': { 'Tý': 'V', 'Sửu': 'M', 'Dần': 'V', 'Mão': 'Đ', 'Thìn': 'M', 'Tỵ': 'H', 'Ngọ': 'V', 'Mùi': 'M', 'Thân': 'V', 'Dậu': 'Đ', 'Tuất': 'M', 'Hợi': 'H' },
    'Thiên Phủ': { 'Tý': 'M', 'Sửu': 'B', 'Dần': 'M', 'Mão': 'B', 'Thìn': 'V', 'Tỵ': 'Đ', 'Ngọ': 'M', 'Mùi': 'Đ', 'Thân': 'M', 'Dậu': 'B', 'Tuất': 'V', 'Hợi': 'Đ' },
    'Thái Âm': { 'Tý': 'V', 'Sửu': 'Đ', 'Dần': 'H', 'Mão': 'H', 'Thìn': 'H', 'Tỵ': 'H', 'Ngọ': 'H', 'Mùi': 'Đ', 'Thân': 'V', 'Dậu': 'M', 'Tuất': 'M', 'Hợi': 'M' },
    'Thái Dương': { 'Tý': 'H', 'Sửu': 'Đ', 'Dần': 'V', 'Mão': 'V', 'Thìn': 'V', 'Tỵ': 'M', 'Ngọ': 'M', 'Mùi': 'Đ', 'Thân': 'H', 'Dậu': 'H', 'Tuất': 'H', 'Hợi': 'H' },
    'Tham Lang': { 'Tý': 'H', 'Sửu': 'M', 'Dần': 'Đ', 'Mão': 'H', 'Thìn': 'V', 'Tỵ': 'H', 'Ngọ': 'H', 'Mùi': 'M', 'Thân': 'Đ', 'Dậu': 'H', 'Tuất': 'V', 'Hợi': 'H' },
    'Thiên Cơ': { 'Tý': 'Đ', 'Sửu': 'Đ', 'Dần': 'H', 'Mão': 'M', 'Thìn': 'M', 'Tỵ': 'V', 'Ngọ': 'Đ', 'Mùi': 'Đ', 'Thân': 'V', 'Dậu': 'M', 'Tuất': 'M', 'Hợi': 'H' },
    'Cự Môn': { 'Tý': 'V', 'Sửu': 'H', 'Dần': 'V', 'Mão': 'M', 'Thìn': 'H', 'Tỵ': 'H', 'Ngọ': 'V', 'Mùi': 'H', 'Thân': 'Đ', 'Dậu': 'M', 'Tuất': 'H', 'Hợi': 'Đ' }
  };

  const getMainStarStatus = (starName, chi) => {
    const star = String(starName || '').trim();
    const branch = String(chi || '').trim();
    return CHINH_TINH_TRANG_THAI[star]?.[branch] || '';
  };

  const normalizeNienHoaKey = (value) =>
    String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

  const NIEN_HOA_BY_CAN = {
    'Giáp': { A: 'Liêm Trinh', B: 'Phá Quân', C: 'Vũ Khúc', D: 'Thái Dương' },
    'Ất': { A: 'Thiên Cơ', B: 'Thiên Lương', C: 'Tử Vi', D: 'Thái Âm' },
    'Bính': { A: 'Thiên Đồng', B: 'Thiên Cơ', C: 'Văn Xương', D: 'Liêm Trinh' },
    'Đinh': { A: 'Thái Âm', B: 'Thiên Đồng', C: 'Thiên Cơ', D: 'Cự Môn' },
    'Mậu': { A: 'Tham Lang', B: 'Thái Âm', C: 'Hữu Bật', D: 'Thiên Cơ' },
    'Kỷ': { A: 'Vũ Khúc', B: 'Tham Lang', C: 'Thiên Lương', D: 'Văn Khúc' },
    'Canh': { A: 'Thái Dương', B: 'Vũ Khúc', C: 'Thái Âm', D: 'Thiên Đồng' },
    'Tân': { A: 'Cự Môn', B: 'Thái Dương', C: 'Văn Khúc', D: 'Văn Xương' },
    'Nhâm': { A: 'Thiên Lương', B: 'Tử Vi', C: 'Tả Phù', D: 'Vũ Khúc' },
    'Quý': { A: 'Phá Quân', B: 'Cự Môn', C: 'Thái Âm', D: 'Tham Lang' }
  };

  const currentYearCan = useMemo(() => {
    return String(lunarInfo?.yearCanChi || '').split(' ')[0] || '';
  }, [lunarInfo?.yearCanChi]);

  const nienHoaLabelsByMainStar = useMemo(() => {
    const map = {};
    const table = NIEN_HOA_BY_CAN[currentYearCan] || {};

    Object.entries(table).forEach(([label, starName]) => {
      const key = normalizeNienHoaKey(starName);
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push(label);
    });

    return map;
  }, [currentYearCan]);

  const getNienHoaLabelsForMainStar = (starName) => {
    return nienHoaLabelsByMainStar[normalizeNienHoaKey(starName)] || [];
  };

  const tuanTrietInfo = useMemo(() => {
    const yearCanChi = lunarInfo?.yearCanChi || '';
    const parts = String(yearCanChi).split(' ');
    if (parts.length < 2) return { tuan: null, triet: null };
    const can = parts[0];
    const chi = parts[1];
    return getTuanTrietPosition(can, chi);
  }, [lunarInfo?.yearCanChi]);

  const amDuongMenhCuc = useMemo(() => {
    const yearCanChi = String(lunarInfo?.yearCanChi || '').trim();
    const yearCan = yearCanChi.split(' ')[0] || '';
    const yearChi = yearCanChi.split(' ')[1] || '';

    const gioiTinhRaw = String(birthInfo?.gender || '').trim().toLowerCase();
    const isNam = gioiTinhRaw === 'male' || gioiTinhRaw === 'nam';
    const isNu = gioiTinhRaw === 'female' || gioiTinhRaw === 'nữ' || gioiTinhRaw === 'nu';
    const gioiTinh = isNam ? 'Nam' : isNu ? 'Nữ' : 'Không rõ';
    const canDuong = new Set(['Giáp', 'Bính', 'Mậu', 'Canh', 'Nhâm']);
    const chiDuong = new Set(['Tý', 'Dần', 'Thìn', 'Ngọ', 'Thân', 'Tuất']);
    const isDuong = yearCan ? canDuong.has(yearCan) : chiDuong.has(yearChi);
    const amDuong = `${isDuong ? 'Dương' : 'Âm'} ${gioiTinh}`;
    let amDuongTrangThai = 'Không rõ';
    let laThuanLy = null;
    // Giu logic cu cho huong an sao de khong lam thay doi vi tri sao.
    if (isNam || isNu) {
      laThuanLy = (isDuong && isNam) || (!isDuong && isNu);
    }

    const napAmMap = {
      'Giáp Tý': 'Hải Trung Kim', 'Ất Sửu': 'Hải Trung Kim',
      'Bính Dần': 'Lư Trung Hỏa', 'Đinh Mão': 'Lư Trung Hỏa',
      'Mậu Thìn': 'Đại Lâm Mộc', 'Kỷ Tỵ': 'Đại Lâm Mộc',
      'Canh Ngọ': 'Lộ Bàng Thổ', 'Tân Mùi': 'Lộ Bàng Thổ',
      'Nhâm Thân': 'Kiếm Phong Kim', 'Quý Dậu': 'Kiếm Phong Kim',
      'Giáp Tuất': 'Sơn Đầu Hỏa', 'Ất Hợi': 'Sơn Đầu Hỏa',
      'Bính Tý': 'Giản Hạ Thủy', 'Đinh Sửu': 'Giản Hạ Thủy',
      'Mậu Dần': 'Thành Đầu Thổ', 'Kỷ Mão': 'Thành Đầu Thổ',
      'Canh Thìn': 'Bạch Lạp Kim', 'Tân Tỵ': 'Bạch Lạp Kim',
      'Nhâm Ngọ': 'Dương Liễu Mộc', 'Quý Mùi': 'Dương Liễu Mộc',
      'Giáp Thân': 'Tuyền Trung Thủy', 'Ất Dậu': 'Tuyền Trung Thủy',
      'Bính Tuất': 'Ốc Thượng Thổ', 'Đinh Hợi': 'Ốc Thượng Thổ',
      'Mậu Tý': 'Tích Lịch Hỏa', 'Kỷ Sửu': 'Tích Lịch Hỏa',
      'Canh Dần': 'Tùng Bách Mộc', 'Tân Mão': 'Tùng Bách Mộc',
      'Nhâm Thìn': 'Trường Lưu Thủy', 'Quý Tỵ': 'Trường Lưu Thủy',
      'Giáp Ngọ': 'Sa Trung Kim', 'Ất Mùi': 'Sa Trung Kim',
      'Bính Thân': 'Sơn Hạ Hỏa', 'Đinh Dậu': 'Sơn Hạ Hỏa',
      'Mậu Tuất': 'Bình Địa Mộc', 'Kỷ Hợi': 'Bình Địa Mộc',
      'Canh Tý': 'Bích Thượng Thổ', 'Tân Sửu': 'Bích Thượng Thổ',
      'Nhâm Dần': 'Kim Bạch Kim', 'Quý Mão': 'Kim Bạch Kim',
      'Giáp Thìn': 'Phú Đăng Hỏa', 'Ất Tỵ': 'Phú Đăng Hỏa',
      'Bính Ngọ': 'Thiên Hà Thủy', 'Đinh Mùi': 'Thiên Hà Thủy',
      'Mậu Thân': 'Đại Trạch Thổ', 'Kỷ Dậu': 'Đại Trạch Thổ',
      'Canh Tuất': 'Thoa Xuyến Kim', 'Tân Hợi': 'Thoa Xuyến Kim',
      'Nhâm Tý': 'Tang Đố Mộc', 'Quý Sửu': 'Tang Đố Mộc',
      'Giáp Dần': 'Đại Khê Thủy', 'Ất Mão': 'Đại Khê Thủy',
      'Bính Thìn': 'Sa Trung Thổ', 'Đinh Tỵ': 'Sa Trung Thổ',
      'Mậu Ngọ': 'Thiên Thượng Hỏa', 'Kỷ Mùi': 'Thiên Thượng Hỏa',
      'Canh Thân': 'Thạch Lựu Mộc', 'Tân Dậu': 'Thạch Lựu Mộc',
      'Nhâm Tuất': 'Đại Hải Thủy', 'Quý Hợi': 'Đại Hải Thủy'
    };
    const menh = napAmMap[yearCanChi] || 'Chưa rõ';

    const lunarMonth = Number(lunarInfo?.lunarMonth) || 1;
    const hourChiText = String(lunarInfo?.hourCanChi || '').split(' ').pop() || 'Tý';
    const hour = Math.max(1, CHI_ORDER.findIndex((chi) => chi === hourChiText) + 1);

    let menhIndex = (2 + lunarMonth - hour) % 12;
    if (menhIndex < 0) menhIndex += 12;
    const menhChi = CHI_ORDER[menhIndex];

    const cungDuong = new Set(['Tý', 'Dần', 'Thìn', 'Ngọ', 'Thân', 'Tuất']);
    const menhIsDuong = cungDuong.has(menhChi);
    const displayThuanLy = isDuong === menhIsDuong;
    amDuongTrangThai = displayThuanLy ? 'Thuận lý' : 'Nghịch lý';

    let canBucket = -1;
    if (['Giáp', 'Kỷ'].includes(yearCan)) canBucket = 0;
    else if (['Ất', 'Canh'].includes(yearCan)) canBucket = 1;
    else if (['Bính', 'Tân'].includes(yearCan)) canBucket = 2;
    else if (['Đinh', 'Nhâm'].includes(yearCan)) canBucket = 3;
    else if (['Mậu', 'Quý'].includes(yearCan)) canBucket = 4;

    const MENH_GROUP_RULES = {
      TY_SUU: ['Thủy nhị cục', 'Hỏa lục cục', 'Thổ ngũ cục', 'Mộc tam cục', 'Kim tứ cục'],
      DAN_MAO_TUAT_HOI: ['Hỏa lục cục', 'Thổ ngũ cục', 'Mộc tam cục', 'Kim tứ cục', 'Thủy nhị cục'],
      THIN_TY: ['Mộc tam cục', 'Kim tứ cục', 'Thủy nhị cục', 'Hỏa lục cục', 'Thổ ngũ cục'],
      NGO_MUI: ['Thổ ngũ cục', 'Mộc tam cục', 'Kim tứ cục', 'Thủy nhị cục', 'Hỏa lục cục'],
      THAN_DAU: ['Kim tứ cục', 'Thủy nhị cục', 'Hỏa lục cục', 'Thổ ngũ cục', 'Mộc tam cục']
    };

    let menhGroup = null;
    if (['Tý', 'Sửu'].includes(menhChi)) menhGroup = 'TY_SUU';
    else if (['Dần', 'Mão', 'Tuất', 'Hợi'].includes(menhChi)) menhGroup = 'DAN_MAO_TUAT_HOI';
    else if (['Thìn', 'Tỵ'].includes(menhChi)) menhGroup = 'THIN_TY';
    else if (['Ngọ', 'Mùi'].includes(menhChi)) menhGroup = 'NGO_MUI';
    else if (['Thân', 'Dậu'].includes(menhChi)) menhGroup = 'THAN_DAU';

    const cuc = (menhGroup && canBucket >= 0)
      ? MENH_GROUP_RULES[menhGroup][canBucket]
      : 'Chưa rõ';

    const extractElement = (text) => {
      const t = String(text || '');
      if (t.includes('Kim')) return 'Kim';
      if (t.includes('Mộc')) return 'Mộc';
      if (t.includes('Thủy')) return 'Thủy';
      if (t.includes('Hỏa')) return 'Hỏa';
      if (t.includes('Thổ')) return 'Thổ';
      return null;
    };

    const menhElement = extractElement(menh);
    const cucElement = extractElement(cuc);

    const sinhMap = {
      'Mộc': 'Hỏa',
      'Hỏa': 'Thổ',
      'Thổ': 'Kim',
      'Kim': 'Thủy',
      'Thủy': 'Mộc'
    };

    const khacMap = {
      'Mộc': 'Thổ',
      'Thổ': 'Thủy',
      'Thủy': 'Hỏa',
      'Hỏa': 'Kim',
      'Kim': 'Mộc'
    };

    let menhCucRelation = 'Chưa rõ';
    if (menhElement && cucElement) {
      if (menhElement === cucElement) {
        menhCucRelation = 'Mệnh Cục bình hòa';
      } else if (sinhMap[cucElement] === menhElement) {
        menhCucRelation = 'Cục sinh Mệnh';
      } else if (sinhMap[menhElement] === cucElement) {
        menhCucRelation = 'Mệnh sinh Cục';
      } else if (khacMap[cucElement] === menhElement) {
        menhCucRelation = 'Cục khắc Mệnh';
      } else if (khacMap[menhElement] === cucElement) {
        menhCucRelation = 'Mệnh khắc Cục';
      }
    }

    const currentLunarYear = Number(lunarInfo?.namHanLunarYear);
    const birthLunarYear = Number(lunarInfo?.lunarYear);
    const tuoi = Number.isFinite(currentLunarYear) && Number.isFinite(birthLunarYear)
      ? Math.max(0, currentLunarYear - birthLunarYear + 1)
      : null;

    return { amDuong, amDuongTrangThai, laThuanLy, menh, cuc, menhCucRelation, tuoi };
  }, [birthInfo?.gender, lunarInfo?.yearCanChi, lunarInfo?.lunarMonth, lunarInfo?.hourCanChi, lunarInfo?.namHanLunarYear, lunarInfo?.lunarYear]);

  const subStarsMap = useMemo(() => {
    const result = {};
    CHI_ORDER.forEach((chi) => {
      result[chi] = [];
    });

    const addStar = (chi, star) => {
      if (!chi || !result[chi]) return;
      if (!result[chi].includes(star)) result[chi].push(star);
    };

    const yearCanChi = String(lunarInfo?.yearCanChi || '');
    const yearCan = yearCanChi.split(' ')[0] || '';
    const yearChi = yearCanChi.split(' ')[1] || '';

    // An vòng Thái Tuế theo Chi năm sinh, đi thuận 12 cung
    const thaiTueRing = [
      'Thái Tuế',
      'Thiếu Dương',
      'Tang Môn',
      'Thiếu Âm',
      'Quan Phù',
      'Tử Phù',
      'Tuế Phá',
      'Long Đức',
      'Bạch Hổ',
      'Phúc Đức',
      'Điếu Khách',
      'Trực Phù'
    ];
    const yearChiIdx = CHI_ORDER.findIndex((chi) => chi === yearChi);
    if (yearChiIdx !== -1) {
      thaiTueRing.forEach((star, i) => {
        addStar(CHI_ORDER[(yearChiIdx + i) % 12], star);
      });
    }

    // 7) Những sao an theo hàng Chi năm sinh (Tý -> Hợi)
    const starsByYearChi = {
      'Long Trì': ['Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão'],
      'Phượng Các': ['Tuất', 'Dậu', 'Thân', 'Mùi', 'Ngọ', 'Tỵ', 'Thìn', 'Mão', 'Dần', 'Sửu', 'Tý', 'Hợi'],
      'Giải Thần': ['Tuất', 'Dậu', 'Thân', 'Mùi', 'Ngọ', 'Tỵ', 'Thìn', 'Mão', 'Dần', 'Sửu', 'Tý', 'Hợi'],
      'Thiên Khốc': ['Ngọ', 'Tỵ', 'Thìn', 'Mão', 'Dần', 'Sửu', 'Tý', 'Hợi', 'Tuất', 'Dậu', 'Thân', 'Mùi'],
      'Thiên Hư': ['Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ'],
      'Thiên Đức': ['Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân'],
      'Nguyệt Đức': ['Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn'],
      'Hồng Loan': ['Mão', 'Dần', 'Sửu', 'Tý', 'Hợi', 'Tuất', 'Dậu', 'Thân', 'Mùi', 'Ngọ', 'Tỵ', 'Thìn'],
      'Thiên Hỷ': ['Dậu', 'Thân', 'Mùi', 'Ngọ', 'Tỵ', 'Thìn', 'Mão', 'Dần', 'Sửu', 'Tý', 'Hợi', 'Tuất'],
      'Cô Thần': ['Dần', 'Dần', 'Tỵ', 'Tỵ', 'Tỵ', 'Thân', 'Thân', 'Thân', 'Hợi', 'Hợi', 'Hợi', 'Dần'],
      'Quả Tú': ['Tuất', 'Tuất', 'Sửu', 'Sửu', 'Sửu', 'Thìn', 'Thìn', 'Thìn', 'Mùi', 'Mùi', 'Mùi', 'Tuất'],
      'Đào Hoa': ['Dậu', 'Ngọ', 'Mão', 'Tý', 'Dậu', 'Ngọ', 'Mão', 'Tý', 'Dậu', 'Ngọ', 'Mão', 'Tý'],
      'Thiên Mã': ['Dần', 'Hợi', 'Thân', 'Tỵ', 'Dần', 'Hợi', 'Thân', 'Tỵ', 'Dần', 'Hợi', 'Thân', 'Tỵ'],
      'Kiếp Sát': ['Tỵ', 'Dần', 'Hợi', 'Thân', 'Tỵ', 'Dần', 'Hợi', 'Thân', 'Tỵ', 'Dần', 'Hợi', 'Thân'],
      'Hoa Cái': ['Thìn', 'Sửu', 'Tuất', 'Mùi', 'Thìn', 'Sửu', 'Tuất', 'Mùi', 'Thìn', 'Sửu', 'Tuất', 'Mùi'],
      'Phá Toái': ['Tỵ', 'Sửu', 'Dậu', 'Tỵ', 'Sửu', 'Dậu', 'Tỵ', 'Sửu', 'Dậu', 'Tỵ', 'Sửu', 'Dậu'],
      'Thiên Không': ['Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý']
    };

    if (yearChiIdx !== -1) {
      Object.entries(starsByYearChi).forEach(([starName, chiList]) => {
        const targetChi = chiList[yearChiIdx];
        if (targetChi) addStar(targetChi, starName);
      });
    }

    // An các sao theo hàng Can năm sinh (theo bảng người dùng cung cấp)
    const byCan = {
      'Lộc Tồn': { 'Giáp': 'Dần', 'Ất': 'Mão', 'Bính': 'Tỵ', 'Đinh': 'Ngọ', 'Mậu': 'Tỵ', 'Kỷ': 'Ngọ', 'Canh': 'Thân', 'Tân': 'Dậu', 'Nhâm': 'Hợi', 'Quý': 'Tý' },
      'Kình Dương': { 'Giáp': 'Mão', 'Ất': 'Thìn', 'Bính': 'Ngọ', 'Đinh': 'Mùi', 'Mậu': 'Ngọ', 'Kỷ': 'Mùi', 'Canh': 'Dậu', 'Tân': 'Tuất', 'Nhâm': 'Tý', 'Quý': 'Sửu' },
      'Đà La': { 'Giáp': 'Sửu', 'Ất': 'Dần', 'Bính': 'Thìn', 'Đinh': 'Tỵ', 'Mậu': 'Thìn', 'Kỷ': 'Tỵ', 'Canh': 'Mùi', 'Tân': 'Thân', 'Nhâm': 'Tuất', 'Quý': 'Hợi' },
      'Quốc Ấn': { 'Giáp': 'Tuất', 'Ất': 'Hợi', 'Bính': 'Sửu', 'Đinh': 'Dần', 'Mậu': 'Sửu', 'Kỷ': 'Dần', 'Canh': 'Thìn', 'Tân': 'Tỵ', 'Nhâm': 'Mùi', 'Quý': 'Thân' },
      'Đường Phù': { 'Giáp': 'Mùi', 'Ất': 'Thân', 'Bính': 'Tuất', 'Đinh': 'Hợi', 'Mậu': 'Tuất', 'Kỷ': 'Hợi', 'Canh': 'Sửu', 'Tân': 'Dần', 'Nhâm': 'Thìn', 'Quý': 'Tỵ' },
      'Thiên Khôi': { 'Giáp': 'Sửu', 'Ất': 'Tý', 'Bính': 'Hợi', 'Đinh': 'Hợi', 'Mậu': 'Sửu', 'Kỷ': 'Tý', 'Canh': 'Ngọ', 'Tân': 'Ngọ', 'Nhâm': 'Mão', 'Quý': 'Mão' },
      'Thiên Việt': { 'Giáp': 'Mùi', 'Ất': 'Thân', 'Bính': 'Dậu', 'Đinh': 'Dần', 'Mậu': 'Mùi', 'Kỷ': 'Thân', 'Canh': 'Dần', 'Tân': 'Dần', 'Nhâm': 'Tỵ', 'Quý': 'Tỵ' },
      'Thiên Quan': { 'Giáp': 'Mùi', 'Ất': 'Thìn', 'Bính': 'Tỵ', 'Đinh': 'Dần', 'Mậu': 'Mão', 'Kỷ': 'Dậu', 'Canh': 'Hợi', 'Tân': 'Dậu', 'Nhâm': 'Tuất', 'Quý': 'Ngọ' },
      'Thiên Phúc': { 'Giáp': 'Dậu', 'Ất': 'Thân', 'Bính': 'Tý', 'Đinh': 'Hợi', 'Mậu': 'Mão', 'Kỷ': 'Dần', 'Canh': 'Ngọ', 'Tân': 'Tỵ', 'Nhâm': 'Ngọ', 'Quý': 'Tỵ' },
      'Lưu Hà': { 'Giáp': 'Dậu', 'Ất': 'Tuất', 'Bính': 'Mùi', 'Đinh': 'Thìn', 'Mậu': 'Tỵ', 'Kỷ': 'Ngọ', 'Canh': 'Thân', 'Tân': 'Mão', 'Nhâm': 'Hợi', 'Quý': 'Dần' },
      'Thiên Trù': { 'Giáp': 'Tỵ', 'Ất': 'Ngọ', 'Bính': 'Tý', 'Đinh': 'Tỵ', 'Mậu': 'Ngọ', 'Kỷ': 'Thân', 'Canh': 'Dần', 'Tân': 'Ngọ', 'Nhâm': 'Dậu', 'Quý': 'Tuất' }
    };

    Object.keys(byCan).forEach((starName) => {
      const chi = byCan[starName][yearCan];
      if (chi) addStar(chi, starName);
    });

    // Vòng Bác Sĩ: bắt đầu tại cung có Lộc Tồn
    // Dương Nam, Âm Nữ: thuận. Âm Nam, Dương Nữ: nghịch.
    const locTonChi = byCan['Lộc Tồn'][yearCan] || null;
    const locTonIdx = CHI_ORDER.findIndex((chi) => chi === locTonChi);
    if (locTonIdx !== -1) {
      const bacSiRing = [
        'Bác Sĩ',
        'Lực Sỹ',
        'Thanh Long',
        'Tiểu Hao',
        'Tướng Quân',
        'Tấu Thư',
        'Phi Liêm',
        'Hỉ Thần',
        'Bệnh Phù',
        'Đại Hao',
        'Phục Binh',
        'Quan Phủ'
      ];
      const direction = amDuongMenhCuc?.laThuanLy === false ? -1 : 1;
      bacSiRing.forEach((star, i) => {
        const idx = (locTonIdx + i * direction + 120) % 12;
        addStar(CHI_ORDER[idx], star);
      });
    }

    // 8) Những sao an theo tháng sinh (tháng 1 -> 12)
    const lunarMonth = Number(lunarInfo?.lunarMonth) || 1;
    const monthIdx = Math.min(12, Math.max(1, lunarMonth)) - 1;
    const starsByMonth = {
      'Tả Phù': ['Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão'],
      'Hữu Bật': ['Tuất', 'Dậu', 'Thân', 'Mùi', 'Ngọ', 'Tỵ', 'Thìn', 'Mão', 'Dần', 'Sửu', 'Tý', 'Hợi'],
      'Thiên Hình': ['Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân'],
      'Thiên Diêu': ['Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý'],
      'Thiên Y': ['Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý'],
      'Thiên Giải': ['Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi'],
      'Địa Giải': ['Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ']
    };
    Object.entries(starsByMonth).forEach(([starName, chiList]) => {
      const targetChi = chiList[monthIdx];
      if (targetChi) addStar(targetChi, starName);
    });

    // 9) Những sao an theo giờ sinh (giờ Tý -> Hợi)
    const hourChi = String(lunarInfo?.hourCanChi || '').split(' ').pop() || 'Tý';
    const hourIdx = CHI_ORDER.findIndex((c) => c === hourChi);
    if (hourIdx !== -1) {
      const starsByHour = {
        'Văn Xương': ['Tuất', 'Dậu', 'Thân', 'Mùi', 'Ngọ', 'Tỵ', 'Thìn', 'Mão', 'Dần', 'Sửu', 'Tý', 'Hợi'],
        'Văn Khúc': ['Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão'],
        'Thai Phụ': ['Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ'],
        'Phong Cáo': ['Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu'],
        'Địa Không': ['Hợi', 'Tuất', 'Dậu', 'Thân', 'Mùi', 'Ngọ', 'Tỵ', 'Thìn', 'Mão', 'Dần', 'Sửu', 'Tý'],
        'Địa Kiếp': ['Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất']
      };
      Object.entries(starsByHour).forEach(([starName, chiList]) => {
        const targetChi = chiList[hourIdx];
        if (targetChi) addStar(targetChi, starName);
      });
    }

    // 12) Đẩu Quân: từ Thái Tuế (tháng Giêng), đếm nghịch đến tháng sinh;
    // cung dừng tính là giờ Tý, đếm thuận đến giờ sinh.
    if (yearChiIdx !== -1 && hourIdx !== -1) {
      const thaiTueIdx = yearChiIdx;
      const monthStopIdx = (thaiTueIdx - (monthIdx) + 120) % 12;
      const dauQuanIdx = (monthStopIdx + hourIdx + 120) % 12;
      addStar(CHI_ORDER[dauQuanIdx], 'Đẩu Quân');
    }

    // 13) Thiên Tài, Thiên Thọ theo cung Mệnh/Thân và Chi năm sinh
    if (yearChiIdx !== -1) {
      const hourNumber = Math.max(1, CHI_ORDER.findIndex((chi) => chi === hourChi) + 1);

      // Cung Mệnh: Dần=1, tháng thuận, giờ nghịch => chỉ số 0-based theo CHI_ORDER
      let menhIdx = (2 + lunarMonth - hourNumber) % 12;
      if (menhIdx < 0) menhIdx += 12;
      addStar(CHI_ORDER[(menhIdx + yearChiIdx) % 12], 'Thiên Tài');

      // Cung Thân: tháng + giờ
      let thanIdx = (lunarMonth + hourNumber) % 12;
      if (thanIdx < 0) thanIdx += 12;
      addStar(CHI_ORDER[(thanIdx + yearChiIdx) % 12], 'Thiên Thọ');
    }

    // Fallback bản đồ 14 chính tinh để an 4 Hóa khi chart gốc chưa chứa chính tinh
    const fallbackMainStarsByChi = {};
    CHI_ORDER.forEach((chi) => {
      fallbackMainStarsByChi[chi] = [];
    });
    const putFallbackMainStar = (chiIndex, starName) => {
      const idx = (chiIndex + 120) % 12;
      const chi = CHI_ORDER[idx];
      if (!fallbackMainStarsByChi[chi].includes(starName)) fallbackMainStarsByChi[chi].push(starName);
    };
    const cucTextForMain = String(amDuongMenhCuc?.cuc || '').toLowerCase();
    let cucNumberForMain = 0;
    if (cucTextForMain.includes('nhị')) cucNumberForMain = 2;
    else if (cucTextForMain.includes('tam')) cucNumberForMain = 3;
    else if (cucTextForMain.includes('tứ')) cucNumberForMain = 4;
    else if (cucTextForMain.includes('ngũ')) cucNumberForMain = 5;
    else if (cucTextForMain.includes('lục')) cucNumberForMain = 6;

    const lunarDayForMain = Number(lunarInfo?.lunarDay) || 1;
    if (cucNumberForMain && lunarDayForMain) {
      const danIdx = CHI_ORDER.findIndex((chi) => chi === 'Dần');
      const remainder = lunarDayForMain % cucNumberForMain;
      const X = remainder === 0 ? 0 : (cucNumberForMain - remainder);
      const Q = (lunarDayForMain + X) / cucNumberForMain;
      const mocIdx = (danIdx + (Q - 1) + 120) % 12;
      let tuViIdx = mocIdx;
      if (X > 0) {
        tuViIdx = X % 2 === 1 ? (mocIdx - X) : (mocIdx + X);
        tuViIdx = (tuViIdx + 120) % 12;
      }

      [
        { name: 'Tử Vi', offset: 0 },
        { name: 'Thiên Cơ', offset: -1 },
        { name: 'Thái Dương', offset: -3 },
        { name: 'Vũ Khúc', offset: -4 },
        { name: 'Thiên Đồng', offset: -5 },
        { name: 'Liêm Trinh', offset: -8 }
      ].forEach((star) => putFallbackMainStar(tuViIdx + star.offset, star.name));

      const thienPhuIdx = (4 - tuViIdx + 120) % 12;
      [
        { name: 'Thiên Phủ', offset: 0 },
        { name: 'Thái Âm', offset: 1 },
        { name: 'Tham Lang', offset: 2 },
        { name: 'Cự Môn', offset: 3 },
        { name: 'Thiên Tướng', offset: 4 },
        { name: 'Thiên Lương', offset: 5 },
        { name: 'Thất Sát', offset: 6 },
        // Phá Quân cách ba cung sau Thất Sát và đối diện Thiên Tướng.
        { name: 'Phá Quân', offset: 10 }
      ].forEach((star) => putFallbackMainStar(thienPhuIdx + star.offset, star.name));
    }

    // Tìm cung chứa sao gốc để an 4 Hóa
    const expandBaseStar = {
      'Liêm': 'Liêm Trinh', 'Cơ': 'Thiên Cơ', 'Đồng': 'Thiên Đồng', 'Nguyệt': 'Thái Âm',
      'Tham': 'Tham Lang', 'Vũ': 'Vũ Khúc', 'Nhật': 'Thái Dương', 'Cự': 'Cự Môn',
      'Lương': 'Thiên Lương', 'Phá': 'Phá Quân', 'Tử Vi': 'Tử Vi', 'Xương': 'Văn Xương',
      'Khúc': 'Văn Khúc', 'Tả': 'Tả Phù', 'Hữu': 'Hữu Bật',
      'Âm': 'Thái Âm', 'Vi': 'Tử Vi', 'Bật': 'Hữu Bật', 'Phụ': 'Tả Phù', 'Dương': 'Thái Dương'
    };

    const hoaByCan = {
      'Hóa Lộc': { 'Giáp': 'Liêm', 'Ất': 'Cơ', 'Bính': 'Đồng', 'Đinh': 'Nguyệt', 'Mậu': 'Tham', 'Kỷ': 'Vũ', 'Canh': 'Nhật', 'Tân': 'Cự', 'Nhâm': 'Lương', 'Quý': 'Phá' },
      'Hóa Quyền': { 'Giáp': 'Phá', 'Ất': 'Lương', 'Bính': 'Cơ', 'Đinh': 'Đồng', 'Mậu': 'Nguyệt', 'Kỷ': 'Tham', 'Canh': 'Vũ', 'Tân': 'Nhật', 'Nhâm': 'Vi', 'Quý': 'Cự' },
      'Hóa Khoa': { 'Giáp': 'Vũ', 'Ất': 'Vi', 'Bính': 'Xương', 'Đinh': 'Cơ', 'Mậu': 'Bật', 'Kỷ': 'Lương', 'Canh': 'Âm', 'Tân': 'Khúc', 'Nhâm': 'Phụ', 'Quý': 'Âm' },
      'Hóa Kỵ': { 'Giáp': 'Dương', 'Ất': 'Nguyệt', 'Bính': 'Liêm', 'Đinh': 'Cự', 'Mậu': 'Cơ', 'Kỷ': 'Khúc', 'Canh': 'Đồng', 'Tân': 'Xương', 'Nhâm': 'Vũ', 'Quý': 'Tham' }
    };

    const findChiByStar = (fullStarName) => {
      // 1) Ưu tiên sao đã an trong lượt tính hiện tại
      for (let i = 0; i < CHI_ORDER.length; i += 1) {
        const chi = CHI_ORDER[i];
        const allComputed = [...result[chi].map(String)];
        if (allComputed.includes(fullStarName)) return chi;
      }

      // 2) Tra từ dữ liệu chart gốc
      for (let i = 0; i < CHI_ORDER.length; i += 1) {
        const chi = CHI_ORDER[i];
        const palace = palaceMap[toKey(chi)];
        const all = [
          ...((palace?.mainStars || palace?.stars || palace?.chinhTinh || []).map(String)),
          ...result[chi].map(String)
        ];
        if (all.includes(fullStarName)) return chi;
      }

      // 3) Tra từ fallback 14 chính tinh
      for (let i = 0; i < CHI_ORDER.length; i += 1) {
        const chi = CHI_ORDER[i];
        if ((fallbackMainStarsByChi[chi] || []).includes(fullStarName)) return chi;
      }

      return null;
    };

    // 10) An Hỏa Tinh, Linh Tinh
    const fireBellStartByYearChi = {
      'Dần': { hoa: 'Sửu', linh: 'Mão' },
      'Ngọ': { hoa: 'Sửu', linh: 'Mão' },
      'Tuất': { hoa: 'Sửu', linh: 'Mão' },
      'Thân': { hoa: 'Dần', linh: 'Tuất' },
      'Tý': { hoa: 'Dần', linh: 'Tuất' },
      'Thìn': { hoa: 'Dần', linh: 'Tuất' },
      'Tỵ': { hoa: 'Mão', linh: 'Tuất' },
      'Dậu': { hoa: 'Mão', linh: 'Tuất' },
      'Sửu': { hoa: 'Mão', linh: 'Tuất' },
      'Hợi': { hoa: 'Dậu', linh: 'Tuất' },
      'Mão': { hoa: 'Dậu', linh: 'Tuất' },
      'Mùi': { hoa: 'Dậu', linh: 'Tuất' }
    };
    const fireBellStart = fireBellStartByYearChi[yearChi];
    if (fireBellStart && hourIdx !== -1) {
      const hoaStartIdx = CHI_ORDER.findIndex((chi) => chi === fireBellStart.hoa);
      const linhStartIdx = CHI_ORDER.findIndex((chi) => chi === fireBellStart.linh);
      if (hoaStartIdx !== -1 && linhStartIdx !== -1) {
        const isThuanLy = amDuongMenhCuc?.laThuanLy !== false;
        const hoaDir = isThuanLy ? 1 : -1;
        const linhDir = isThuanLy ? -1 : 1;
        addStar(CHI_ORDER[(hoaStartIdx + hoaDir * hourIdx + 120) % 12], 'Hỏa Tinh');
        addStar(CHI_ORDER[(linhStartIdx + linhDir * hourIdx + 120) % 12], 'Linh Tinh');
      }
    }

    // 10) An Tam Thai, Bát Tọa
    const lunarDay = Math.max(1, Number(lunarInfo?.lunarDay) || 1);
    const taPhuChi = findChiByStar('Tả Phù');
    const huuBatChi = findChiByStar('Hữu Bật');
    if (taPhuChi) {
      const taIdx = CHI_ORDER.findIndex((chi) => chi === taPhuChi);
      if (taIdx !== -1) {
        addStar(CHI_ORDER[(taIdx + (lunarDay - 1) + 120) % 12], 'Tam Thai');
      }
    }
    if (huuBatChi) {
      const huuIdx = CHI_ORDER.findIndex((chi) => chi === huuBatChi);
      if (huuIdx !== -1) {
        addStar(CHI_ORDER[(huuIdx - (lunarDay - 1) + 120) % 12], 'Bát Tọa');
      }
    }

    // 11) An Ân Quang, Thiên Quý
    // Ân Quang: từ Văn Xương, thuận đến ngày âm lịch rồi lùi 1 cung.
    // Thiên Quý: từ Văn Khúc, nghịch đến ngày âm lịch rồi lùi 1 cung.
    const vanXuongByHour = hourIdx !== -1
      ? ['Tuất', 'Dậu', 'Thân', 'Mùi', 'Ngọ', 'Tỵ', 'Thìn', 'Mão', 'Dần', 'Sửu', 'Tý', 'Hợi'][hourIdx]
      : null;
    const vanKhucByHour = hourIdx !== -1
      ? ['Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão'][hourIdx]
      : null;
    const vanXuongChi = vanXuongByHour || findChiByStar('Văn Xương');
    const vanKhucChi = vanKhucByHour || findChiByStar('Văn Khúc');
    if (vanXuongChi) {
      const xuongIdx = CHI_ORDER.findIndex((chi) => chi === vanXuongChi);
      if (xuongIdx !== -1) {
        const anQuangIdx = (xuongIdx + (lunarDay - 1) - 1 + 120) % 12;
        addStar(CHI_ORDER[anQuangIdx], 'Ân Quang');
      }
    }
    if (vanKhucChi) {
      const khucIdx = CHI_ORDER.findIndex((chi) => chi === vanKhucChi);
      if (khucIdx !== -1) {
        const khucToBirthDayIdx = (khucIdx - (lunarDay - 1) + 120) % 12;
        const thienQuyIdx = (khucToBirthDayIdx + 1 + 120) % 12;
        addStar(CHI_ORDER[thienQuyIdx], 'Thiên Quý');
      }
    }

    Object.keys(hoaByCan).forEach((hoaName) => {
      const shortName = hoaByCan[hoaName][yearCan];
      const fullStarName = expandBaseStar[shortName];
      if (!fullStarName) return;
      const chi = findChiByStar(fullStarName);
      if (chi) addStar(chi, hoaName);
    });

    return result;
  }, [lunarInfo?.yearCanChi, lunarInfo?.lunarMonth, lunarInfo?.hourCanChi, lunarInfo?.lunarDay, amDuongMenhCuc?.cuc, amDuongMenhCuc?.laThuanLy, palaceMap]);

  const cungChinhMap = useMemo(() => {
    const result = {};
    const lunarMonth = Number(lunarInfo?.lunarMonth) || 1;
    const hourChiText = String(lunarInfo?.hourCanChi || '').split(' ').pop() || 'Tý';
    const hour = Math.max(1, CHI_ORDER.findIndex((chi) => chi === hourChiText) + 1);

    let menhIndex = (2 + lunarMonth - hour) % 12;
    if (menhIndex < 0) menhIndex += 12;
    const menhChi = CHI_ORDER[menhIndex];
    const startOnRing = CUNG_RING_CLOCKWISE.findIndex((chi) => chi === menhChi);
    if (startOnRing === -1) return result;

    for (let i = 0; i < 12; i += 1) {
      const idx = (startOnRing + i) % 12;
      result[CUNG_RING_CLOCKWISE[idx]] = CUNG_TITLES[i];
    }
    return result;
  }, [lunarInfo?.lunarMonth, lunarInfo?.hourCanChi]);

  const daiVanMap = useMemo(() => {
    const result = {};
    const lunarMonth = Number(lunarInfo?.lunarMonth) || 1;
    const hourChiText = String(lunarInfo?.hourCanChi || '').split(' ').pop() || 'Tý';
    const hour = Math.max(1, CHI_ORDER.findIndex((chi) => chi === hourChiText) + 1);

    let menhIndex = (2 + lunarMonth - hour) % 12;
    if (menhIndex < 0) menhIndex += 12;
    const menhChi = CHI_ORDER[menhIndex];
    const startOnRing = CUNG_RING_CLOCKWISE.findIndex((chi) => chi === menhChi);
    if (startOnRing === -1) return result;

    // Cục number: Thủy nhị=2, Mộc tam=3, Kim tứ=4, Thổ ngũ=5, Hỏa lục=6
    const cucText = String(amDuongMenhCuc?.cuc || '').toLowerCase();
    let startAge = 0;
    if (cucText.includes('nhị')) startAge = 2;
    else if (cucText.includes('tam')) startAge = 3;
    else if (cucText.includes('tứ')) startAge = 4;
    else if (cucText.includes('ngũ')) startAge = 5;
    else if (cucText.includes('lục')) startAge = 6;
    if (!startAge) return result;

    const direction = amDuongMenhCuc.laThuanLy === false ? -1 : 1;
    for (let i = 0; i < 12; i += 1) {
      const ringIdx = (startOnRing + i * direction + 12) % 12;
      const chi = CUNG_RING_CLOCKWISE[ringIdx];
      result[chi] = String(startAge + i * 10);
    }

    return result;
  }, [lunarInfo?.lunarMonth, lunarInfo?.hourCanChi, amDuongMenhCuc?.cuc, amDuongMenhCuc?.laThuanLy]);

  const thanChi = useMemo(() => {
    const lunarMonth = Number(lunarInfo?.lunarMonth) || 1;
    const hourChiText = String(lunarInfo?.hourCanChi || '').split(' ').pop() || 'Tý';
    const hour = Math.max(1, CHI_ORDER.findIndex((chi) => chi === hourChiText) + 1);

    let thanIndex = (lunarMonth + hour) % 12;
    if (thanIndex < 0) thanIndex += 12;
    return CHI_ORDER[thanIndex] || null;
  }, [lunarInfo?.lunarMonth, lunarInfo?.hourCanChi]);

  const tieuHanMap = useMemo(() => {
    const result = {};
    CHI_ORDER.forEach((chi) => {
      result[chi] = '';
    });

    const birthYearChi = String(lunarInfo?.yearCanChi || '').split(' ').pop() || '';
    const birthYearChiIdx = CHI_ORDER.findIndex((chi) => chi === birthYearChi);
    if (birthYearChiIdx === -1) return result;

    let startPalace = null;
    if (['Thân', 'Tý', 'Thìn'].includes(birthYearChi)) startPalace = 'Tuất';
    else if (['Tỵ', 'Dậu', 'Sửu'].includes(birthYearChi)) startPalace = 'Mùi';
    else if (['Dần', 'Ngọ', 'Tuất'].includes(birthYearChi)) startPalace = 'Thìn';
    else if (['Hợi', 'Mão', 'Mùi'].includes(birthYearChi)) startPalace = 'Sửu';
    if (!startPalace) return result;

    const startPalaceIdx = CUNG_RING_CLOCKWISE.findIndex((chi) => chi === startPalace);
    if (startPalaceIdx === -1) return result;

    const gioiTinhRaw = String(birthInfo?.gender || '').trim().toLowerCase();
    const isNam = gioiTinhRaw === 'male' || gioiTinhRaw === 'nam';
    const isNu = gioiTinhRaw === 'female' || gioiTinhRaw === 'nữ' || gioiTinhRaw === 'nu';
    const direction = isNu ? -1 : (isNam ? 1 : 1);

    for (let i = 0; i < 12; i += 1) {
      const palaceIdx = (startPalaceIdx + i * direction + 120) % 12;
      const chi = CHI_ORDER[(birthYearChiIdx + i) % 12];
      result[CUNG_RING_CLOCKWISE[palaceIdx]] = chi;
    }

    return result;
  }, [birthInfo?.gender, lunarInfo?.yearCanChi]);

  const namHienTaiChi = useMemo(() => {
    return String(lunarInfo?.namHanCanChi || '').split(' ').pop() || '';
  }, [lunarInfo?.namHanCanChi]);

  const luuStarsMap = useMemo(() => {
    if (!isAnSaoLuu) return {};

    const result = {};
    CHI_ORDER.forEach((chi) => {
      result[chi] = [];
    });

    const addLuuStar = (chi, star) => {
      if (!chi || !result[chi]) return;
      const label = `L.${star}`;
      if (!result[chi].includes(label)) result[chi].push(label);
    };

    const namHanCanChi = String(lunarInfo?.namHanCanChi || '');
    const [namHanCan, namHanChi] = namHanCanChi.split(' ');
    const yearChiIdx = CHI_ORDER.findIndex((chi) => chi === namHanChi);
    if (yearChiIdx === -1) return result;

    // 1) Lưu Thái Tuế an ngay tại cung có tên của năm hạn.
    addLuuStar(namHanChi, 'Thái Tuế');

    // 2) Lưu Tang Môn: từ Lưu Thái Tuế đếm thuận đến cung thứ 2.
    const tangMonIdx = (yearChiIdx + 2) % 12;
    addLuuStar(CHI_ORDER[tangMonIdx], 'Tang Môn');

    // 3) Lưu Bạch Hổ: an tại cung xung chiếu với Lưu Tang Môn.
    const bachHoIdx = (tangMonIdx + 6) % 12;
    addLuuStar(CHI_ORDER[bachHoIdx], 'Bạch Hổ');

    // 4) Lưu Thiên Khốc: năm Tý ở Ngọ, đếm nghịch theo năm hạn.
    const ngoIdx = CHI_ORDER.findIndex((chi) => chi === 'Ngọ');
    if (ngoIdx !== -1) {
      const khocIdx = (ngoIdx - yearChiIdx + 120) % 12;
      addLuuStar(CHI_ORDER[khocIdx], 'Thiên Khốc');
    }

    // 5) Lưu Thiên Hư: khởi từ Ngọ (coi là năm Tý), đếm thuận theo năm hạn.
    if (ngoIdx !== -1) {
      const huIdx = (ngoIdx + yearChiIdx) % 12;
      addLuuStar(CHI_ORDER[huIdx], 'Thiên Hư');
    }

    // 6) Lưu Lộc Tồn theo Thiên Can năm hạn.
    const locTonByCan = {
      'Giáp': 'Dần',
      'Kỷ': 'Ngọ',
      'Ất': 'Mão',
      'Canh': 'Thân',
      'Bính': 'Tỵ',
      'Tân': 'Dậu',
      'Đinh': 'Ngọ',
      'Nhâm': 'Hợi',
      'Mậu': 'Tỵ',
      'Quý': 'Tý'
    };
    const locTonChi = locTonByCan[namHanCan] || null;
    if (locTonChi) {
      addLuuStar(locTonChi, 'Lộc Tồn');

      // 7) Lưu Kình Dương ở trước Lộc Tồn theo chiều thuận; Lưu Đà La ở phía nghịch.
      const locTonIdx = CHI_ORDER.findIndex((chi) => chi === locTonChi);
      if (locTonIdx !== -1) {
        addLuuStar(CHI_ORDER[(locTonIdx + 1) % 12], 'Kình Dương');
        addLuuStar(CHI_ORDER[(locTonIdx - 1 + 12) % 12], 'Đà La');
      }
    }

    // 8) Lưu Thiên Mã theo nhóm Địa Chi năm hạn.
    let thienMaChi = null;
    if (['Tỵ', 'Dậu', 'Sửu'].includes(namHanChi)) thienMaChi = 'Hợi';
    else if (['Hợi', 'Mão', 'Mùi'].includes(namHanChi)) thienMaChi = 'Tỵ';
    else if (['Dần', 'Ngọ', 'Tuất'].includes(namHanChi)) thienMaChi = 'Thân';
    else if (['Thân', 'Tý', 'Thìn'].includes(namHanChi)) thienMaChi = 'Dần';
    if (thienMaChi) addLuuStar(thienMaChi, 'Thiên Mã');

    // 9) Lưu Đào Hoa theo nhóm Địa Chi năm hạn.
    let daoHoaChi = null;
    if (['Tỵ', 'Dậu', 'Sửu'].includes(namHanChi)) daoHoaChi = 'Ngọ';
    else if (['Thân', 'Tý', 'Thìn'].includes(namHanChi)) daoHoaChi = 'Dậu';
    else if (['Hợi', 'Mão', 'Mùi'].includes(namHanChi)) daoHoaChi = 'Tý';
    else if (['Dần', 'Ngọ', 'Tuất'].includes(namHanChi)) daoHoaChi = 'Mão';
    if (daoHoaChi) addLuuStar(daoHoaChi, 'Đào Hoa');

    return result;
  }, [isAnSaoLuu, lunarInfo?.namHanCanChi]);

  const thangHanMap = useMemo(() => {
    const result = {};
    CHI_ORDER.forEach((chi) => {
      result[chi] = '';
    });

    const namHanChi = String(lunarInfo?.namHanCanChi || '').split(' ').pop() || '';
    const tieuVanCung = Object.keys(tieuHanMap).find((cungChi) => tieuHanMap[cungChi] === namHanChi);
    if (!tieuVanCung) return result;

    const tieuVanIndex = CHI_ORDER.findIndex((chi) => chi === tieuVanCung);
    if (tieuVanIndex === -1) return result;

    const lunarMonth = Number(lunarInfo?.lunarMonth) || 1;
    const afterMonthIndex = (tieuVanIndex - (lunarMonth - 1) + 12) % 12;

    const hourChiText = String(lunarInfo?.hourCanChi || '').split(' ').pop() || 'Tý';
    const hourIndex = CHI_ORDER.findIndex((chi) => chi === hourChiText);
    const t1Index = (afterMonthIndex + (hourIndex === -1 ? 0 : hourIndex) + 12) % 12;

    for (let i = 0; i < 12; i += 1) {
      const idx = (t1Index + i) % 12;
      result[CHI_ORDER[idx]] = `T${i + 1}`;
    }

    return result;
  }, [tieuHanMap, lunarInfo?.namHanCanChi, lunarInfo?.lunarMonth, lunarInfo?.hourCanChi]);

  const trangSinhMap = useMemo(() => {
    const result = {};
    CHI_ORDER.forEach((chi) => {
      result[chi] = '';
    });

    const cucText = String(amDuongMenhCuc?.cuc || '').toLowerCase();
    let startChi = null;
    if (cucText.includes('thủy nhị')) startChi = 'Thân';
    else if (cucText.includes('mộc tam')) startChi = 'Hợi';
    else if (cucText.includes('kim tứ')) startChi = 'Tỵ';
    else if (cucText.includes('thổ ngũ')) startChi = 'Thân';
    else if (cucText.includes('hỏa lục')) startChi = 'Dần';
    if (!startChi) return result;

    const vongTrangSinh = ['Tràng Sinh', 'Mộc Dục', 'Quan Đới', 'Lâm Quan', 'Đế Vượng', 'Suy', 'Bệnh', 'Tử', 'Mộ', 'Tuyệt', 'Thai', 'Dưỡng'];
    const startIdx = CHI_ORDER.findIndex((chi) => chi === startChi);
    if (startIdx === -1) return result;

    const direction = amDuongMenhCuc.laThuanLy === false ? -1 : 1;
    for (let i = 0; i < 12; i += 1) {
      const idx = (startIdx + i * direction + 120) % 12;
      result[CHI_ORDER[idx]] = vongTrangSinh[i];
    }

    return result;
  }, [amDuongMenhCuc?.cuc, amDuongMenhCuc?.laThuanLy]);

  const thaiTueYearSequenceMap = useMemo(() => {
    const result = {};
    CHI_ORDER.forEach((chi) => {
      result[chi] = '';
    });

    const birthYearChi = String(lunarInfo?.yearCanChi || '').split(' ').pop() || '';
    const startIdx = CUNG_RING_CLOCKWISE.findIndex((chi) => chi === birthYearChi);
    if (startIdx === -1) return result;

    for (let offset = 0; offset < 12; offset += 1) {
      const palaceChi = CUNG_RING_CLOCKWISE[(startIdx + offset) % 12];
      const firstYear = offset + 1;
      const years = [];
      for (let y = firstYear; y <= 96; y += 12) {
        years.push(y);
      }
      result[palaceChi] = years.join(',');
    }

    return result;
  }, [lunarInfo?.yearCanChi]);

  const mainStarsMap = useMemo(() => {
    const result = {};
    CHI_ORDER.forEach((chi) => {
      result[chi] = [];
    });

    const cucText = String(amDuongMenhCuc?.cuc || '').toLowerCase();
    let cucNumber = 0;
    if (cucText.includes('nhị')) cucNumber = 2;
    else if (cucText.includes('tam')) cucNumber = 3;
    else if (cucText.includes('tứ')) cucNumber = 4;
    else if (cucText.includes('ngũ')) cucNumber = 5;
    else if (cucText.includes('lục')) cucNumber = 6;

    const lunarDay = Number(lunarInfo?.lunarDay) || 1;
    if (!cucNumber || !lunarDay) return result;

    const putStar = (chiIndex, starName) => {
      const idx = (chiIndex + 120) % 12;
      const chi = CHI_ORDER[idx];
      if (!result[chi].includes(starName)) result[chi].push(starName);
    };

    // An Tử Vi theo quy tắc Q/X từ Cục và ngày âm lịch.
    const danIdx = CHI_ORDER.findIndex((chi) => chi === 'Dần');
    if (danIdx === -1) return result;

    const remainder = lunarDay % cucNumber;
    const X = remainder === 0 ? 0 : (cucNumber - remainder);
    const Q = (lunarDay + X) / cucNumber;

    // Bước 2: từ Dần (vị trí 1), đếm thuận Q bước để ra cung mốc.
    const mocIdx = (danIdx + (Q - 1) + 120) % 12;

    // Bước 3: X=0 giữ nguyên; X lẻ lùi; X chẵn tiến.
    let tuViIdx = mocIdx;
    if (X > 0) {
      tuViIdx = X % 2 === 1 ? (mocIdx - X) : (mocIdx + X);
      tuViIdx = (tuViIdx + 120) % 12;
    }

    const tuViLine = [
      { name: 'Tử Vi', offset: 0 },
      // Nhóm Tử Vi an nghịch
      { name: 'Thiên Cơ', offset: -1 },
      { name: 'Thái Dương', offset: -3 },
      { name: 'Vũ Khúc', offset: -4 },
      { name: 'Thiên Đồng', offset: -5 },
      { name: 'Liêm Trinh', offset: -8 }
    ];
    tuViLine.forEach((star) => putStar(tuViIdx + star.offset, star.name));

    // Thiên Phủ đối xứng Tử Vi qua trục Dần - Thân.
    // Trên vòng CHI_ORDER (Tý=0..Hợi=11), phép đối xứng qua trục này là: idx' = 4 - idx (mod 12).
    const thienPhuIdx = (4 - tuViIdx + 120) % 12;
    const thienPhuLine = [
      { name: 'Thiên Phủ', offset: 0 },
      // Nhóm Thiên Phủ an thuận
      { name: 'Thái Âm', offset: 1 },
      { name: 'Tham Lang', offset: 2 },
      { name: 'Cự Môn', offset: 3 },
      { name: 'Thiên Tướng', offset: 4 },
      { name: 'Thiên Lương', offset: 5 },
      { name: 'Thất Sát', offset: 6 },
      // Phá Quân cách ba cung sau Thất Sát và đối diện Thiên Tướng.
      { name: 'Phá Quân', offset: 10 }
    ];
    thienPhuLine.forEach((star) => putStar(thienPhuIdx + star.offset, star.name));

    return result;
  }, [amDuongMenhCuc?.cuc, lunarInfo?.lunarDay]);

  const getMainStars = (palace, chi) => {
    const list = palace?.mainStars || palace?.stars || palace?.chinhTinh || [];
    if (Array.isArray(list) && list.length > 0) return list;
    return mainStarsMap[chi] || [];
  };

  const hanHiCandidates = useMemo(() => {
    const birthLunarYear = Number(lunarInfo?.lunarYear);
    const currentLunarYear = Number(lunarInfo?.namHanLunarYear) || birthLunarYear;
    const currentAge = Number.isFinite(amDuongMenhCuc?.tuoi)
      ? Number(amDuongMenhCuc.tuoi)
      : (Number.isFinite(birthLunarYear) && Number.isFinite(currentLunarYear) ? currentLunarYear - birthLunarYear + 1 : null);

    if (!Number.isFinite(currentLunarYear) || !Number.isFinite(birthLunarYear) || currentAge === null) {
      return [];
    }

    const palacePlusScore = {
      'Phu Thê': 5,
      'Phúc Đức': 4,
      'Tài Bạch': 4
    };

    const plusStars = {
      'Đào Hoa': 3, 'Hồng Loan': 3, 'Thiên Hỷ': 3, 'Thiên Hỉ': 3, 'Hỷ Thần': 3, 'Hỉ Thần': 3,
      'Tham Lang': 3,
      'Thái Âm': 2, 'Thái Dương': 2, 'Thiên Đồng': 3,
      'Thiên Khôi': 2, 'Thiên Việt': 2,
      'Thanh Long': 2, 'Long Trì': 2, 'Phượng Các': 2, 'Đường Phù': 2,
      'Tướng Quân': 2, 'Hóa Lộc': 3, 'Lộc Tồn': 2,
      'Nguyệt Đức': 1, 'Quốc Ấn': 1, 'Phong Cáo': 1, 'Thiên Mã': 1
    };

    const minusStars = {
      'Cô Thần': -3, 'Quả Tú': -3,
      'Địa Không': -3, 'Địa Kiếp': -3,
      'Linh Tinh': -2, 'Hỏa Tinh': -2,
      'Tang Môn': -3, 'Bạch Hổ': -2,
      'Phá Toái': -2, 'Hóa Kỵ': -2,
      'Kình Dương': -3, 'Đà La': -3
    };

    const thienCan = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];

    const calcCanChi = (year) => {
      const offset = ((year - 1984) % 60 + 60) % 60;
      return {
        can: thienCan[offset % 10],
        chi: CHI_ORDER[offset % 12]
      };
    };

    const candidates = [];
    for (let year = currentLunarYear; year <= currentLunarYear + 20; year += 1) {
      const age = year - birthLunarYear + 1;
      const waitYears = Math.max(0, age - currentAge);
      const { can, chi } = calcCanChi(year);
      const tieuHanPalaceChi = Object.keys(tieuHanMap).find((palaceChi) => tieuHanMap[palaceChi] === chi) || null;
      if (!tieuHanPalaceChi) continue;

      const palace = palaceMap[toKey(tieuHanPalaceChi)] || null;
      const palaceTitle = String(cungChinhMap[tieuHanPalaceChi] || palace?.cungChinh || palace?.title || '').trim();
      let score = 0;
      if (Object.prototype.hasOwnProperty.call(palacePlusScore, palaceTitle)) {
        score += palacePlusScore[palaceTitle];
      }

      const stars = [
        ...getMainStars(palace, tieuHanPalaceChi).map(String),
        ...getSubStars(palace, tieuHanPalaceChi).map(String)
      ];
      const uniqueStars = [...new Set(stars)];
      uniqueStars.forEach((star) => {
        if (Object.prototype.hasOwnProperty.call(plusStars, star)) score += plusStars[star];
        if (Object.prototype.hasOwnProperty.call(minusStars, star)) score += minusStars[star];
      });

      const effectiveScore = age < 20 ? -100 : (score - waitYears * 0.5);
      candidates.push({ year, can, chi, effectiveScore, waitYears });
    }

    candidates.sort((a, b) => {
      if (b.effectiveScore !== a.effectiveScore) return b.effectiveScore - a.effectiveScore;
      if (a.waitYears !== b.waitYears) return a.waitYears - b.waitYears;
      return a.year - b.year;
    });

    if (candidates.length === 0) return [];
    const first = candidates[0];
    const secondPool = candidates.filter((c) => c.year > first.year && c.chi !== first.chi);
    secondPool.sort((a, b) => {
      if (b.effectiveScore !== a.effectiveScore) return b.effectiveScore - a.effectiveScore;
      const da = Math.abs(a.year - first.year);
      const db = Math.abs(b.year - first.year);
      if (da !== db) return da - db;
      return a.year - b.year;
    });
    const second = secondPool[0];

    return second ? [first, second] : [first];
  }, [
    lunarInfo?.lunarYear,
    lunarInfo?.namHanLunarYear,
    amDuongMenhCuc?.tuoi,
    tieuHanMap,
    palaceMap,
    cungChinhMap,
    mainStarsMap,
    subStarsMap
  ]);

  const currentAgeForDaiVan = Number.isFinite(amDuongMenhCuc?.tuoi)
    ? Number(amDuongMenhCuc.tuoi)
    : null;

  const palacesForCanvas = useMemo(() => {
    return cungArray.map((slot) => {
      const palace = palaceMap[toKey(slot.label)] || null;
      const palaceTitle = cungChinhMap[slot.label] || palace?.cungChinh || palace?.title || '';

      const fixedBottomStars = [];
      if (slot.label === 'Thìn') fixedBottomStars.push('Thiên La');
      if (slot.label === 'Tuất') fixedBottomStars.push('Địa Võng');
      if (String(palaceTitle).toLowerCase() === 'nô bộc') fixedBottomStars.push('Thiên Thương');
      if (String(palaceTitle).toLowerCase() === 'tật ách') fixedBottomStars.push('Thiên Sứ');

      const subStars = sortSubStarsForDisplay(getSubStars(palace, slot.label))
        .filter((s) => !FIXED_BOTTOM_STARS.has(String(s)));
      const leftSubStars = subStars.filter((s) => !BAD_STARS.has(String(s)));
      const rightSubStars = sortBadStarsForDisplay(subStars.filter((s) => BAD_STARS.has(String(s))));

      const luuPriority = [
        'L.Thái Tuế',
        'L.Kình Dương',
        'L.Đà La',
        'L.Tang Môn',
        'L.Bạch Hổ',
        'L.Thiên Khốc',
        'L.Thiên Hư',
        'L.Thiên Mã',
        'L.Đào Hoa',
        'L.Lộc Tồn'
      ];
      const luuStars = ((isAnSaoLuu ? luuStarsMap[slot.label] : []) || [])
        .slice()
        .sort((a, b) => {
          const ia = luuPriority.indexOf(a);
          const ib = luuPriority.indexOf(b);
          const pa = ia === -1 ? 999 : ia;
          const pb = ib === -1 ? 999 : ib;
          return pa - pb;
        });

      const luuGoodStars = luuStars.filter((star) => star === 'L.Đào Hoa' || star === 'L.Lộc Tồn');
      const luuOtherStars = luuStars.filter((star) => star !== 'L.Đào Hoa' && star !== 'L.Lộc Tồn');

      const starNames = getMainStars(palace, slot.label).map(s => String(s));
      const mainStars = starNames.map((starName) => {
        const status = getMainStarStatus(starName, slot.label);
        return {
          text: `${starName}${status ? `(${status})` : ''}`,
          color: getMainStarColor(starName)
        };
      });

      // Collect niên hóa labels present in this palace (A/B/C/D), but don't append to star text
      const palaceNienHoa = isTuHoaMode
        ? Array.from(new Set(starNames.flatMap((sn) => getNienHoaLabelsForMainStar(sn))))
        : [];

      const makeSubStar = (star) => ({
        text: formatSubStarWithStatus(star, slot.label),
        color: getSubStarColor(star) || '#111111'
      });

      const makeLuuStar = (star) => ({
        text: star,
        color: getLuuStarColor(star) || '#d32f2f'
      });

      return {
        ...slot,
        palaceTitle,
        thanMarker: slot.label === thanChi,
        canChiTop: canCungMap[slot.label]
          ? `${canCungMap[slot.label]}.${slot.label}${getChiPolaritySign(slot.label)}`
          : `${slot.label}${getChiPolaritySign(slot.label)}`,
        daiVan: daiVanMap[slot.label] || '',
        isCurrentDaiVan: Number.isFinite(currentAgeForDaiVan)
          && Number.isFinite(Number(daiVanMap[slot.label]))
          && currentAgeForDaiVan >= Number(daiVanMap[slot.label])
          && currentAgeForDaiVan <= Number(daiVanMap[slot.label]) + 9,
        mainStars,
        nienHoa: palaceNienHoa,
        leftSubStars: leftSubStars.map(makeSubStar),
        rightSubStars: [...rightSubStars, ...fixedBottomStars].map(makeSubStar),
        luuGoodStars: luuGoodStars.map(makeLuuStar),
        luuOtherStars: luuOtherStars.map(makeLuuStar),
        trangSinh: trangSinhMap[slot.label] || '',
        thaiTueSequence: isTuHoaMode ? (thaiTueYearSequenceMap[slot.label] || '') : '',
        tieuHan: tieuHanMap[slot.label] || '',
        thangHan: thangHanMap[slot.label] || ''
      };
    });
  }, [
    cungArray,
    palaceMap,
    cungChinhMap,
    isAnSaoLuu,
    luuStarsMap,
    isTuHoaMode,
    thanChi,
    canCungMap,
    daiVanMap,
    currentAgeForDaiVan,
    trangSinhMap,
    thaiTueYearSequenceMap,
    tieuHanMap,
    thangHanMap,
    BAD_STARS
  ]);

  const centerInfo = useMemo(() => {
    const hanHi = hanHiCandidates.length > 0
      ? `Hạn hỉ: ${hanHiCandidates.map((it) => `${it.year}(${it.can || ''} ${it.chi || ''})`).join(', ')}`
      : 'Hạn hỉ: chưa xác định';

    const namSinh = `${lunarInfo?.solarYear || '-'}${lunarInfo?.lunarYear ? ` (${lunarInfo.lunarYear})` : ''}`.trim();
    const thangSinh = `${lunarInfo?.solarMonth || '-'}${lunarInfo?.lunarMonth ? ` (${String(lunarInfo.lunarMonth).padStart(2, '0')})` : ''}`.trim();
    const ngaySinh = `${lunarInfo?.solarDay || '-'}${lunarInfo?.lunarDay ? ` (${String(lunarInfo.lunarDay).padStart(2, '0')})` : ''}`.trim();
    const namHanYear = String(birthInfo?.namHanSelectedSolarYear || lunarInfo?.namHanLunarYear || '-').trim();
    const namHanCanChi = String(lunarInfo?.namHanCanChi || '').trim();
    const tuoi = Number.isFinite(amDuongMenhCuc.tuoi) ? Number(amDuongMenhCuc.tuoi) : null;

    return {
      name: birthInfo?.name || '-',
      namSinh,
      thangSinh,
      ngaySinh,
      gioSinh: `${birthInfo?.time || '-'}`.trim(),
      namHan: namHanYear,
      namHanCanChi,
      amDuong: `${amDuongMenhCuc.amDuong || ''}`.trim(),
      tuoi,
      menh: amDuongMenhCuc.menh || '',
      cuc: amDuongMenhCuc.cuc || '',
      batTu: {
        nam: lunarInfo?.yearCanChi || '-',
        thang: lunarInfo?.monthCanChi || '-',
        ngay: lunarInfo?.dayCanChi || '-',
        gio: lunarInfo?.hourCanChi || '-'
      },
      menhCucRelation: amDuongMenhCuc.menhCucRelation || '',
      amDuongTrangThai: `Âm dương ${String(amDuongMenhCuc.amDuongTrangThai || '').toLowerCase()}`,
      hanHi
    };
  }, [birthInfo, lunarInfo, amDuongMenhCuc, hanHiCandidates]);

  const khamThienChartData = useMemo(() => {
    return cungArray.map((slot) => {
      const palace = palaceMap[toKey(slot.label)] || null;
      return {
        chi: slot.label,
        can: canCungMap[slot.label] || '',
        chinhTinh: getMainStars(palace, slot.label).map(String),
        phuTinh: getSubStars(palace, slot.label).map(String)
      };
    });
  }, [cungArray, palaceMap, canCungMap, subStarsMap]);

  // --- ĐOẠN CODE "ỐNG HÚT" BƠM DỮ LIỆU LÊN MÌNH CHÈN VÀO ĐÂY ---
  useEffect(() => {
    if (typeof onCalculated === 'function') {
      onCalculated({
        thongTinLaSo: centerInfo,         
        muoiHaiCung: khamThienChartData,  
        giaoDienCung: palacesForCanvas    
      });
    }
  }, [centerInfo, khamThienChartData, palacesForCanvas, onCalculated]);
  // -------------------------------------------------------------

  return (
    <HoroscopeCanvas
      palaces={palacesForCanvas}
      centerInfo={centerInfo}
      tuanTrietInfo={tuanTrietInfo}
      isNamPhaiOff={isNamPhaiOff}
      isTuHoaMode={isTuHoaMode}
      overlay={(
        <KhamThienTuHoa
          chartData={khamThienChartData}
          palaceCoordinates={palaceCoordinates}
          cungChinhMap={cungChinhMap}
          isVisible={isTuHoaMode}
        />
      )}
    />
  );
}

export default HoroscopeChart;