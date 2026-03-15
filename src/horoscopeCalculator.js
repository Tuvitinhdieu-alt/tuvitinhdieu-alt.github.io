// Gọi thư viện chuyển đổi lịch thật sự
import { SolarDate } from "lunar-date-vn";

// Dữ liệu lá số mẫu tạm thời đã bị loại bỏ vì không chính xác
const sampleChartData = [];

// Địa Chi chuẩn (dùng chung)
export const CHI_ARRAY = ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];
export const CAN_ARRAY = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];

/**
 * Hàm tính toán lá số tử vi
 */
export function calculateHoroscope(birthInfo) {
    console.log("Dữ liệu nhận được từ Form:", birthInfo);

    // 1. Tách lấy Năm, Tháng, Ngày từ dữ liệu người dùng nhập.
    let solarYear, solarMonth, solarDay;
    let lunarYear, lunarMonth, lunarDay;

    // SỬA LỖI Ở ĐÂY: Dùng birthInfo.dob thay vì birthInfo.birthDate
    const parts = birthInfo.dob.split('-').map(Number);

    if (birthInfo.isLunar) {
        const [ly, lm, ld] = parts; 
        lunarYear = ly;
        lunarMonth = lm;
        lunarDay = ld;

        const start = new Date(ly - 1, 0, 1);
        const end = new Date(ly + 1, 11, 31);
        let found = null;
        for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
            const sd = new SolarDate(new Date(dt));
            const ldObj = sd.toLunarDate();
            if (ldObj.year === ly && ldObj.month === lm && ldObj.day === ld) {
                found = new Date(dt);
                break;
            }
        }
        if (!found) {
            solarYear = ly;
            solarMonth = lm;
            solarDay = ld;
        } else {
            solarYear = found.getFullYear();
            solarMonth = found.getMonth() + 1;
            solarDay = found.getDate();
        }
    } else {
        const [year, month, day] = parts;
        solarYear = year;
        solarMonth = month;
        solarDay = day;

        const solarDateObj = new SolarDate(new Date(solarYear, solarMonth - 1, solarDay));
        const lunarDateObj = solarDateObj.toLunarDate();
        lunarDay = lunarDateObj.day;
        lunarMonth = lunarDateObj.month;
        lunarYear = lunarDateObj.year;
    }

    // 3. CÔNG THỨC TOÁN HỌC TÍNH CAN/CHI
    const canArray = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
    const chiArray = CHI_ARRAY;

    const yearStemIndex = ((lunarYear - 4) % 10 + 10) % 10;
    const yearBranchIndex = ((lunarYear - 4) % 12 + 12) % 12;
    const yearCan = canArray[yearStemIndex];
    const yearChi = chiArray[yearBranchIndex];
    const yearCanChi = `${yearCan} ${yearChi}`;

    const monthChiIndex = (lunarMonth + 1) % 12; 
    const monthChi = chiArray[monthChiIndex];
    const monthStemIndex = (yearStemIndex * 2 + lunarMonth + 1) % 10;
    const monthCan = canArray[monthStemIndex];
    const monthCanChi = `${monthCan} ${monthChi}`;

    // SỬA LỖI NĂM HẠN: Dùng birthInfo.year thay vì birthInfo.namHanSelectedSolarYear
    let namHanLunarYear;
    if (birthInfo && birthInfo.year) {
        const sel = Number(birthInfo.year);
        const solarForSel = new SolarDate(new Date(sel, 6, 1));
        namHanLunarYear = solarForSel.toLunarDate().year;
    } else {
        const todaySolar = new SolarDate(new Date());
        namHanLunarYear = todaySolar.toLunarDate().year;
    }
    const namHanStemIndex = ((namHanLunarYear - 4) % 10 + 10) % 10;
    const namHanBranchIndex = ((namHanLunarYear - 4) % 12 + 12) % 12;
    const namHanCan = canArray[namHanStemIndex];
    const namHanChi = chiArray[namHanBranchIndex];
    const namHanCanChi = `${namHanCan} ${namHanChi}`;

    // SỬA LỖI GIỜ SINH: Dùng birthInfo.time thay vì birthInfo.birthTime
    const timeParts = birthInfo.time ? birthInfo.time.split(':').map(Number) : [0,0];
    const hour = timeParts[0];
    
    const branchByHour = ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];
    const hourIndexForBranch = Math.floor(((hour + 1) % 24) / 2);
    const hourChi = branchByHour[hourIndexForBranch];

    function jdFromDate(dd, mm, yy) {
        const a = Math.floor((14 - mm) / 12);
        const y = yy + 4800 - a;
        const m = mm + 12 * a - 3;
        return dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    }

    const jdn = jdFromDate(solarDay, solarMonth, solarYear);

    const dayStemIndex = ((jdn + 9) % 10 + 10) % 10;
    const dayBranchIndex = ((jdn + 1) % 12 + 12) % 12;
    const dayCan = canArray[dayStemIndex];
    const dayChi = chiArray[dayBranchIndex];
    const dayCanChi = `${dayCan} ${dayChi}`;

    const hourStemIndex = (dayStemIndex * 2 + hourIndexForBranch) % 10;
    const hourCan = canArray[hourStemIndex];
    const hourCanChi = `${hourCan} ${hourChi}`;

    const lunarInfo = {
        lunarDate: `${lunarDay}/${lunarMonth}/${lunarYear}`,
        lunarYear: lunarYear,
        yearCanChi: yearCanChi,
        solarYear,
        solarMonth,
        solarDay,
        lunarMonth,
        lunarDay,
        monthCanChi,
        namHanLunarYear: namHanLunarYear,
        namHanCanChi: namHanCanChi,
        dayCanChi: dayCanChi,
        hourCanChi: hourCanChi,
    };

    return {
        chart: sampleChartData,
        lunarInfo: lunarInfo,
    };
}

