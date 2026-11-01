/**
 * Curated High-Resolution Editorial Photography Catalog (Unsplash)
 * Replaces rate-limited pollinations.ai banners with verified, high-quality press photography.
 */

export const EDITORIAL_STOCK_PHOTOS = {
  BUSINESS: [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'
  ],
  SPORTS: [
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1531415074868-036b107e775a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80'
  ],
  POLITICS: [
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1575320181282-9afab399332c?auto=format&fit=crop&w=800&q=80'
  ],
  CRIME: [
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?auto=format&fit=crop&w=800&q=80'
  ],
  FESTIVAL: [
    'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80'
  ],
  DEVELOPMENT: [
    'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'
  ],
  WEATHER: [
    'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=800&q=80'
  ],
  GENERAL: [
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=800&q=80'
  ]
};

/**
 * Resolves a high-res editorial image based on category and headline text.
 * Automatically eliminates any pollinations.ai or broken URL.
 */
export function getEditorialStoryImage(options: {
  topic?: string;
  headline?: string;
  category?: string;
  rawImageUrl?: string;
  slotIndex?: number;
}): string {
  const { topic = '', headline = '', category = '', rawImageUrl = '', slotIndex = 0 } = options;

  // If already a valid high-res non-pollinations URL, keep it
  if (rawImageUrl && rawImageUrl.startsWith('http') && !rawImageUrl.includes('pollinations.ai')) {
    return rawImageUrl;
  }

  const combined = `${topic} ${headline} ${category}`.toLowerCase();

  let pool = EDITORIAL_STOCK_PHOTOS.GENERAL;
  if (/बाजार|शेयर|कारोबार|सेंसेक्स|निफ्टी|व्यापार|बिजनेस|रुपया|बैंक|मार्केट|निवेश|मुनाफा|घाटा|bfsi|उछाल|गिरावट|सोना|चांदी/i.test(combined)) {
    pool = EDITORIAL_STOCK_PHOTOS.BUSINESS;
  } else if (/क्रिकेट|मैच|खेल|खिलाड़ी|टूर्नामेंट|फाइनल|जीत|हॉकी|फुटबॉल|टेनिस/i.test(combined)) {
    pool = EDITORIAL_STOCK_PHOTOS.SPORTS;
  } else if (/चुनाव|सियासत|राजनीति|पार्टी|विधायक|सांसद|सरकार|नेता|विपक्ष|एमएलसी|प्रत्याशी/i.test(combined)) {
    pool = EDITORIAL_STOCK_PHOTOS.POLITICS;
  } else if (/पुलिस|अपराध|गिरफ्तार|हत्या|लूट|हादसा|मौत|वारदात|शव|गोली|जांच|मुकदमा|फरार/i.test(combined)) {
    pool = EDITORIAL_STOCK_PHOTOS.CRIME;
  } else if (/छठ|पूजा|मेला|घाट|गंगा|मंदिर|त्योहार|पर्व|उत्सव|कार्तिक|पूर्णिमा|श्रद्धालु/i.test(combined)) {
    pool = EDITORIAL_STOCK_PHOTOS.FESTIVAL;
  } else if (/पुल|सड़क|मेट्रो|निर्माण|विकास|योजना|स्टेशन|रेलवे|परियोजना|उद्घाटन/i.test(combined)) {
    pool = EDITORIAL_STOCK_PHOTOS.DEVELOPMENT;
  } else if (/मौसम|बारिश|चक्रवात|तूफान|सर्दी|गर्मी|तापमान|मानसून|ओलावृष्टि/i.test(combined)) {
    pool = EDITORIAL_STOCK_PHOTOS.WEATHER;
  }

  return pool[slotIndex % pool.length];
}

