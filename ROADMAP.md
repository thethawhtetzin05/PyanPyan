# ATW Project Roadmap

## Phase 1: Foundation & Database Architecture (အခြေခံစနစ် တည်ဆောက်ခြင်း)
* **Database Design:** Drizzle ORM ကို အသုံးပြုပြီး အောက်ပါ အဓိက Table တွေကို ဖန်တီးပါ။
    * `Chapters` (မူရင်းစာသားများကို သိမ်းရန်)
    * `Translations` (Original Text, AI Translation, Human Edited Text အစရှိသည့် version အလိုက် သိမ်းရန်)
    * `Feedback` (User တွေဆီက Rating, Like, သို့မဟုတ် View count ကို သိမ်းရန်)
* **Status Tracking:** Translation တစ်ခုချင်းစီအတွက် Status တွေကို သတ်မှတ်ပါ (ဥပမာ - `pending`, `ai_translated`, `human_reviewing`, `published`, `verified_for_training`)။

## Phase 2: AI Translation Engine (AI ဖြင့် ကနဦးဘာသာပြန်ခြင်း)
* **Integration:** အသုံးပြုမယ့် Base LLM (သို့မဟုတ် OpenClaw လို ကိုယ်ပိုင် Agent) ကို API ကနေတဆင့် ချိတ်ဆက်ပါ။
* **Automated Workflow:** မူရင်းစာသား အသစ်ရောက်လာတိုင်း AI ဆီပို့ပြီး အကြမ်းဖျင်း ဘာသာပြန်ပါ။ ရလာတဲ့ ရလဒ်ကို Database ထဲမှာ `ai_translated` status နဲ့ သိမ်းဆည်းပါ။

## Phase 3: Editor UI & Reader Portal (လူကိုယ်တိုင် စစ်ဆေးခြင်း နှင့် စာဖတ်သူများအတွက်)
* **Editor Dashboard (`/dashboard`):** Translator တွေ၊ Editor တွေ အလွယ်တကူ ဝင်ရောက်ပြင်ဆင်နိုင်မယ့် UI။ ဘယ်ဘက်မှာ မူရင်းစာ၊ ညာဘက်မှာ AI ဘာသာပြန်ထားတာကို ပြသပြီး Edit လုပ်ခွင့်ပေးထားပါ။
* **Reader Portal (`/` & `/read`):** စာဖတ်သူများအတွက် သီးသန့် Interface။
    * **Home (`/`):** ဝတ္ထုများ စာရင်း (Novel List)။
    * **Reader View (`/read/:id`):** စာဖတ်ရန် သန့်ရှင်းသော UI (No Edit Controls)။
* **Version Control:** လူကိုယ်တိုင် ပြင်ဆင်ပြီးသွားရင် `human_edited` အနေနဲ့ Version အသစ်တစ်ခု ခွဲသိမ်းပါ။
* **Popularity Metrics:** ဖတ်ရှုသူတွေဆီက Feedback ကောက်ပါ။ Chapter တစ်ခုချင်းစီရဲ့ View count, User Rating (Reviews) ကို သိမ်းဆည်းပါ။

## Phase 4: Data Extraction Pipeline (JSON Data ထုတ်ယူခြင်း)
* **Filtering Algorithm:** Drizzle သုံးပြီး Database ထဲကနေ Rating အမြင့်ဆုံး (သို့) သတ်မှတ်ထားတဲ့ Quality Standard နဲ့ ကိုက်ညီတဲ့ `human_edited` စာသားတွေကိုပဲ ရွေးထုတ်မယ့် Query ရေးပါ။
* **Formatting:** ရွေးထုတ်လိုက်တဲ့ Data တွေကို Fine-tuning လုပ်ဖို့ အသင့်ဖြစ်မယ့် Source-Target Pair တွေအဖြစ် ပြောင်းလဲပါ။
    * ဥပမာ Format (JSONL): `{"messages": [{"role": "user", "content": "မူရင်းစာသား"}, {"role": "assistant", "content": "လူတည်းဖြတ်ထားသည့် အရည်အသွေးမြင့် စာသား"}]}`
* **Cron Jobs:** တစ်ပတ်တစ်ခါ (သို့) တစ်လတစ်ခါ ဒီ Script ကို အလိုအလျောက် run ပြီး JSON data တွေ ထုတ်ပေးမယ့် စနစ်။

## Phase 5: AI Fine-Tuning & Feedback Loop (AI ကို ပြန်လည်သင်ကြားပေးခြင်း)
* **Model Training:** ထုတ်ယူရရှိလာတဲ့ JSON data တွေကို အသုံးပြုပြီး Google Cloud လို Platform မျိုးမှာ AI Model ကို Fine-tune လုပ်ပါ။
* **Evaluation & Deployment:** Fine-tune လုပ်ထားတဲ့ Model အသစ်ကို Test လုပ်ပါ။ အရည်အသွေး ပိုကောင်းလာတာ သေချာရင် Phase 2 နေရာမှာ အစားထိုး (Deploy) လုပ်ပြီး Pipeline တစ်ခုလုံးကို ပြန်လည်ပတ်ပါ။