// --- HÀM HỖ TRỢ AN ÂN QUANG VÀ THIÊN QUÝ ---
// Công thức theo quy tắc: Ân Quang lấy Xương làm mùng một, thuận NGÀY sinh rồi lùi 1 cung.
// Thiên Quý lấy Khúc làm mùng một, đếm nghịch NGÀY sinh rồi lùi 1 cung.

// Trả về index (0-11)
export function anQuangIndexFromXuongIndex(xuongIndex, ngaySinh) {
    return ((xuongIndex + ngaySinh - 2) % 12 + 12) % 12;
}

export function thienQuyIndexFromKhucIndex(khucIndex, ngaySinh) {
    return ((khucIndex - ngaySinh + 2) % 12 + 12) % 12;
}

// Trả về tên Địa Chi
export function anQuangFromXuongChi(xuongChi, ngaySinh) {
    const idx = CHI_ARRAY.findIndex(c => c === xuongChi);
    if (idx === -1) return null;
    return CHI_ARRAY[anQuangIndexFromXuongIndex(idx, ngaySinh)];
}

export function thienQuyFromKhucChi(khucChi, ngaySinh) {
    const idx = CHI_ARRAY.findIndex(c => c === khucChi);
    if (idx === -1) return null;
    return CHI_ARRAY[thienQuyIndexFromKhucIndex(idx, ngaySinh)];
}

// --- HÀM HỖ TRỢ AN THAI PHỤ VÀ PHONG CÁO ---
// Theo quy tắc: Thai Phụ đứng trước (về phía thuần thuận) so với Văn Khúc một vị trí "thực tế" (áp dụng ví dụ: Văn Khúc ở Dậu -> Thai Phụ ở Hợi)
// Và Phong Cáo đứng sau lưng Văn Khúc (ví dụ: Văn Khúc ở Dậu -> Phong Cáo ở Mùi).
// Ở ví dụ trên: Dậu(index=9) -> Thai Phụ = Hợi(index=11) => +2; Phong Cáo = Mùi(index=7) => -2.

export function thaiPhuIndexFromKhucIndex(khucIndex) {
    return ((khucIndex + 2) % 12 + 12) % 12;
}

export function phongCaoIndexFromKhucIndex(khucIndex) {
    return ((khucIndex - 2) % 12 + 12) % 12;
}

export function thaiPhuFromKhucChi(khucChi) {
    const idx = CHI_ARRAY.findIndex(c => c === khucChi);
    if (idx === -1) return null;
    return CHI_ARRAY[thaiPhuIndexFromKhucIndex(idx)];
}

