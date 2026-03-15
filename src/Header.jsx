import React from 'react';

function Header() {
  return (
    <header className="site-header">
      <div className="site-header-top">
        <div className="site-header-inner">
          <div className="header-brand">
            <div className="header-logo-shell">
              <img src="/tuvitinhdieu.jpg?v=20260314-2" alt="Logo Tử VI Tinh Diệu" className="header-logo-img" />
            </div>
            <div className="header-brand-copy">
              <div className="header-brand-kicker">Diễn đàn luận giải huyền học</div>
              <div className="header-brand-title">Tử VI Tinh Diệu</div>
              <div className="header-brand-subline">Chịu trách nhiệm nội dung: Mr.Hiếu</div>
            </div>
          </div>

          <nav className="site-nav" aria-label="Main navigation">
            <a href="#" className="site-nav-link">Trang Chủ</a>
            <a href="#" className="site-nav-link">An Sao Lá Số</a>
            <a href="#" className="site-nav-link">Luận Giải Nhanh</a>
          </nav>

          <div className="site-header-actions">
            <a href="#" className="social-chip" aria-label="Facebook">FB</a>
            <a href="#" className="social-chip" aria-label="Youtube">YT</a>
            <a href="#" className="social-chip" aria-label="Twitter">TW</a>
            <button type="button" className="header-cta-btn">Tư Vấn Nhanh</button>
          </div>
        </div>
      </div>

      <div className="site-news-strip">
        <div className="site-header-inner site-news-inner">
          <span className="news-badge">Trang chủ</span>
          <a href="#" className="news-link">Vận hạn tuần này</a>
          <a href="#" className="news-link">Giờ hoàng đạo hôm nay</a>
          <a href="#" className="news-link">Kiến thức tử vi</a>
        </div>
      </div>
    </header>
  );
}

export default Header;
