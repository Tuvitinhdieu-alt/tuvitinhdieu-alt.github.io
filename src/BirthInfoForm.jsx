import React, { useState } from 'react';
import './Form.css';

function BirthInfoForm({ onSubmit, isTuHoaMode, setIsTuHoaMode, isAnSaoLuu, setIsAnSaoLuu, isNamPhaiOff, setIsNamPhaiOff }) {
  const [formData, setFormData] = useState({
    name: 'Tử Vi Tinh Diệu',
    gender: 'Nam',
    dob: '1990-05-20',
    time: '10:30',
    year: new Date().getFullYear().toString()
  });

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    if (name === 'anSaoLuu') {
      setIsAnSaoLuu && setIsAnSaoLuu(checked);
      return;
    }
    if (name === 'isNamPhaiOff') {
      setIsNamPhaiOff && setIsNamPhaiOff(checked);
      return;
    }
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, anSaoLuu: !!isAnSaoLuu }); // Kích hoạt sự kiện xem lá số
  };

  return (
    <form onSubmit={handleSubmit} className="birth-form">
      <h2 className="birth-form-title" style={{ color: '#ee3030' }}>
        Vui lòng điền họ tên và ngày tháng năm sinh dương lịch
      </h2>

      <div className="birth-form-group">
        <label className="birth-form-label">Họ và tên</label>
        <input name="name" type="text" placeholder="Nguyễn Văn A" value={formData.name} onChange={handleChange} className="birth-form-control" aria-label="Họ và tên" />
      </div>

      <div className="birth-form-group">
        <label className="birth-form-label">Giới tính</label>
        <select name="gender" value={formData.gender} onChange={handleChange} className="birth-form-control" aria-label="Giới tính">
          <option value="Nam">Nam</option>
          <option value="Nữ">Nữ</option>
        </select>
      </div>

      <div className="birth-form-group">
        <label className="birth-form-label">Ngày sinh (Dương lịch)</label>
        <input name="dob" type="date" value={formData.dob} onChange={handleChange} className="birth-form-control" aria-label="Ngày sinh" />
      </div>

      <div className="birth-form-group">
        <label className="birth-form-label">Giờ sinh</label>
        <input name="time" type="time" placeholder="--:--" value={formData.time} onChange={handleChange} className="birth-form-control" aria-label="Giờ sinh" />
      </div>

      {/* Cụm Năm Hạn nằm ngang */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label className="birth-form-label-inline">Năm hạn</label>
          <input name="year" type="number" value={formData.year} onChange={handleChange} className="birth-form-control birth-form-year" aria-label="Năm hạn" />
        </div>

        <div className="birth-form-toggle-row">
          <label className="birth-form-check">
            <input
              name="anSaoLuu"
              type="checkbox"
              checked={!!isAnSaoLuu}
              onChange={handleChange}
            />
            <span>An sao lưu</span>
          </label>

          <label className="birth-form-check">
            <input
              name="isNamPhaiOff"
              type="checkbox"
              checked={!!isNamPhaiOff}
              onChange={handleChange}
            />
            <span>Tắt lá số Nam Phái</span>
          </label>
        </div>
      </div>

      {/* Checkbox kích hoạt Khâm Thiên Tứ Hóa - đặt ngay phía trên nút submit */}
      {/* Mình đã xóa chữ 'birth-form-centered' và thêm style justify-content flex-start để ép nó sát lề trái */}
      <div className="birth-form-row birth-form-row-full" style={{ justifyContent: 'flex-start' }}>
        <label className="birth-form-check">
          <input type="checkbox" checked={!!isTuHoaMode} onChange={(e) => setIsTuHoaMode && setIsTuHoaMode(e.target.checked)} />
          <span>Kích hoạt lá số Khâm Thiên Tứ Hóa</span>
        </label>
      </div>

      <button type="submit" className="birth-form-submit">Xem lá số</button>
    </form>
  );
}

export default BirthInfoForm;