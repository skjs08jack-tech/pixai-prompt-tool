// data.js（年齢タブ無し。ここを増やしていけば完成する）

var FIXED_PREFIX = ""; // いつも先頭につけたい固定文（任意）
var FIXED_SUFFIX = ""; // いつも末尾につけたい固定文（任意）

var PROMPT_CATEGORIES = [
  {
    id: "bodyShape",
    name: "体型の設定",
    items: [
      { label: "痩せた", value: "skinny, " },
      { label: "スリム", value: "slim, " },
      { label: "普通", value: "normal body, " },
      { label: "むちむち", value: "curvy, " },
      { label: "太もも太い", value: "thick thighs, " },
      { label: "尻大きい", value: "wide hips, " }
    ]
  },
  {
    id: "breasts",
    name: "胸の設定",
    items: [
      { label: "貧乳", value: "small breasts, " },
      { label: "普通乳", value: "normal breasts, " },
      { label: "巨乳", value: "large breasts, " },
      { label: "爆乳", value: "huge breasts, " }
    ]
  },

  {
    id: "front_hair",
    name: "前髪の設定",
    items: [
      { label: "姫カット", value: "hime cut, " },
      { label: "ぱっつん", value: "blunt bangs, " },
      { label: "片目隠れ", value: "hair over one eye, " },
      { label: "目隠れ", value: "hair over eyes, " }
    ]
  },
  {
    id: "back_hair",
    name: "後ろ髪の設定",
    items: [
      { label: "ロング", value: "long hair, " },
      { label: "ミディアム", value: "medium hair, " },
      { label: "ショート", value: "short hair, " },
      { label: "ポニテ", value: "ponytail, " },
      { label: "ツインテ", value: "twintails, " }
    ]
  },
  {
    id: "hair_color",
    name: "髪色の設定",
    items: [
      { label: "黒", value: "black hair, " },
      { label: "白", value: "white hair, " },
      { label: "赤", value: "red hair, " },
      { label: "金", value: "blonde hair, " },
      { label: "青", value: "blue hair, " }
    ]
  },
  {
    id: "hair_accessory",
    name: "髪の装飾品",
    items: [
      { label: "ヘアピン", value: "hairpin, " },
      { label: "ヘアリボン", value: "hair ribbon, " },
      { label: "ヘアバンド", value: "hairband, " }
    ]
  },

  {
    id: "eye_shape",
    name: "目の形の設定",
    items: [
      { label: "半目", value: "half-closed eyes, " },
      { label: "ジト目", value: "jitome, " },
      { label: "ツリ目", value: "tsurime, " },
      { label: "タレ目", value: "tareme, " }
    ]
  },
  {
    id: "eye_color",
    name: "目の色の設定",
    items: [
      { label: "赤", value: "red eyes, " },
      { label: "青", value: "blue eyes, " },
      { label: "緑", value: "green eyes, " },
      { label: "紫", value: "purple eyes, " },
      { label: "金", value: "gold eyes, " }
    ]
  },
  {
    id: "expression",
    name: "表情の設定",
    items: [
      { label: "ニヤニヤ", value: "naughty face, " },
      { label: "挑発", value: "seductive smile, " },
      { label: "怒り", value: "angry, " },
      { label: "恥ずかしい", value: "embarrassed, " }
    ]
  },

  {
    id: "clothes",
    name: "服装の設定",
    items: [
      { label: "Tシャツ", value: "t-shirt, " },
      { label: "ドレス", value: "dress, " },
      { label: "制服", value: "school uniform, " },
      { label: "メイド", value: "maid, " },
      { label: "ビキニ", value: "micro bikini, " }
    ]
  },

  {
    id: "normal_pose",
    name: "一般ポーズ",
    items: [
      { label: "立つ", value: "standing, " },
      { label: "座る", value: "sitting, " },
      { label: "四つん這い", value: "all fours, " },
      { label: "寝てる", value: "sleeping, " }
    ]
  },
  {
    id: "ero_pose",
    name: "エロポーズ",
    items: [
      { label: "誘惑", value: "seducing pose, " },
      { label: "M字開脚", value: "straddling, " },
      { label: "パイズリ", value: "paizuri, " }
    ]
  },
  {
    id: "sex_pose",
    name: "セックス体位",
    items: [
      { label: "正常位", value: "missionary, " },
      { label: "バック", value: "doggy style, " },
      { label: "騎乗位", value: "cowgirl position, " }
    ]
  },

  {
    id: "juice",
    name: "汁系",
    items: [
      { label: "汗", value: "sweat, " },
      { label: "唾液", value: "saliva, " },
      { label: "愛液", value: "love juice, " }
    ]
  }
];
