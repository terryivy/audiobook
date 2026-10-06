/* 有声读物 — 书目数据 v1.0 */
window.BOOKS = [
  {
    id: "xiyouji",
    lang: "zh",
    title: "西游记精选",
    titleEn: "Journey to the West (Selected)",
    author: "吴承恩",
    cover: "🐵",
    c1: "#f59e0b", c2: "#dc2626",
    desc: "中国古典四大名著之一。孙悟空、猪八戒、沙僧护送唐僧西天取经，降妖伏魔，历经九九八十一难。",
    chapters: [
      { title: "第一回 · 灵根育孕", file: "audio/xyj_ch1.mp3" },
      { title: "第七回 · 大闹天宫", file: "audio/xyj_ch7.mp3" },
      { title: "第二十七回 · 三打白骨精", file: "audio/xyj_ch27.mp3" }
    ]
  },
  {
    id: "sanguo",
    lang: "zh",
    title: "三国演义精选",
    titleEn: "Romance of the Three Kingdoms (Selected)",
    author: "罗贯中",
    cover: "⚔️",
    c1: "#b91c1c", c2: "#450a0a",
    desc: "中国古典四大名著之一。东汉末年群雄逐鹿，魏蜀吴三国鼎立，谋士如云，猛将如雨，演绎多少英雄传奇。",
    chapters: [
      { title: "第一回 · 桃园结义", file: "audio/sgyy_ch1.mp3" },
      { title: "第四十九回 · 火烧赤壁", file: "audio/sgyy_ch49.mp3" },
      { title: "第九十五回 · 空城计", file: "audio/sgyy_ch95.mp3" }
    ]
  },
  {
    id: "alice",
    lang: "en",
    title: "爱丽丝漫游奇境",
    titleEn: "Alice's Adventures in Wonderland",
    author: "刘易斯·卡罗尔",
    cover: "🐇",
    c1: "#8b5cf6", c2: "#4f46e5",
    desc: "爱丽丝掉进兔子洞，来到一个光怪陆离的奇境：会说话的兔子、疯狂的茶会、扑克牌王后……世界文学史上最著名的童话之一。",
    chapters: [
      { title: "Chapter 1 · 掉进兔子洞", file: "audio/alice_chI.mp3" },
      { title: "Chapter 2 · 眼泪池", file: "audio/alice_chII.mp3" },
      { title: "Chapter 3 · 竞走与长故事", file: "audio/alice_chIII.mp3" }
    ]
  },
  {
    id: "qiuzhuang",
    lang: "zh",
    title: "球状闪电",
    titleEn: "Ball Lightning",
    author: "刘慈欣",
    cover: "⚡",
    c1: "#0ea5e9", c2: "#7c3aed",
    theme: "scifi",
    hasText: true,
    desc: "刘慈欣经典科幻长篇。一个雷雨之夜，神秘的球状闪电夺走了主人公父母的生命，也点燃了他毕生的追寻——从大气物理到宏电子、宏聚变，一场关于科学与执念的壮丽探索。播放时可同步浏览文字。",
    chapters: [
      { title: "序曲", file: "audio/qz_01.mp3" },
      { title: "上篇 · 大学", file: "audio/qz_02.mp3" },
      { title: "上篇 · 异象之一", file: "audio/qz_03.mp3" },
      { title: "上篇 · 异象之二", file: "audio/qz_04.mp3" },
      { title: "上篇 · 西伯利亚", file: "audio/qz_05.mp3" },
      { title: "中篇 · 灯塔启示", file: "audio/qz_06.mp3" },
      { title: "中篇 · 球状闪电", file: "audio/qz_07.mp3" },
      { title: "中篇 · 丁仪", file: "audio/qz_08.mp3" },
      { title: "中篇 · 观察者", file: "audio/qz_09.mp3" },
      { title: "中篇 · 异象之三", file: "audio/qz_10.mp3" },
      { title: "中篇 · 核电厂", file: "audio/qz_11.mp3" },
      { title: "中篇 · 异象之四", file: "audio/qz_12.mp3" },
      { title: "下篇 · 龙卷风", file: "audio/qz_13.mp3" },
      { title: "下篇 · 宏聚变", file: "audio/qz_14.mp3" }
    ]
  }
];
