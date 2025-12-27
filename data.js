// data.js
// ここだけ編集すれば、カテゴリや候補を増やせる設計にしてあるよ。

var PROMPT_CATEGORIES = [
  {
    id: "rating",
    name: "レーティング（18+のみ）",
    items: [
      { label: "R-18", value: "rating:explicit" },
      { label: "R-15(例)", value: "rating:suggestive" }
    ]
  },
  {
    id: "quality",
    name: "品質タグ",
    items: [
      { label: "高品質", value: "masterpiece, best quality" },
      { label: "アニメ寄り", value: "anime style, sharp lineart" }
    ]
  },
  {
    id: "subject",
    name: "被写体",
    items: [
      { label: "1girl", value: "1girl, solo" },
      { label: "1boy", value: "1boy, solo" }
    ]
  },
  {
    id: "pose",
    name: "ポーズ",
    items: [
      { label: "立ち", value: "standing, full body" },
      { label: "座り", value: "sitting" },
      { label: "寝", value: "lying" }
    ]
  },
  {
    id: "face",
    name: "表情",
    items: [
      { label: "微笑み", value: "smile" },
      { label: "赤面", value: "blush" },
      { label: "挑発", value: "seductive" }
    ]
  }
];

// いつも固定で入れたい「土台プロンプト」があればここ
var FIXED_PREFIX = "";
var FIXED_SUFFIX = "";
