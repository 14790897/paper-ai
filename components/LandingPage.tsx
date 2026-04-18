"use client";

import React, { useEffect, useRef } from "react";

/**
 * LandingPage — 未登录用户看到的落地页
 * 使用纯 Tailwind + 内联样式，不引入额外依赖
 */
export default function LandingPage({ lng }: { lng: string }) {
  const isZh = lng === "zh-CN";

  // 滚动淡入动画
  const fadeEls = useRef<HTMLDivElement[]>([]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("landing-visible");
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    fadeEls.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // 导航栏滚动阴影
  useEffect(() => {
    const nav = document.getElementById("landing-navbar");
    const onScroll = () =>
      nav?.classList.toggle("landing-nav-scrolled", window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const registerFadeRef = (el: HTMLDivElement | null) => {
    if (el) fadeEls.current.push(el);
  };

  return (
    <>
      <style>{`
        /* ===== Landing Page Scoped Styles ===== */
        .landing-page { color: #1a1a2e; background: #fafbff; overflow-x: hidden; width: 100vw; min-height: 100vh; margin-left: calc(-50vw + 50%); }

        .landing-gradient-text {
          background: linear-gradient(135deg, #4f46e5, #06b6d4);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .landing-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 28px; border-radius: 10px; font-weight: 600; font-size: 0.95rem;
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: #fff !important; border: none; cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 14px rgba(79,70,229,0.35);
        }
        .landing-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(79,70,229,0.45); }

        .landing-btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 28px; border-radius: 10px; font-weight: 600; font-size: 0.95rem;
          background: transparent; color: #4f46e5; border: 2px solid #4f46e5; cursor: pointer;
          transition: all 0.2s;
        }
        .landing-btn-outline:hover { background: #4f46e5; color: #fff; }

        .landing-btn-white {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 1.05rem;
          background: #fff; color: #4f46e5; border: none; cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .landing-btn-white:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.2); }

        /* Navbar */
        .landing-navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: rgba(250, 251, 255, 0.85); backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(0,0,0,0.06); transition: box-shadow 0.3s;
        }
        .landing-nav-scrolled { box-shadow: 0 2px 24px rgba(0,0,0,0.06); }

        /* Hero particles */
        .landing-particle {
          position: absolute; border-radius: 50%; opacity: 0.15;
          animation: landing-float 20s infinite ease-in-out;
        }
        @keyframes landing-float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-60px) translateX(30px); }
          50% { transform: translateY(-20px) translateX(-20px); }
          75% { transform: translateY(-80px) translateX(10px); }
        }

        /* Feature card */
        .landing-feature-card {
          padding: 36px; border-radius: 16px; background: #fafbff;
          border: 1px solid rgba(0,0,0,0.05);
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .landing-feature-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.06);
        }

        /* Step connector line */
        .landing-step { position: relative; text-align: center; }
        .landing-step::after {
          content: ''; position: absolute; top: 24px; right: -12px;
          width: 24px; height: 2px; background: #d4d4e8;
        }
        @media (max-width: 768px) { .landing-step::after { display: none; } }

        /* Mockup */
        .landing-mockup {
          background: linear-gradient(135deg, #f0f0ff, #e8f4fd);
          border-radius: 20px; padding: 32px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.06);
        }

        /* Source card */
        .landing-source-card {
          padding: 32px; border-radius: 16px; background: #fff;
          border: 1px solid rgba(0,0,0,0.05); text-align: center;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .landing-source-card:hover { transform: translateY(-4px); box-shadow: 0 8px 30px rgba(0,0,0,0.06); }

        /* Fade up animation */
        .landing-fade-up {
          opacity: 0; transform: translateY(30px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .landing-fade-up.landing-visible { opacity: 1; transform: translateY(0); }
      `}</style>

      <div className="landing-page">
        {/* ===== Navbar ===== */}
        <nav className="landing-navbar" id="landing-navbar">
          <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-16">
            <a href="#" className="flex items-center gap-2.5 font-bold text-xl no-underline text-gray-900">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="url(#l-logo)" />
                <path d="M8 10h16M8 16h12M8 22h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="24" cy="20" r="4" fill="rgba(255,255,255,0.3)" />
                <path d="M23 20l1 1 2-2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <defs><linearGradient id="l-logo" x1="0" y1="0" x2="32" y2="32"><stop stopColor="#4f46e5" /><stop offset="1" stopColor="#6366f1" /></linearGradient></defs>
              </svg>
              Paper AI
            </a>
            <div className="flex items-center gap-6">
              <a href="https://docs.paperai.sixiangjia.de/" target="_blank" rel="noreferrer"
                className="hidden md:inline-flex items-center whitespace-nowrap no-underline transition-all hover:-translate-y-0.5"
                style={{ padding: "7px 16px", fontSize: "0.88rem", fontWeight: 600, background: "#fff", color: "#4f46e5", border: "2px solid #e0e0e0", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
                {isZh ? "文档" : "Docs"}
              </a>
              <a href={`/${lng}/login`} className="landing-btn-primary whitespace-nowrap" style={{ padding: "7px 16px", fontSize: "0.88rem", fontWeight: 700 }}>
                {isZh ? "登录 / 注册" : "Sign In"}
              </a>
            </div>
          </div>
        </nav>

        {/* ===== Hero ===== */}
        <section className="relative pt-40 pb-24 md:pt-48 md:pb-28" style={{ background: "linear-gradient(180deg, #f0f0ff 0%, #fafbff 100%)" }}>
          {/* Particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[{w:8,l:"10%",bg:"#4f46e5",delay:"0s",dur:"18s"},{w:12,l:"30%",bg:"#06b6d4",delay:"-3s",dur:"22s"},{w:6,l:"50%",bg:"#8b5cf6",delay:"-6s",dur:"16s"},{w:10,l:"70%",bg:"#10b981",delay:"-9s",dur:"24s"},{w:8,l:"90%",bg:"#f97316",delay:"-2s",dur:"20s"}].map((p,i) => (
              <div key={i} className="landing-particle" style={{ width: p.w, height: p.w, background: p.bg, left: p.l, top: "20%", animationDelay: p.delay, animationDuration: p.dur }} />
            ))}
          </div>
          {/* Radial glow */}
          <div className="absolute -top-48 -right-48 w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)" }} />
          <div className="absolute -bottom-24 -left-36 w-[400px] h-[400px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)" }} />

          <div className="relative z-10 max-w-[1200px] mx-auto px-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6"
              style={{ background: "rgba(79,70,229,0.08)", color: "#4f46e5" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              {isZh ? "开源免费 · AI 服务不收费" : "Open Source & Free"}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6 max-w-[700px]">
              {isZh ? (
                <>使用<span className="landing-gradient-text">真实文献</span><br />让 AI 完成你的论文</>
              ) : (
                <>Write Papers with <span className="landing-gradient-text">Real References</span><br />Powered by AI</>
              )}
            </h1>

            <p className="text-lg md:text-xl text-gray-500 max-w-[560px] mb-10 leading-relaxed">
              {isZh
                ? "搜索 Semantic Scholar、arXiv、PubMed 海量学术资源，AI 自动引用真实文献，在你的文档中直接生成带引用的学术论文。"
                : "Search millions of academic papers from Semantic Scholar, arXiv and PubMed. AI generates well-cited academic content directly in your document."}
            </p>

            <div className="flex flex-wrap gap-4">
              <a href={`/${lng}/login`} className="landing-btn-primary">
                {isZh ? "免费开始使用" : "Get Started Free"}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>
              </a>
              <a href={`/${lng}?guest=1`} className="landing-btn-outline">
                {isZh ? "暂不登录，直接体验" : "Try as Guest"}
              </a>
              <a href="https://github.com/14790897/paper-ai" target="_blank" rel="noreferrer" className="landing-btn-outline" style={{ borderColor: "transparent", padding: "10px 16px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" /></svg>
                GitHub
              </a>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap md:flex-nowrap gap-8 md:gap-12 mt-16 pt-10 border-t border-gray-200/60">
              {[
                { num: "3 亿+", label: isZh ? "Semantic Scholar 学术论文" : "Semantic Scholar Papers" },
                { num: "240 万+", label: isZh ? "arXiv 预印本文献" : "arXiv Preprints" },
                { num: "3600 万+", label: isZh ? "PubMed 生物医学文献" : "PubMed Biomedical Papers" },
              ].map((s, i) => (
                <div key={i}>
                  <h3 className="text-2xl md:text-3xl font-extrabold landing-gradient-text">{s.num}</h3>
                  <p className="text-sm text-gray-400 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Features ===== */}
        <section className="py-24 md:py-28 bg-white">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
                {isZh ? "强大的功能，简洁的体验" : "Powerful Features, Simple Experience"}
              </h2>
              <p className="text-gray-500 text-lg max-w-[540px] mx-auto">
                {isZh ? "从文献搜索到论文生成，一站式完成学术写作的全部流程" : "From literature search to paper generation, complete the entire academic writing workflow"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: "layers", color: "blue", titleZh: "AI 智能写作", titleEn: "AI Writing", descZh: "基于大语言模型，通过自然对话生成学术论文内容。AI 理解你的研究方向，自动组织语言和段落结构。", descEn: "Generate academic content through natural conversation. AI understands your research direction and organizes language and structure automatically." },
                { icon: "search", color: "cyan", titleZh: "真实文献搜索", titleEn: "Real Literature Search", descZh: "直接搜索 Semantic Scholar、arXiv、PubMed 等权威学术数据库，获取真实可引用的论文资源。", descEn: "Search Semantic Scholar, arXiv, PubMed and more to find real, citable academic papers." },
                { icon: "file", color: "green", titleZh: "自动引用插入", titleEn: "Auto Citation", descZh: "搜索到的文献自动以标准引用格式插入到文档中，支持多种引用格式，告别手动排版的繁琐。", descEn: "Auto-insert citations in standard formats. Support multiple citation styles, no more manual formatting." },
                { icon: "edit", color: "purple", titleZh: "富文本编辑器", titleEn: "Rich Text Editor", descZh: "内置 Quill 编辑器，支持标题、加粗、斜体、列表等丰富排版功能，随时修改 AI 生成的内容。", descEn: "Built-in Quill editor with headings, bold, italic, lists and more. Edit AI-generated content anytime." },
                { icon: "download", color: "orange", titleZh: "Word 文档导出", titleEn: "Word Export", descZh: "一键将论文导出为 Word (.docx) 格式，保留完整的排版和引用信息，直接提交或继续编辑。", descEn: "One-click export to Word (.docx) with full formatting and citations. Submit or continue editing." },
                { icon: "globe", color: "pink", titleZh: "多语言支持", titleEn: "Multi-language", descZh: "支持中文、英语、德语等多种界面语言，适应全球学术用户的写作需求。", descEn: "Supports Chinese, English, German and more interface languages for global academic users." },
              ].map((f, i) => (
                <div key={i} ref={registerFadeRef} className="landing-fade-up landing-feature-card">
                  <div className="w-14 h-14 rounded-[14px] flex items-center justify-center mb-5"
                    style={{ background: `rgba(${{blue:"79,70,229",cyan:"6,182,212",green:"16,185,129",purple:"139,92,246",orange:"249,115,22",pink:"236,72,153"}[f.color]},0.1)` }}>
                    <Icon name={f.icon} color={{blue:"#4f46e5",cyan:"#06b6d4",green:"#10b981",purple:"#8b5cf6",orange:"#f97316",pink:"#ec4899"}[f.color]} />
                  </div>
                  <h3 className="text-lg font-bold mb-2.5">{isZh ? f.titleZh : f.titleEn}</h3>
                  <p className="text-gray-500 leading-relaxed">{isZh ? f.descZh : f.descEn}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== How It Works ===== */}
        <section className="py-24 md:py-28" style={{ background: "linear-gradient(180deg, #f8f9ff 0%, #fafbff 100%)" }}>
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
                {isZh ? "四步完成论文" : "Four Steps to Your Paper"}
              </h2>
              <p className="text-gray-500 text-lg max-w-[540px] mx-auto">
                {isZh ? "从零开始到完成一篇带真实引用的学术论文，只需几分钟" : "From scratch to a well-cited academic paper in minutes"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6">
              {(isZh ? [
                { title: "输入主题", desc: "描述你的论文主题和研究方向，AI 会理解你的写作意图。" },
                { title: "搜索文献", desc: "使用关键词搜索，系统从多个学术数据库中检索相关论文。" },
                { title: "AI 生成", desc: "AI 结合你选定的文献，生成带有真实引用的学术内容。" },
                { title: "导出论文", desc: "编辑完善后，一键导出为 Word 文档，直接使用。" },
              ] : [
                { title: "Describe Topic", desc: "Describe your research topic. AI understands your writing intent." },
                { title: "Search Papers", desc: "Search by keywords. The system retrieves papers from multiple databases." },
                { title: "AI Generates", desc: "AI combines your selected references to generate cited academic content." },
                { title: "Export Paper", desc: "Edit and refine, then export to Word with one click." },
              ]).map((s, i) => (
                <div key={i} ref={registerFadeRef} className="landing-fade-up landing-step pb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5 text-white font-extrabold text-xl"
                    style={{ background: "linear-gradient(135deg, #4f46e5, #6366f1)" }}>
                    {i + 1}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Demo Mockup ===== */}
        <section className="py-24 md:py-28 bg-white">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
                {isZh ? "直观的编辑体验" : "Intuitive Editing Experience"}
              </h2>
              <p className="text-gray-500 text-lg">
                {isZh ? "上方编辑文档，底部管理文献引用，简洁高效" : "Editor on top, references at the bottom — clean and efficient"}
              </p>
            </div>

            <div ref={registerFadeRef} className="landing-fade-up landing-mockup max-w-[960px] mx-auto">
              {/* Title bar */}
              <div className="flex gap-2 mb-5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                <span className="ml-3 text-xs text-gray-400">Paper AI — {isZh ? "我的论文" : "My Paper"}</span>
              </div>

              {/* Editor area */}
              <div className="bg-white rounded-xl p-7 shadow-sm mb-4">
                <h3 className="text-base font-bold mb-3 text-gray-900">
                  {isZh ? "深度学习在自然语言处理中的应用研究" : "Deep Learning in Natural Language Processing"}
                </h3>
                {[
                  { w: "100%", h: 2.5, bg: "#e8e8f0" },
                  { w: "85%", h: 2, bg: "#e8e8f0" },
                  { w: "100%", h: 2, bg: "#e8e8f0" },
                  { w: "70%", h: 2, bg: "#e8e8f0" },
                  { w: "60%", h: 2.5, bg: "rgba(79,70,229,0.15)", mt: 5 },
                  { w: "85%", h: 2, bg: "rgba(6,182,212,0.12)" },
                  { w: "100%", h: 2, bg: "rgba(6,182,212,0.12)" },
                  { w: "70%", h: 2, bg: "rgba(6,182,212,0.12)" },
                  { w: "100%", h: 2, bg: "#e8e8f0", mt: 5 },
                  { w: "85%", h: 2, bg: "#e8e8f0" },
                  { w: "100%", h: 2, bg: "rgba(16,185,129,0.12)" },
                  { w: "60%", h: 2.5, bg: "rgba(16,185,129,0.15)" },
                ].map((l, i) => (
                  <div key={i} className="rounded-full mb-2.5" style={{ width: l.w, height: l.h * 4, background: l.bg, marginTop: (l as any).mt || 0 }} />
                ))}
              </div>

              {/* Reference list — matches real product: numbered items at bottom */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="flex items-center justify-between px-5 pt-4 pb-2">
                  <h4 className="text-sm font-bold flex items-center gap-1.5 text-gray-700">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                    {isZh ? "我的文献" : "My References"} (5)
                  </h4>
                </div>
                <div className="divide-y divide-gray-100">
                {[
                  { idx: 1, source: "Semantic Scholar", tagBg: "rgba(79,70,229,0.1)", tagColor: "#4f46e5", text: 'Vaswani et al. "Attention Is All You Need" (2017)', venue: "NeurIPS" },
                  { idx: 2, source: "arXiv", tagBg: "rgba(249,115,22,0.1)", tagColor: "#f97316", text: 'Devlin et al. "BERT: Pre-training of Deep Bidirectional Transformers" (2019)', venue: "" },
                  { idx: 3, source: "PubMed", tagBg: "rgba(16,185,129,0.1)", tagColor: "#10b981", text: 'Brown et al. "Language Models are Few-Shot Learners" (2020)', venue: "NeurIPS" },
                  { idx: 4, source: "Semantic Scholar", tagBg: "rgba(79,70,229,0.1)", tagColor: "#4f46e5", text: 'Radford et al. "Improving Language Understanding by Generative Pre-Training" (2018)', venue: "" },
                  { idx: 5, source: "arXiv", tagBg: "rgba(249,115,22,0.1)", tagColor: "#f97316", text: 'Chowdhery et al. "PaLM: Scaling Language Modeling with Pathways" (2022)', venue: "" },
                ].map((r) => (
                  <div key={r.idx} className="flex items-center gap-3 px-5 py-3 text-xs">
                    <span className="flex-shrink-0 w-6 h-6 rounded-md bg-gray-100 text-gray-500 flex items-center justify-center font-semibold text-[0.7rem]">{r.idx}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[0.65rem] font-semibold"
                          style={{ background: r.tagBg, color: r.tagColor }}>{r.source}</span>
                        {r.venue && <span className="text-[0.65rem] text-gray-400">{r.venue}</span>}
                      </div>
                      <div className="text-gray-600 leading-relaxed truncate">{r.text}</div>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-1.5">
                      {/* link icon */}
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      {/* copy icon */}
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      {/* delete icon */}
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Data Sources ===== */}
        <section className="py-24 md:py-28" style={{ background: "linear-gradient(180deg, #fafbff 0%, #f0f0ff 100%)" }}>
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
                {isZh ? "权威数据来源" : "Authoritative Data Sources"}
              </h2>
              <p className="text-gray-500 text-lg max-w-[540px] mx-auto">
                {isZh ? "对接全球顶级学术数据库，确保文献的真实性和权威性" : "Connected to top global academic databases for authentic, authoritative references"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { logo: "S²", grad: "linear-gradient(135deg, #4f46e5, #6366f1)", title: "Semantic Scholar", descZh: "由 AI2 打造的免费学术搜索引擎，覆盖超过 2 亿篇来自各学科领域的学术论文，提供智能语义搜索。", descEn: "Free academic search engine by AI2, covering 200M+ papers across all disciplines with semantic search." },
                { logo: "arXiv", grad: "linear-gradient(135deg, #b91c1c, #dc2626)", title: "arXiv", descZh: "全球最大的预印本论文开放获取平台，涵盖物理学、数学、计算机科学、生物学等领域的最新研究成果。", descEn: "The world's largest open-access preprint platform covering physics, math, CS, biology and more." },
                { logo: "PM", grad: "linear-gradient(135deg, #059669, #10b981)", title: "PubMed", descZh: "美国国家医学图书馆的生物医学文献数据库，收录超过 3600 万篇来自生命科学和医学领域的文献引用。", descEn: "NLM's biomedical literature database with 36M+ citations from life sciences and medicine." },
              ].map((s, i) => (
                <div key={i} ref={registerFadeRef} className="landing-fade-up landing-source-card">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-extrabold text-2xl"
                    style={{ background: s.grad }}>
                    {s.logo}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{isZh ? s.descZh : s.descEn}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="py-24 md:py-28 text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #4f46e5, #6366f1, #818cf8)" }}>
          <div className="absolute -top-1/2 -left-1/4 w-[200%] h-[200%] pointer-events-none"
            style={{ background: "radial-gradient(circle at 30% 40%, rgba(255,255,255,0.1) 0%, transparent 50%)" }} />
          <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              {isZh ? "开始撰写你的论文" : "Start Writing Your Paper"}
            </h2>
            <p className="text-lg opacity-85 mb-9 max-w-[500px] mx-auto">
              {isZh ? "免费使用，无需注册即可体验 AI 论文写作的全新方式" : "Free to use, experience a whole new way of AI-assisted academic writing"}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href={`/${lng}/login`} className="landing-btn-white">
                {isZh ? "免费开始使用" : "Get Started Free"}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>
              </a>
              <a href={`/${lng}?guest=1`}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-base cursor-pointer no-underline text-white transition-all hover:-translate-y-0.5"
                style={{ background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.3)" }}>
                {isZh ? "暂不登录，直接体验" : "Try as Guest"}
              </a>
            </div>
          </div>
        </section>

        {/* ===== Footer ===== */}
        <footer className="text-gray-400 py-16" style={{ background: "#1a1a2e" }}>
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
              {/* Brand */}
              <div className="lg:col-span-1">
                <div className="flex items-center gap-2.5 font-bold text-lg text-white mb-3">
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                    <rect width="32" height="32" rx="8" fill="#6366f1" />
                    <path d="M8 10h16M8 16h12M8 22h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="24" cy="20" r="4" fill="rgba(255,255,255,0.3)" />
                    <path d="M23 20l1 1 2-2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Paper AI
                </div>
                <p className="text-sm leading-relaxed">
                  {isZh ? "使用真实文献最快速完成论文的方法。开源免费，AI 服务不收费。" : "The fastest way to write papers with real references. Open source and free."}
                </p>
              </div>
              {/* Product */}
              <div>
                <h4 className="text-white text-sm font-bold mb-4">{isZh ? "产品" : "Product"}</h4>
                <ul className="space-y-2.5 text-sm list-none p-0">
                  <li><a href={`/${lng}/login`} className="no-underline hover:text-white transition-colors">{isZh ? "在线使用" : "Use Online"}</a></li>
                  <li><a href="https://docs.paperai.sixiangjia.de/" target="_blank" rel="noreferrer" className="no-underline hover:text-white transition-colors">{isZh ? "使用文档" : "Docs"}</a></li>
                  <li><a href="https://www.bilibili.com/video/BV1Ya4y1k75V" target="_blank" rel="noreferrer" className="no-underline hover:text-white transition-colors">{isZh ? "视频教程" : "Video Tutorial"}</a></li>
                </ul>
              </div>
              {/* Resources */}
              <div>
                <h4 className="text-white text-sm font-bold mb-4">{isZh ? "资源" : "Resources"}</h4>
                <ul className="space-y-2.5 text-sm list-none p-0">
                  <li><a href="https://github.com/14790897/paper-ai" target="_blank" rel="noreferrer" className="no-underline hover:text-white transition-colors">GitHub</a></li>
                  <li><a href="https://gitcode.com/liuweiqing147/paper-ai" target="_blank" rel="noreferrer" className="no-underline hover:text-white transition-colors">GitCode</a></li>
                  <li><a href="https://github.com/14790897/paper-ai/issues" target="_blank" rel="noreferrer" className="no-underline hover:text-white transition-colors">{isZh ? "问题反馈" : "Issues"}</a></li>
                </ul>
              </div>
              {/* Deploy */}
              <div>
                <h4 className="text-white text-sm font-bold mb-4">{isZh ? "部署" : "Deploy"}</h4>
                <ul className="space-y-2.5 text-sm list-none p-0">
                  <li><a href="https://vercel.com/new/clone?repository-url=https://github.com/14790897/paper-ai" target="_blank" rel="noreferrer" className="no-underline hover:text-white transition-colors">Vercel</a></li>
                  <li><a href="https://github.com/14790897/paper-ai#镜像运行" target="_blank" rel="noreferrer" className="no-underline hover:text-white transition-colors">Docker</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs">
              <span>&copy; {new Date().getFullYear()} Paper AI &middot; MIT License &middot; liuweiqing</span>
              <div className="flex gap-6">
                <a href={`/${lng}/privacy`} target="_blank" className="no-underline hover:text-white transition-colors">{isZh ? "隐私政策" : "Privacy"}</a>
                <a href={`/${lng}/service`} target="_blank" className="no-underline hover:text-white transition-colors">{isZh ? "服务条款" : "Terms"}</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

/* ===== SVG Icon Component ===== */
function Icon({ name, color }: { name: string; color: string }) {
  const props = { width: 28, height: 28, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "layers":
      return <svg {...props}><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>;
    case "search":
      return <svg {...props}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>;
    case "file":
      return <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>;
    case "edit":
      return <svg {...props}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>;
    case "download":
      return <svg {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>;
    case "globe":
      return <svg {...props}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>;
    default:
      return null;
  }
}