export function phongCaoFromKhucChi(khucChi) {
    const idx = CHI_ARRAY.findIndex(c => c === khucChi);
    if (idx === -1) return null;
    return CHI_ARRAY[phongCaoIndexFromKhucIndex(idx)];
}

// --- HÀM HỖ TRỢ AN TAM THAI, BÁT TỌA ---
// Tam Thai: Từ Tả Phù, đếm thuận đến ngày sinh.
// Bát Tọa: Từ Hữu Bật, đếm nghịch đến ngày sinh.

// Trả về index (0-11)
export function anTamThaiIndexFromTaPhuIndex(taPhuIndex, ngaySinh) {
    return ((taPhuIndex + ngaySinh - 1) % 12 + 12) % 12;
}

export function anBatToaIndexFromHuuBatIndex(huuBatIndex, ngaySinh) {
    return ((huuBatIndex - (ngaySinh - 1)) % 12 + 12) % 12;
}

// Trả về tên Địa Chi
export function anTamThaiFromTaPhuChi(taPhuChi, ngaySinh) {
    const idx = CHI_ARRAY.findIndex(c => c === taPhuChi);
    if (idx === -1) return null;
    return CHI_ARRAY[anTamThaiIndexFromTaPhuIndex(idx, ngaySinh)];
}

export function anBatToaFromHuuBatChi(huuBatChi, ngaySinh) {
    const idx = CHI_ARRAY.findIndex(c => c === huuBatChi);
    if (idx === -1) return null;
    return CHI_ARRAY[anBatToaIndexFromHuuBatIndex(idx, ngaySinh)];
}

/**
 * Tính toán chính xác vị trí của sao Tuần và sao Triệt.
 * @param {string} can - Thiên Can của năm sinh (vd: 'Giáp').
 * @param {string} chi - Địa Chi của năm sinh (vd: 'Tý').
 * @returns {{tuan: string|null, triet: string|null}} - Object chứa vị trí, vd: { tuan: 'Thìn_Tỵ', triet: 'Ngọ_Mùi' }.
 */
export function getTuanTrietPosition(can, chi) {
  const result = { tuan: null, triet: null };
  if (!can || !chi) return result;

  // 1. Thuật toán tính sao TRIỆT (dựa vào Thiên Can)
  const trietMap = {
    'Giáp': 'Thân_Dậu', 'Kỷ': 'Thân_Dậu',
    'Ất': 'Ngọ_Mùi', 'Canh': 'Ngọ_Mùi',
    'Bính': 'Thìn_Tỵ', 'Tân': 'Thìn_Tỵ',
    'Đinh': 'Dần_Mão', 'Nhâm': 'Dần_Mão',
    'Mậu': 'Tý_Sửu', 'Quý': 'Tý_Sửu',
  };
  result.triet = trietMap[can] || null;

  // 2. Thuật toán tính sao TUẦN (dựa vào Can và Chi)
  const canIndexMap = {
    'Giáp': 1, 'Ất': 2, 'Bính': 3, 'Đinh': 4, 'Mậu': 5,
    'Kỷ': 6, 'Canh': 7, 'Tân': 8, 'Nhâm': 9, 'Quý': 10
  };
  const chiIndexMap = {
    'Tý': 1, 'Sửu': 2, 'Dần': 3, 'Mão': 4, 'Thìn': 5, 'Tỵ': 6,
    'Ngọ': 7, 'Mùi': 8, 'Thân': 9, 'Dậu': 10, 'Tuất': 11, 'Hợi': 12
  };

  const indexCan = canIndexMap[can];
  const indexChi = chiIndexMap[chi];

  if (indexCan && indexChi) {
    let diff = indexChi - indexCan;
    if (diff < 0) {
      diff += 12;
    }

    switch (diff) {
      case 0:
        result.tuan = 'Tuất_Hợi';
        break;
      case 10:
        result.tuan = 'Thân_Dậu';
        break;
      case 8:
        result.tuan = 'Ngọ_Mùi';
        break;
      case 6:
        result.tuan = 'Thìn_Tỵ';
        break;
      case 4:
        result.tuan = 'Dần_Mão';
        break;
      case 2:
        result.tuan = 'Tý_Sửu';
        break;
      default:
        result.tuan = null;
        break;
    }
  }

  return result;
}