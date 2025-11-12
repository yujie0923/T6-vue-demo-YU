export const scamMessages = [
  {
    "id": 1,
    "type": "金融機構",
    "sender": "中信銀行 客服",
    "content": "您的帳戶出現異常交易，為保障資金安全請立即點擊驗證：https://verify-bank.tw/main，限時30分鐘內處理。",
    "isScam": true,
    "explanation": "詐騙 — 含可疑連結、製造緊迫感",
    "psychologyScores": {
      "authority": 2,
      "timing": 2,
      "style": 2,
      "motivation": 2
    },
    "techScore": 1
  },
  {
    "id": 3,
    "type": "金融機構",
    "sender": "中信銀行 客服",
    "content": "偵測到異常登入，請於本行驗證頁輸入簡訊驗證碼以恢復權限：https://secure-bank-verify.com/，驗證碼：先送出即綁定。",
    "isScam": true,
    "explanation": "詐騙 — 要求輸入驗證碼、誘導到外部連結",
    "psychologyScores": {
      "authority": 2,
      "timing": 0,
      "style": 2,
      "motivation": 2
    },
    "techScore": 1
  },
  {
    "id": 4,
    "type": "政府機構",
    "sender": "財政部稅務局",
    "content": "您有未繳稅款，已進入強制執行程序，請立即至「財政在線」填寫資料避免罰款：etax-check.tw/main。",
    "isScam": true,
    "explanation": "詐騙 — 製造法律壓力且包含可疑連結",
    "psychologyScores": {
      "authority": 2,
      "timing": 2,
      "style": 2,
      "motivation": 2
    },
    "techScore": 1
  },
  {
    "id": 6,
    "type": "政府機構",
    "sender": "行政院",
    "content": "恭喜您！政府普發補助款核准，請先點連結完成身分資料驗證以領取：gov-aid.claim/GO。",
    "isScam": true,
    "explanation": "詐騙 — 利用補助或罰款誘因、附可疑領取連結",
    "psychologyScores": {
      "authority": 2,
      "timing": 0,
      "style": 2,
      "motivation": 2
    },
    "techScore": 1
  },
  {
    "id": 7,
    "type": "電商／物流平台",
    "sender": "超商宅配",
    "content": "您的包裹因地址資料不完整無法派送，請立即點此更新收件資訊：parcel-fix.tw/AA12，否則將退回寄件人。",
    "isScam": true,
    "explanation": "詐騙 — 含誘導更新連結，常見手法",
    "psychologyScores": {
      "authority": 0,
      "timing": 2,
      "style": 2,
      "motivation": 2
    },
    "techScore": 1
  },
  {
    "id": 9,
    "type": "電商／物流平台",
    "sender": "PC購物",
    "content": "您的訂單退款失敗，請點連結重新綁定卡片以完成退款：refund-now.pchome.com.tw/main（限24小時）。",
    "isScam": true,
    "explanation": "詐騙 — 要求綁定卡片或提供卡號、外部網址",
    "psychologyScores": {
      "authority": 2,
      "timing": 2,
      "style": 2,
      "motivation": 2
    },
    "techScore": 1
  },
  {
    "id": 10,
    "type": "假冒貸款／借款服務",
    "sender": "板信商銀",
    "content": "免保人、免保證！您的信用已符合快速貸款資格，點此填表立即放款：www.fastloan-approve.com/NT（免押/秒過）。",
    "isScam": true,
    "explanation": "詐騙 — 過度保證、誘導連結",
    "psychologyScores": {
      "authority": 2,
      "timing": 2,
      "style": 2,
      "motivation": 2
    },
    "techScore": 1
  },
  {
    "id": 12,
    "type": "假冒貸款／借款服務",
    "sender": "青年創業貨款",
    "content": "恭喜！恭喜！系統已為您核准$200,000，請先支付保證金連結以解凍帳戶：pay-hold.net/azz（24小時內）。",
    "isScam": true,
    "explanation": "詐騙 — 要求先付保證金、誘導匯款",
    "psychologyScores": {
      "authority": 0,
      "timing": 2,
      "style": 2,
      "motivation": 0
    },
    "techScore": 1
  },
  {
    "id": 14,
    "type": "假冒中獎／獎勵／優惠",
    "sender": "寶島眼鏡",
    "content": "恭喜獲得$1,000購物金，點此領取並輸入個資：claim-prize[.]shop/ID（限本日）。",
    "isScam": true,
    "explanation": "詐騙 — 假中獎誘導點連結並要求個資",
    "psychologyScores": {
      "authority": 0,
      "timing": 2,
      "style": 0,
      "motivation": 2
    },
    "techScore": 0
  },
  {
    "id": 15,
    "type": "假冒中獎／獎勵／優惠",
    "sender": "寶島眼鏡",
    "content": "本店特別回饋，完成線上登記可獲精美贈品及折扣券，請先輸入信用卡以兌換：gift-verify[.]com/GO。",
    "isScam": true,
    "explanation": "詐騙 — 要求輸入信用卡資料以「兌換贈品」",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 0,
      "motivation": 2
    },
    "techScore": 0
  },
  {
    "id": 16,
    "type": "金融機構",
    "sender": "台灣銀行 客服",
    "content": "【台灣銀行】偵測異常登入，請立即登入 http://twb-security.com 驗證帳戶，否則將暫停使用。",
    "isScam": true,
    "explanation": "詐騙 — 假冒銀行網站，含可疑短連結  ",
    "psychologyScores": {
      "authority": 2,
      "timing": 2,
      "style": 2,
      "motivation": 2
    },
    "techScore": 1
  },
  {
    "id": 17,
    "type": "金融機構",
    "sender": "國泰世華 銀行",
    "content": "您的信用卡交易遭風控系統暫停，請回覆「解除」以恢復使用。",
    "isScam": true,
    "explanation": "詐騙 — 要求回覆指令屬典型社交工程  ",
    "psychologyScores": {
      "authority": 2,
      "timing": 0,
      "style": 0,
      "motivation": 0
    },
    "techScore": 0
  },
  {
    "id": 19,
    "type": "政府機構",
    "sender": "財政部 稅務局",
    "content": "您有一筆退稅未完成登錄，請於24小時內點擊 gov-taxrefund.tw 補件。",
    "isScam": true,
    "explanation": "詐騙 — 假冒退稅連結  ",
    "psychologyScores": {
      "authority": 2,
      "timing": 2,
      "style": 2,
      "motivation": 0
    },
    "techScore": 1
  },
  {
    "id": 20,
    "type": "政府機構",
    "sender": "內政部",
    "content": "您名下身分異常，請登入 http://moica-idverify.com 補登資料，以免影響權益。",
    "isScam": true,
    "explanation": "詐騙 — 冒用政府機構名義  ",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 2,
      "motivation": 2
    },
    "techScore": 1
  },
  {
    "id": 22,
    "type": "電商平台",
    "sender": "momo購物",
    "content": "您的訂單付款失敗，請點擊 www.momo-refund.com 補登付款資料。",
    "isScam": true,
    "explanation": "詐騙 — 仿冒退款頁面  ",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 2,
      "motivation": 2
    },
    "techScore": 1
  },
  {
    "id": 23,
    "type": "電商平台",
    "sender": "蝦皮購物",
    "content": "蝦皮：包裹地址有誤，請回覆「更正」或登入連結更新配送資料。",
    "isScam": true,
    "explanation": "詐騙 — 利用包裹問題誘導點擊  ",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 2,
      "motivation": 0
    },
    "techScore": 1
  },
  {
    "id": 25,
    "type": "貸款服務",
    "sender": "青年創業貨款",
    "content": "您的貸款資格已核准，請於12小時內完成手續：fastloan-tw.com/verify",
    "isScam": true,
    "explanation": "詐騙 — 假核貸連結  ",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 2,
      "motivation": 2
    },
    "techScore": 1
  },
  {
    "id": 26,
    "type": "貸款服務",
    "sender": "勞工紓困貨款",
    "content": "恭喜獲得10萬核准額度，請先轉帳保證金啟動撥款。",
    "isScam": true,
    "explanation": "詐騙 — 要求預付款典型手法  ",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 0,
      "motivation": 0
    },
    "techScore": 0
  },
  {
    "id": 28,
    "type": "獎勵優惠",
    "sender": "全聯福利中心",
    "content": "恭喜獲得消費滿額回饋金，請點此登錄領取：pxpay-event.com.tw",
    "isScam": true,
    "explanation": "詐騙 — 假冒活動網站  ",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 2,
      "motivation": 2
    },
    "techScore": 1
  },
  {
    "id": 29,
    "type": "獎勵優惠",
    "sender": "中華電信",
    "content": "限時贈送網路流量，立即登入 hinet-promo.co 領取！",
    "isScam": true,
    "explanation": "詐騙 — 假冒優惠連結  ",
    "psychologyScores": {
      "authority": 2,
      "timing": 2,
      "style": 2,
      "motivation": 2
    },
    "techScore": 1
  },
  {
    "id": 31,
    "type": "金融機構",
    "sender": "中國信託",
    "content": "您信用卡積分即將到期，請登入 ctbc-reward.com.tw 延長積分有效期。",
    "isScam": true,
    "explanation": "詐騙 — 假積分網站  ",
    "psychologyScores": {
      "authority": 0,
      "timing": 2,
      "style": 2,
      "motivation": 0
    },
    "techScore": 1
  },
  {
    "id": 33,
    "type": "金融機構",
    "sender": "第一銀行",
    "content": "您的網銀登入異常，請回覆「Y」以重新開通服務。",
    "isScam": true,
    "explanation": "詐騙 — 要求回覆字元屬誘導行為  ",
    "psychologyScores": {
      "authority": 2,
      "timing": 0,
      "style": 0,
      "motivation": 2
    },
    "techScore": 0
  },
  {
    "id": 34,
    "type": "政府機構",
    "sender": "健保署",
    "content": "健保署：健保卡功能異常，請登入 nhib-update.tw 修正資料。",
    "isScam": true,
    "explanation": "詐騙 — 冒用健保署名義  ",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 2,
      "motivation": 2
    },
    "techScore": 1
  },
  {
    "id": 35,
    "type": "政府機構",
    "sender": "環保署",
    "content": "您環保補助資料缺件，請即刻登入 gov-green.org.tw 補登。",
    "isScam": true,
    "explanation": "詐騙 — 假補助網站  ",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 2,
      "motivation": 0
    },
    "techScore": 1
  },
  {
    "id": 37,
    "type": "電商平台",
    "sender": "LINE購物",
    "content": "您獲得LINE購物回饋金，請點 link-twlinebonus.com 領取。",
    "isScam": true,
    "explanation": "詐騙 — 假冒LINE活動  ",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 2,
      "motivation": 2
    },
    "techScore": 1
  },
  {
    "id": 38,
    "type": "電商平台",
    "sender": "蝦皮商城",
    "content": "蝦皮：退款作業需重新輸入卡號，請立即前往 shopee-return.tw",
    "isScam": true,
    "explanation": "詐騙 — 要求輸入卡號資料  ",
    "psychologyScores": {
      "authority": 0,
      "timing": 2,
      "style": 2,
      "motivation": 0
    },
    "techScore": 1
  },
  {
    "id": 40,
    "type": "貸款服務",
    "sender": "板信商銀",
    "content": "系統核貸通過，請繳手續費$300以啟動撥款程序。",
    "isScam": true,
    "explanation": "詐騙 — 要求先付費啟動  ",
    "psychologyScores": {
      "authority": 2,
      "timing": 0,
      "style": 0,
      "motivation": 0
    },
    "techScore": 0
  },
  {
    "id": 41,
    "type": "貸款服務",
    "sender": "台灣銀行",
    "content": "您的信用評分不足，請提供銀行存摺影本以完成核對。",
    "isScam": true,
    "explanation": "詐騙 — 要求提供個資  ",
    "psychologyScores": {
      "authority": 2,
      "timing": 0,
      "style": 0,
      "motivation": 0
    },
    "techScore": 0
  },
  {
    "id": 43,
    "type": "獎勵優惠",
    "sender": "王品牛排",
    "content": "王品會員抽獎中獎通知，請填寫信用卡號確認身份：vipaward-tw.com",
    "isScam": true,
    "explanation": "詐騙 — 要求卡號資料  ",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 2,
      "motivation": 2
    },
    "techScore": 1
  },
  {
    "id": 44,
    "type": "獎勵優惠",
    "sender": "寶雅",
    "content": "您獲得限量優惠券，請於24小時內點擊 po-ya-promo.net 領取。",
    "isScam": true,
    "explanation": "詐騙 — 假冒品牌活動  ",
    "psychologyScores": {
      "authority": 0,
      "timing": 2,
      "style": 2,
      "motivation": 2
    },
    "techScore": 1
  },
  {
    "id": 46,
    "type": "金融機構",
    "sender": "臺灣土地銀行",
    "content": "您的貸款月付異常，請登入 landbank-tw-check.com 核對資料。",
    "isScam": true,
    "explanation": "詐騙 — 假冒銀行連結  ",
    "psychologyScores": {
      "authority": 2,
      "timing": 0,
      "style": 2,
      "motivation": 2
    },
    "techScore": 1
  },
  {
    "id": 47,
    "type": "金融機構",
    "sender": "彰化銀行",
    "content": "彰銀通知：帳戶異常登入，若非本人請立即回覆「確認」。",
    "isScam": true,
    "explanation": "詐騙 — 誘導回覆簡訊  ",
    "psychologyScores": {
      "authority": 2,
      "timing": 2,
      "style": 0,
      "motivation": 2
    },
    "techScore": 0
  },
  {
    "id": 49,
    "type": "政府機構",
    "sender": "勞動部",
    "content": "您可申請就業補助金，請至 labor-paygov.tw 確認資料。",
    "isScam": true,
    "explanation": "詐騙 — 冒用勞動部名義  ",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 2,
      "motivation": 0
    },
    "techScore": 1
  },
  {
    "id": 50,
    "type": "政府機構",
    "sender": "地政事務所",
    "content": "地政登記異常，請立即回覆身分證字號以修正。",
    "isScam": true,
    "explanation": "詐騙 — 要求個資  ",
    "psychologyScores": {
      "authority": 0,
      "timing": 2,
      "style": 0,
      "motivation": 2
    },
    "techScore": 0
  },
  {
    "id": 52,
    "type": "電商平台",
    "sender": "7-11取貨",
    "content": "包裹暫存即將逾期，請登入 7pickup-tw.com 重新預約。",
    "isScam": true,
    "explanation": "詐騙 — 假取貨連結  ",
    "psychologyScores": {
      "authority": 0,
      "timing": 2,
      "style": 2,
      "motivation": 0
    },
    "techScore": 1
  },
  {
    "id": 53,
    "type": "電商平台",
    "sender": "Amazon台灣",
    "content": "跨境包裹稅款未繳，請立即繳納以免退件：amazon-taxpay.com.tw",
    "isScam": true,
    "explanation": "詐騙 — 冒用品牌與假稅務連結  ",
    "psychologyScores": {
      "authority": 0,
      "timing": 2,
      "style": 2,
      "motivation": 2
    },
    "techScore": 1
  },
  {
    "id": 55,
    "type": "貸款服務",
    "sender": "速現金",
    "content": "貸款通過！請先繳交開戶費用$500以完成手續。",
    "isScam": true,
    "explanation": "詐騙 — 要求預付費用  ",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 0,
      "motivation": 2
    },
    "techScore": 0
  },
  {
    "id": 56,
    "type": "貸款服務",
    "sender": "民間貸款網",
    "content": "立即貸出免審核，輸入帳號即可撥款：www.easyloan.com.tw",
    "isScam": true,
    "explanation": "詐騙 — 可疑外部網站  ",
    "psychologyScores": {
      "authority": 0,
      "timing": 2,
      "style": 2,
      "motivation": 0
    },
    "techScore": 1
  },
  {
    "id": 58,
    "type": "獎勵優惠",
    "sender": "家樂福",
    "content": "恭喜獲得$1000購物金，請登入 carrefour-prize.com.tw 領取！",
    "isScam": true,
    "explanation": "詐騙 — 假活動網站  ",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 2,
      "motivation": 2
    },
    "techScore": 1
  },
  {
    "id": 59,
    "type": "獎勵優惠",
    "sender": "統一超商",
    "content": "限時抽獎通知：請回覆「確認」以完成登錄。",
    "isScam": true,
    "explanation": "詐騙 — 要求回覆互動簡訊  ",
    "psychologyScores": {
      "authority": 0,
      "timing": 2,
      "style": 0,
      "motivation": 2
    },
    "techScore": 0
  },
  {
    "id": 69,
    "type": "假冒交友或戀愛關係",
    "sender": "李先生",
    "content": "妳好，我是某知名交友平台的配對專員，為了驗證你的個人資料，我們需要你提供銀行帳號來確認身份。",
    "isScam": true,
    "explanation": "此為典型的詐騙訊息，要求提供銀行帳號以達到詐騙目的。",
    "psychologyScores": {
      "authority": 2,
      "timing": 0,
      "style": 2,
      "motivation": 0
    },
    "techScore": 1
  },
  {
    "id": 70,
    "type": "假冒交友或戀愛關係",
    "sender": "Tony",
    "content": "親愛的，我最近剛認識你，真的覺得你很特別，但需要你先轉帳50元來完成我們的身份驗證。",
    "isScam": true,
    "explanation": "此訊息利用戀愛關係進行詐騙，要求轉帳來進行所謂的“身份驗證”。",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 2,
      "motivation": 0
    },
    "techScore": 1
  },
  {
    "id": 71,
    "type": "假冒交友或戀愛關係",
    "sender": "小偉",
    "content": "你有可能中了我們的抽獎活動，恭喜你！但需要先支付一筆費用才能領取獎品。",
    "isScam": true,
    "explanation": "詐騙手法，通過假冒抽獎活動要求支付費用。",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 0,
      "motivation": 2
    },
    "techScore": 0
  },
  {
    "id": 72,
    "type": "假冒交友或戀愛關係",
    "sender": "可欣",
    "content": "你想認識我嗎？我現在在国外，非常想與你見面，但需要你先付款來幫我解決一些困難。",
    "isScam": true,
    "explanation": "這類訊息以戀愛為幌子要求對方支付費用，屬於典型的詐騙行為。",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 0,
      "motivation": 0
    },
    "techScore": 0
  },
  {
    "id": 81,
    "type": "假冒親友或家人",
    "sender": "爸爸",
    "content": "寶貝，我的手機壞了，現在不能接聽電話，請匯款5000元來給我修理！",
    "isScam": true,
    "explanation": "這是典型的詐騙手法，假冒家人要求轉帳金額進行所謂的“手機修理”。",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 0,
      "motivation": 0
    },
    "techScore": 0
  },
  {
    "id": 82,
    "type": "假冒親友或家人",
    "sender": "姐姐",
    "content": "我現在在外地遇到點麻煩，需要你匯款2000元過來幫我度過困難，謝謝！",
    "isScam": true,
    "explanation": "詐騙分子假冒姐姐要求匯款，利用情感操控。",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 0,
      "motivation": 0
    },
    "techScore": 0
  },
  {
    "id": 83,
    "type": "假冒親友或家人",
    "sender": "媽媽",
    "content": "我在銀行卡裡發現了一筆可疑款項，為了安全起見請你轉帳到新的帳戶以保護資金安全。",
    "isScam": true,
    "explanation": "這是利用銀行詐騙手法，要求轉帳以“保護資金”。",
    "psychologyScores": {
      "authority": 2,
      "timing": 0,
      "style": 0,
      "motivation": 2
    },
    "techScore": 0
  },
  {
    "id": 84,
    "type": "假冒親友或家人",
    "sender": "哥哥",
    "content": "我現在有點急需用錢，能不能幫我匯款一筆，稍後會還給你！",
    "isScam": true,
    "explanation": "詐騙訊息假冒哥哥要求匯款，利用家庭關係操縱情感。",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 0,
      "motivation": 0
    },
    "techScore": 0
  },
  {
    "id": 93,
    "type": "假冒中獎或抽獎",
    "sender": "小天使抽獎中心",
    "content": "恭喜您贏得了10萬元現金！為了領取您的獎金，請將1000元轉帳至指定帳戶以完成確認。",
    "isScam": true,
    "explanation": "詐騙訊息以虛假的獎金為誘餌，要求匯款以「確認」獎金。",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 0,
      "motivation": 2
    },
    "techScore": 0
  },
  {
    "id": 94,
    "type": "假冒中獎或抽獎",
    "sender": "香港電視",
    "content": "恭喜您在香港電視的抽獎活動中獲得價值5萬的豪華轎車！請立即匯款3000元處理手續費。",
    "isScam": true,
    "explanation": "詐騙訊息假冒抽獎通知，要求付款以「處理手續費」。",
    "psychologyScores": {
      "authority": 0,
      "timing": 2,
      "style": 0,
      "motivation": 2
    },
    "techScore": 0
  },
  {
    "id": 95,
    "type": "假冒中獎或抽獎",
    "sender": "世界大獎活動",
    "content": "您贏得了我們的全球大獎，價值100萬元的房子！請先支付2000元確認獎品發送。",
    "isScam": true,
    "explanation": "這是典型的詐騙訊息，要求先付款以領取虛假的高額獎品。",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 0,
      "motivation": 2
    },
    "techScore": 0
  },
  {
    "id": 96,
    "type": "假冒中獎或抽獎",
    "sender": "超級大獎公司",
    "content": "恭喜您中了超級大獎！獲得全球旅遊基金50萬，請點擊此鏈接並輸入您的銀行帳號。",
    "isScam": true,
    "explanation": "詐騙訊息假冒中獎，要求提供銀行帳號以完成「領獎」程序。",
    "psychologyScores": {
      "authority": 2,
      "timing": 0,
      "style": 2,
      "motivation": 2
    },
    "techScore": 1
  },
  {
    "id": 105,
    "type": "假冒金融商品或投資機會",
    "sender": "比特幣高回報投資",
    "content": "恭喜您選中比特幣超高回報投資計劃，投資1萬元即可在7天內獲得10萬元回報！",
    "isScam": true,
    "explanation": "詐騙訊息以虛假的獎金為誘餌，要求匯款以「確認」獎金。",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 0,
      "motivation": 2
    },
    "techScore": 0
  },
  {
    "id": 106,
    "type": "假冒金融商品或投資機會",
    "sender": "外匯投資公司",
    "content": "恭喜您被選為外匯投資計劃的VIP會員，請先匯款5萬元以啟動您的高收益外匯交易！",
    "isScam": true,
    "explanation": "詐騙訊息假冒外匯公司，要求匯款以啟動虛假的交易計劃。",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 0,
      "motivation": 2
    },
    "techScore": 0
  },
  {
    "id": 107,
    "type": "假冒金融商品或投資機會",
    "sender": "華爾街基金會",
    "content": "現在投資股市只需5千元，並保證3個月內翻倍回報！點擊此鏈接立即投資！",
    "isScam": true,
    "explanation": "這是詐騙訊息，承諾不切實際的回報，誘使受害者點擊鏈接並投資。",
    "psychologyScores": {
      "authority": 0,
      "timing": 2,
      "style": 2,
      "motivation": 2
    },
    "techScore": 1
  },
  {
    "id": 108,
    "type": "假冒金融商品或投資機會",
    "sender": "快速賺錢計劃",
    "content": "立即加入我們的快速賺錢計劃，只需10分鐘，每日穩賺5000元！不要錯過！",
    "isScam": true,
    "explanation": "這是典型的快速致富詐騙，承諾不切實際的高回報，誘使受害者投資。",
    "psychologyScores": {
      "authority": 0,
      "timing": 2,
      "style": 0,
      "motivation": 2
    },
    "techScore": 0
  },
  {
    "id": 117,
    "type": "假冒公務機關或法務機構",
    "sender": "台灣法務部",
    "content": "您因未繳納罰款已被註冊為黑名單，請立即支付5000元以解除封鎖。",
    "isScam": true,
    "explanation": "詐騙訊息假冒法務部，要求繳款以解除虛構的「封鎖」。",
    "psychologyScores": {
      "authority": 0,
      "timing": 2,
      "style": 0,
      "motivation": 2
    },
    "techScore": 0
  },
  {
    "id": 118,
    "type": "假冒公務機關或法務機構",
    "sender": "台灣政府機構",
    "content": "您的身份資料被發現存在問題，請儘快匯款至指定帳戶以進行核實。",
    "isScam": true,
    "explanation": "這是典型的詐騙手法，假冒政府機構要求匯款以進行身份核實。",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 0,
      "motivation": 0
    },
    "techScore": 0
  },
  {
    "id": 119,
    "type": "假冒公務機關或法務機構",
    "sender": "台灣司法局",
    "content": "您的案件涉及未繳納罰款，請立即透過此鏈接支付，否則將會面臨法律制裁。",
    "isScam": true,
    "explanation": "詐騙訊息假冒司法機構，威脅法律制裁並要求付款。",
    "psychologyScores": {
      "authority": 0,
      "timing": 2,
      "style": 0,
      "motivation": 2
    },
    "techScore": 0
  },
  {
    "id": 120,
    "type": "假冒公務機關或法務機構",
    "sender": "行政機構",
    "content": "您的社會福利補助金遭到凍結，請支付1000元手續費以解凍。",
    "isScam": true,
    "explanation": "詐騙訊息以假冒行政機構為名，要求支付手續費解凍所謂的「社會福利補助金」。",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 0,
      "motivation": 0
    },
    "techScore": 0
  },
  {
    "id": 121,
    "type": "假冒貸款服務",
    "sender": "婕希",
    "content": "過年紓困，10萬內來就借息低，保密，免抵押，杜絕詐騙10分鐘火速撥款電話 0928-494964 婕希LineID: aa4964",
    "isScam": true,
    "explanation": "詐騙貸款服務，快速撥款為詐騙手段",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 0,
      "motivation": 0
    },
    "techScore": 0
  },
  {
    "id": 122,
    "type": "假冒貸款服務",
    "sender": "Money66666",
    "content": "開工發財金 1-10萬線上審核 免碰面對保 3分鐘火速到帳 電話:0960-559161 Line:Money66666",
    "isScam": true,
    "explanation": "宣稱快速貸款，無需面對面，通常為詐騙",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 0,
      "motivation": 0
    },
    "techScore": 0
  },
  {
    "id": 123,
    "type": "假冒貸款服務",
    "sender": "婕希",
    "content": "線上審核 火速放款 輕鬆過件借過可再借 有工作免壓免保免照會本利攤還 拒絕高利 電話 0928-494964 婕希賴: aa4964",
    "isScam": true,
    "explanation": "此為不明貸款服務，通常屬詐騙",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 0,
      "motivation": 2
    },
    "techScore": 0
  },
  {
    "id": 124,
    "type": "假冒貸款服務",
    "sender": "林小姐",
    "content": "【低利率專案，每萬元月息100】小額週轉，疫情紓困，當日放款，免任何抵押，不必看人臉色，本利償還負擔低，洽0903-184-006林小姐",
    "isScam": true,
    "explanation": "低利率貸款為常見的詐騙手法",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 0,
      "motivation": 2
    },
    "techScore": 0
  },
  {
    "id": 125,
    "type": "假冒貸款服務",
    "sender": "Money66666",
    "content": "線上審核唯一首選 1-10萬免碰面對保 3分鐘火速到帳 電話:0960-559161 Line:Money66666",
    "isScam": true,
    "explanation": "詐騙貸款服務，無需碰面",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 0,
      "motivation": 0
    },
    "techScore": 0
  },
  {
    "id": 126,
    "type": "假冒貸款服務",
    "sender": "許經理",
    "content": "搶先登記！盛和租賃優利借，企業、個人長中期皆可借，300萬內2.88%起，專人當日服務放款，不押證件，備支票洽 04-22930223 許經理",
    "isScam": true,
    "explanation": "假冒貸款服務，推銷高額借款",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 0,
      "motivation": 2
    },
    "techScore": 0
  },
  {
    "id": 127,
    "type": "假冒貸款服務",
    "sender": "謝美妮",
    "content": "銀行不斷升息下多比較看看、潔軒經輕鬆借還，500萬資金內，還款彈性免押，當日放款，單一利率3.5%，備支票洽 04-22379380 謝美妮",
    "isScam": true,
    "explanation": "宣稱無需押品及高額貸款的詐騙手段",
    "psychologyScores": {
      "authority": 2,
      "timing": 0,
      "style": 0,
      "motivation": 2
    },
    "techScore": 0
  },
  {
    "id": 128,
    "type": "假冒貸款服務",
    "sender": "莊經理",
    "content": "別讓債務拖垮你【資產理財】專辦銀行借款、整合債務、代償高利、350萬內資金當日到位，利率最低2.8%起，備支票 洽 04-22258008 莊經理",
    "isScam": true,
    "explanation": "以低利率為誘餌，實為詐騙",
    "psychologyScores": {
      "authority": 2,
      "timing": 0,
      "style": 0,
      "motivation": 0
    },
    "techScore": 0
  },
  {
    "id": 129,
    "type": "假冒貸款服務",
    "sender": "周小姐",
    "content": "三大保證！(月息只要2%、可月繳季繳半年繳、撥款迅速) 國泰融資，您的唯一首選，持支客票500萬任您使用。洽：04-23170301 周小姐",
    "isScam": true,
    "explanation": "貸款服務不實，無合法資金來源",
    "psychologyScores": {
      "authority": 2,
      "timing": 0,
      "style": 0,
      "motivation": 0
    },
    "techScore": 0
  },
  {
    "id": 130,
    "type": "假冒貸款服務",
    "sender": "金華租賃劉小姐",
    "content": "【資金週轉不求人】來就借，現撥款、備支票(低利2分) 專辦急件，歡迎正當生意人，30天一期可分期，洽(04)22060906 金華租賃劉小姐",
    "isScam": true,
    "explanation": "宣稱快速撥款，實為詐騙貸款",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 0,
      "motivation": 0
    },
    "techScore": 0
  },
  {
    "id": 131,
    "type": "假冒貸款服務",
    "sender": "吳經理",
    "content": "銀行不能借，我來協助您，首次貸款2成免息，500萬內銀行低率貸款專案，優惠每10萬元，月息2800，歡迎來電 04-22360320 吳經理",
    "isScam": true,
    "explanation": "假冒貸款服務，以低利息為誘餌",
    "psychologyScores": {
      "authority": 2,
      "timing": 0,
      "style": 0,
      "motivation": 2
    },
    "techScore": 0
  },
  {
    "id": 132,
    "type": "假冒貸款服務",
    "sender": "李宜華",
    "content": "即刻$救援，急件300萬內，3hr內撥款，專辦中小企業、個人支票借款，月息2分，彈性還款、業務親辦單線服務，洽 04-23121872 李宜華",
    "isScam": true,
    "explanation": "急件貸款詐騙，無合法基礎",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 0,
      "motivation": 0
    },
    "techScore": 0
  },
  {
    "id": 133,
    "type": "假冒貸款服務",
    "sender": "陳代書",
    "content": "可負擔的月付金解決眼前的錢關，實體店面、正面經營，持支客票只要3%，另有不動產質借、股票代墊、信用借款，歡迎比價 04-23863520 陳代書",
    "isScam": true,
    "explanation": "貸款服務常見詐騙手段，提供低利誘惑",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 0,
      "motivation": 0
    },
    "techScore": 0
  },
  {
    "id": 134,
    "type": "假冒貸款服務",
    "sender": "劉代書",
    "content": "「息」比三家不吃虧，先問再借免緊張！備支票300萬內，榮泰當舖給您【打破行情超低利專案】正派經營、安心借還，速洽 04-22258078 劉代書",
    "isScam": true,
    "explanation": "提供低利貸款，無證據支撐為詐騙",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 0,
      "motivation": 0
    },
    "techScore": 0
  },
  {
    "id": 135,
    "type": "假冒貸款服務",
    "sender": "贏",
    "content": "不看職業1-30萬當天撥款，免保人不照會，條件不佳、無薪轉、瑕疵、更生、警示戶 皆可協助 贏：0984076958 同賴",
    "isScam": true,
    "explanation": "詐騙貸款，提供無責任貸款給有問題的戶",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 0,
      "motivation": 0
    },
    "techScore": 0
  },
  {
    "id": 136,
    "type": "假冒貸款服務",
    "sender": "李專員",
    "content": "低利率方案，有工作就借，無需抵押品、拒高利，審核流程簡單快速，可配合長短期，50萬內當日放款，電洽 0958-716050 李專員，同賴",
    "isScam": true,
    "explanation": "詐騙貸款，無需抵押品",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 0,
      "motivation": 2
    },
    "techScore": 0
  },
  {
    "id": 137,
    "type": "假冒貸款服務",
    "sender": "黃子恩",
    "content": "各大銀行房屋借款、信用借款、汽機車商品借款 企業借款 合法利率 協助您負債繳款協商整合 60萬月付8800速撥 0901413028 黃子恩",
    "isScam": true,
    "explanation": "假冒銀行貸款服務",
    "psychologyScores": {
      "authority": 2,
      "timing": 0,
      "style": 0,
      "motivation": 0
    },
    "techScore": 0
  },
  {
    "id": 138,
    "type": "假冒貸款服務",
    "sender": "陳俊輝",
    "content": "低利率方案，有工作就借，無需抵押品、拒高利，審核流程簡單快速，可配合長短期，50萬內當日放款，電洽 0958-716050 陳俊輝，客服同電話",
    "isScam": true,
    "explanation": "詐騙貸款",
    "psychologyScores": {
      "authority": 2,
      "timing": 0,
      "style": 0,
      "motivation": 2
    },
    "techScore": 0
  },
  {
    "id": 139,
    "type": "假冒貸款服務",
    "sender": "慶富本",
    "content": "在乎您所在的利息【2.8%】低利、彈性償還的資金管道才是您需要的，250萬內備支票當日撥款，免押保，洽 04-22065995 慶富本",
    "isScam": true,
    "explanation": "假冒貸款服務，聲稱低利率提供貸款",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 0,
      "motivation": 0
    },
    "techScore": 0
  },
  {
    "id": 140,
    "type": "假冒交友或戀愛關係",
    "sender": "語聊師",
    "content": "有些話不知找誰說，有些苦只能往肚裡吞，有些情緒不知如何發洩，或許你不知道只要手機直撥5512，百位語聊師在上線上等你傾訴，等你發洩，等你來愛",
    "isScam": true,
    "explanation": "詐騙訊息，利用情感操控提供虛假的語聊服務，誘使受害者撥打電話或支付費用。",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 0,
      "motivation": 0
    },
    "techScore": 0
  },
  {
    "id": 141,
    "type": "假冒貸款服務",
    "sender": "婕希",
    "content": "過年紓困，10萬內來就借息低，保密，免抵押，杜絕詐騙10分鐘火速撥款電話 0928-494964 婕希LineID: aa4964",
    "isScam": true,
    "explanation": "詐騙簡訊，承諾低息貸款並要求聯絡特定電話及Line。",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 0,
      "motivation": 0
    },
    "techScore": 0
  },
  {
    "id": 142,
    "type": "假冒貸款服務",
    "sender": "林小姐",
    "content": "【低利率專案，每萬元月息100】小額週轉，疫情紓困，當日放款，免任何抵押，不必看人臉色，本利償還負擔低，洽0903-184-006林小姐",
    "isScam": true,
    "explanation": "詐騙訊息，利用低利息及疫情紓困為誘餌，未來可能要求支付手續費或借款。",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 0,
      "motivation": 2
    },
    "techScore": 0
  },
  {
    "id": 143,
    "type": "假冒貸款服務",
    "sender": "許經理",
    "content": "搶先登記！盛和租賃優利借，企業、個人長中期皆可借，300萬內2.88%起，專人當日服務放款，不押證件，備支票洽 04-22930223 許經理",
    "isScam": true,
    "explanation": "詐騙訊息，提供不實貸款條件並要求提供證件或銀行資料。",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 0,
      "motivation": 2
    },
    "techScore": 0
  },
  {
    "id": 144,
    "type": "假冒貸款服務",
    "sender": "謝美妮",
    "content": "銀行不斷升息下多比較看看、潔軒經輕鬆借還，500萬資金內，還款彈性免押，當日放款，單一利率3.5%，備支票洽 04-22379380 謝美妮",
    "isScam": true,
    "explanation": "詐騙訊息，利用高額資金及不真實的利率吸引受害者，可能要求提前支付費用。",
    "psychologyScores": {
      "authority": 2,
      "timing": 0,
      "style": 0,
      "motivation": 2
    },
    "techScore": 0
  },
  {
    "id": 145,
    "type": "假冒貸款服務",
    "sender": "莊經理",
    "content": "別讓債務拖垮你【資產理財】專辦銀行借款、整合債務、代償高利、350萬內資金當日到位，利率最低2.8%起，備支票 洽 04-22258008 莊經理",
    "isScam": true,
    "explanation": "詐騙訊息，假冒資產理財服務並提供不真實的資金貸款條件。",
    "psychologyScores": {
      "authority": 2,
      "timing": 0,
      "style": 0,
      "motivation": 0
    },
    "techScore": 0
  },
  {
    "id": 146,
    "type": "假冒貸款服務",
    "sender": "金華租賃劉小姐",
    "content": "【資金週轉不求人】來就借，現撥款、備支票(低利2分) 專辦急件，歡迎正當生意人，30天一期可分期，洽(04)22060906 金華租賃劉小姐",
    "isScam": true,
    "explanation": "詐騙訊息，提供不真實的貸款條件並要求受害者提供支票作為擔保。",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 0,
      "motivation": 0
    },
    "techScore": 0
  },
  {
    "id": 147,
    "type": "假冒貸款服務",
    "sender": "吳經理",
    "content": "銀行不能借，我來協助您，首次貸款2成免息，500萬內銀行低率貸款專案，優惠每10萬元，月息2800，歡迎來電 04-22360320 吳經理",
    "isScam": true,
    "explanation": "詐騙訊息，提供不真實的低利貸款並強調銀行無法借款的情況，誤導受害者。",
    "psychologyScores": {
      "authority": 2,
      "timing": 0,
      "style": 0,
      "motivation": 2
    },
    "techScore": 0
  },
  {
    "id": 148,
    "type": "假冒貸款服務",
    "sender": "李宜華",
    "content": "即刻$救援，急件300萬內，3hr內撥款，專辦中小企業、個人支票借款，月息2分，彈性還款、業務親辦單線服務，洽 04-23121872 李宜華",
    "isScam": true,
    "explanation": "詐騙訊息，提供急件貸款並要求支付高額利息，利用快速撥款作為誘餌。",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 0,
      "motivation": 0
    },
    "techScore": 0
  },
  {
    "id": 149,
    "type": "假冒貸款服務",
    "sender": "陳代書",
    "content": "可負擔的月付金解決眼前的錢關，實體店面、正面經營，持支客票只要3%，另有不動產質借、股票代墊、信用借款，歡迎比價 04-23863520 陳代書",
    "isScam": true,
    "explanation": "詐騙訊息，提供不實的資金借貸條件並要求提供不動產或股票作為擔保。",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 0,
      "motivation": 0
    },
    "techScore": 0
  },
  {
    "id": 150,
    "type": "假冒貸款服務",
    "sender": "劉代書",
    "content": "「息」比三家不吃虧，先問再借免緊張！備支票300萬內，榮泰當舖給您【打破行情超低利專案】正派經營、安心借還，速洽 04-22258078 劉代書",
    "isScam": true,
    "explanation": "詐騙訊息，假冒正派經營的貸款服務，利用低利息吸引受害者並要求提供支票作為擔保。",
    "psychologyScores": {
      "authority": 0,
      "timing": 0,
      "style": 0,
      "motivation": 0
    },
    "techScore": 0
  }
];