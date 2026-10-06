import { NewsArticle, FastUpdate, BreakingTickerItem, CategoryTab, WeatherInfo, TrendingTag, WebStory } from '@/types/news';

export const mockWeather: WeatherInfo = {
  city: { en: 'New Delhi' },
  temp: '32°C',
  condition: { en: 'Partly Cloudy' },
  iconName: 'SunCloud'
};

export const mockInFocusPills = [
  { id: 'p1', name: 'Bengal Bypolls', articleId: 'hl-3' },
  { id: 'p2', name: 'Russia Sanctions Bill', articleId: 'hl-1' },
  { id: 'p3', name: "India's 1st Dengue Vaccine", articleId: 'exp-2' },
  { id: 'p4', name: 'DUSU Election Results', articleId: 'sub-1' },
  { id: 'p5', name: 'Mutual Funds Mastery', articleId: 'exp-4' },
  { id: 'p6', name: 'AI Bootcamp', articleId: 'tech-1' },
  { id: 'p7', name: 'Opinion', articleId: 'exp-1' },
  { id: 'p8', name: 'Smart Guide', articleId: 'exp-5' },
  { id: 'p9', name: 'Jagran Reviews', articleId: 'auto-1' }
];

export const mockHeroLeftHeadlines = [
  {
    id: 'hl-1',
    category: 'WORLD',
    title: {
      en: "Donald Trump signs Russia sanctions bill, India among countries at risk of 100% tariffs over oil purchases"
    },
    timeAgo: { en: '1 hour ago' }
  },
  {
    id: 'hl-2',
    category: 'EDUCATION',
    title: {
      en: 'NEET PG 2026 counselling schedule released on mcc.nic.in; check round 1 registration details'
    },
    timeAgo: { en: '2 hours ago' }
  },
  {
    id: 'hl-3',
    category: 'INDIA',
    title: {
      en: 'Mamata Banerjee faces major setback as candidate withdraws nomination ahead of Bengal bypolls'
    },
    timeAgo: { en: '3 hours ago' }
  },
  {
    id: 'hl-4',
    category: 'ENTERTAINMENT',
    title: {
      en: 'Pushpa 2 box office day 15: Allu Arjun starrer crosses ₹1,100 crore worldwide milestone'
    },
    timeAgo: { en: '3 hours ago' }
  },
  {
    id: 'hl-5',
    category: 'BUSINESS',
    title: {
      en: 'Sensex hits fresh record high, surges past 85,000 points on strong foreign fund inflows'
    },
    timeAgo: { en: '4 hours ago' }
  }
];

export const mockHeroLeadArticle: NewsArticle = {
  id: 'lead-bmw',
  title: {
    en: "BMW hits woman crossing road in Delhi, speeding driver detained after high-voltage CCTV probe"
  },
  summary: {
    en: "The incident took place in South Delhi's Greater Kailash area where the speeding luxury vehicle rammed into a pedestrian. Police have impounded the car and registered a case under relevant sections."
  },
  content: {
    en: [
      "The incident took place in South Delhi's Greater Kailash area where the speeding luxury vehicle rammed into a pedestrian. Police have impounded the car and registered a case under relevant sections.",
      "According to preliminary investigations, the driver was overspeeding and failed to brake in time. The victim was rushed to a nearby multi-speciality hospital and is currently under observation.",
      "Police officials confirmed that CCTV cameras across the traffic intersection captured the collision. Forensic experts have inspected the vehicle for mechanical evaluation."
    ]
  },
  category: 'INDIA',
  imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
  imageCaption: {
    en: 'CCTV footage captured the luxury vehicle at high speed in South Delhi'
  },
  publishedAt: '2026-09-20T12:00:00Z',
  timeAgo: { en: '45 mins ago' },
  readTime: { en: '3 min read' },
  author: {
    name: { en: 'Vaidika Thapa' },
    role: { en: 'Senior Staff Correspondent' },
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  },
  isLead: true,
  likesCount: 512,
  viewsCount: 38400
};

export const mockHeroSubLeads: NewsArticle[] = [
  {
    id: 'sub-1',
    title: {
      en: "DUSU Elections 2026: Counting underway as ABVP and NSUI battle for Delhi University President post"
    },
    summary: { en: 'Counting is progressing across colleges with strict security deployment.' },
    category: 'INDIA',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=400&q=80',
    publishedAt: '',
    timeAgo: { en: '1 hour ago' },
    readTime: { en: '2 min read' }
  },
  {
    id: 'sub-2',
    title: {
      en: "Qdenga Dengue Vaccine: India soon to get its first vaccine against mosquito-borne disease"
    },
    summary: { en: 'Drug controller reviews Phase 3 trial clinical safety data.' },
    category: 'HEALTH',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=400&q=80',
    publishedAt: '',
    timeAgo: { en: '2 hours ago' },
    readTime: { en: '3 min read' }
  },
  {
    id: 'sub-3',
    title: {
      en: "ISRO prepares for Chandrayaan-4 mission, to bring lunar surface soil samples back to Earth"
    },
    summary: { en: 'Dual launch architecture approved for return module.' },
    category: 'SCIENCE',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80',
    publishedAt: '',
    timeAgo: { en: '3 hours ago' },
    readTime: { en: '3 min read' }
  },
  {
    id: 'sub-4',
    title: {
      en: "G20 Infrastructure Summit: Global leaders agree on multi-billion dollar green transport corridor"
    },
    summary: { en: 'Landmark summit concludes with international finance declaration.' },
    category: 'WORLD',
    imageUrl: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=400&q=80',
    publishedAt: '',
    timeAgo: { en: '4 hours ago' },
    readTime: { en: '4 min read' }
  }
];

export const mockRightTopNews = [
  {
    id: 'rtn-1',
    rank: 1,
    title: {
      en: 'Mutual Funds vs Fixed Deposits: Where should you invest in 2026 high interest rate market?'
    },
    category: 'BUSINESS'
  },
  {
    id: 'rtn-2',
    rank: 2,
    title: {
      en: 'Ind vs Aus T20 series: BCCI announces 15-member squad, young pacer gets maiden call-up'
    },
    category: 'CRICKET'
  },
  {
    id: 'rtn-3',
    rank: 3,
    title: {
      en: 'Apple iPhone 17 Pro leaks reveal major titanium redesign, under-display Face ID sensors'
    },
    category: 'TECH'
  },
  {
    id: 'rtn-4',
    rank: 4,
    title: {
      en: 'Maruti Suzuki unveils new Swift CNG with 32 km/kg mileage and 6 standard airbags'
    },
    category: 'AUTO'
  },
  {
    id: 'rtn-5',
    rank: 5,
    title: {
      en: 'Weight loss tips: 5 morning drinks that boost metabolism and burn belly fat naturally'
    },
    category: 'LIFESTYLE'
  }
];

export const mockLatestVideos = [
  {
    id: 'lv-1',
    category: 'INFRASTRUCTURE',
    title: {
      en: 'Inside Vande Bharat Sleeper Express: Exclusive first look at luxury cabins and high-speed features'
    },
    duration: '03:15',
    views: '184K',
    timeAgo: { en: '1 hour ago' },
    imageUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1'
  },
  {
    id: 'lv-2',
    category: 'SPACE & TECH',
    title: {
      en: 'ISRO Chandrayaan-4 docking simulation test successfully completed in Sriharikota'
    },
    duration: '02:45',
    views: '240K',
    timeAgo: { en: '2 hours ago' },
    imageUrl: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.youtube-nocookie.com/embed/L_LUpnjgPso?autoplay=1'
  },
  {
    id: 'lv-3',
    category: 'CRICKET',
    title: {
      en: 'Rohit Sharma press conference: Opening batsman clarifies T20 roadmap ahead of Champions Trophy'
    },
    duration: '04:10',
    views: '95K',
    timeAgo: { en: '3 hours ago' },
    imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1'
  },
  {
    id: 'lv-4',
    category: 'AUTO',
    title: {
      en: 'Tesla Cybertruck test drive on Mumbai-Pune Expressway: Real world range and autopilot review'
    },
    duration: '01:50',
    views: '150K',
    timeAgo: { en: '4 hours ago' },
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.youtube-nocookie.com/embed/L_LUpnjgPso?autoplay=1'
  },
  {
    id: 'lv-5',
    category: 'DEFENCE',
    title: {
      en: 'Tejas Mark 2 fighter jet engine trials completed: Watch live takeoff demonstration'
    },
    duration: '03:40',
    views: '310K',
    timeAgo: { en: '5 hours ago' },
    imageUrl: 'https://images.unsplash.com/photo-1519074069444-1ba4eff56022?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1'
  },
  {
    id: 'lv-6',
    category: 'WORLD',
    title: {
      en: 'G20 Summit 2026: World leaders sign historic green energy transport corridor agreement'
    },
    duration: '05:12',
    views: '88K',
    timeAgo: { en: '6 hours ago' },
    imageUrl: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.youtube-nocookie.com/embed/L_LUpnjgPso?autoplay=1'
  },
  {
    id: 'lv-7',
    category: 'ENTERTAINMENT',
    title: {
      en: 'Pushpa 2 success party: Allu Arjun and Rashmika Mandanna celebrate ₹1,100 crore milestone'
    },
    duration: '02:30',
    views: '420K',
    timeAgo: { en: '7 hours ago' },
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1'
  },
  {
    id: 'lv-8',
    category: 'BUSINESS',
    title: {
      en: 'BSE Sensex crosses 85,000 points: Stock market experts explain top investment strategies'
    },
    duration: '04:05',
    views: '112K',
    timeAgo: { en: '8 hours ago' },
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.youtube-nocookie.com/embed/L_LUpnjgPso?autoplay=1'
  }
];

// Entertainment Section Data
export const mockEntertainmentLead = {
  id: 'ent-lead',
  category: 'BOLLYWOOD',
  title: {
    en: "Karan Johar addresses Bollywood box office slump, urges filmmakers to focus on emotional storytelling over star fees"
  },
  imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
  timeAgo: { en: '2 hours ago' }
};
export const mockEntertainmentGrid = [
  {
    id: 'ent-1',
    category: 'MOVIES',
    title: {
      en: 'Singham Again teaser launch date confirmed: Ajay Devgn, Deepika Padukone ready for explosive Diwali clash'
    },
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'ent-2',
    category: 'HOLLYWOOD',
    title: {
      en: 'Avatar 3 title officially announced by James Cameron: Fire and Ash to hit global theatres in December'
    },
    imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'ent-3',
    category: 'OTT',
    title: {
      en: 'Mirzapur Season 4 release timeline revealed by makers, Pankaj Tripathi returns as Kaleen Bhaiya'
    },
    imageUrl: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'ent-4',
    category: 'CELEBS',
    title: {
      en: 'Shah Rukh Khan undergoes minor surgery in US for eye treatment, returns safely to Mumbai'
    },
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
  }
];

// World Section (4 Cards)
export const mockWorldCards = [
  {
    id: 'w-1',
    category: 'US POLITICS',
    title: {
      en: 'US Presidential Race 2026: Key battleground states swing unpredictably as early voting kicks off'
    },
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80',
    timeAgo: { en: '2 hours ago' }
  },
  {
    id: 'w-2',
    category: 'MIDDLE EAST',
    title: {
      en: 'Ceasefire talks resume in Cairo as international mediators push for immediate humanitarian corridor'
    },
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
    timeAgo: { en: '3 hours ago' }
  },
  {
    id: 'w-3',
    category: 'EUROPE',
    title: {
      en: 'UK introduces stricter visa regulations for international graduates, minimum salary thresholds raised'
    },
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80',
    timeAgo: { en: '4 hours ago' }
  },
  {
    id: 'w-4',
    category: 'ASIA PACIFIC',
    title: {
      en: 'Japan and South Korea sign historic semiconductor trade pact to protect supply chains against disruptions'
    },
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80',
    timeAgo: { en: '5 hours ago' }
  }
];

// Explainer Section (6 White Cards)
export const mockExplainerCards = [
  {
    id: 'exp-1',
    category: 'GEOPOLITICS',
    title: {
      en: 'Why is US imposing 100% tariffs on countries buying Russian crude oil? Lindsey Graham Act explained'
    },
    summary: {
      en: 'Detailed breakdown of the new US bill, oil purchase exemptions, and impact on India’s economy.'
    },
    content: {
      en: [
        "US President Donald Trump has signed a far-reaching sanctions bill targeting nations purchasing Russian crude oil. The legislation includes strict secondary tariffs that could impact Indian refineries.",
        "Diplomatic channels between Washington and New Delhi are negotiating potential waiver mechanisms for long-term energy contracts.",
        "Global oil benchmarks fluctuated following the announcement as market analysts assess supply chain adjustments and strategic petroleum reserve releases."
      ]
    },
    readTime: { en: '5 min read' },
    imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=600&q=80',
    author: {
      name: { en: 'Dr. Arvind Subramanian' },
      role: { en: 'Global Geopolitics Analyst' },
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
    }
  },
  {
    id: 'exp-2',
    category: 'HEALTH & MEDICINE',
    title: {
      en: 'How does India’s first dengue vaccine Qdenga work and who should get vaccinated first?'
    },
    summary: {
      en: 'Efficacy results, dosage guidelines, phase-3 trial data, and launch timeline in India.'
    },
    content: {
      en: [
        "The Drugs Controller General of India (DCGI) has evaluated clinical trials for Qdenga, India's first approved tetravalent dengue vaccine.",
        "The vaccine uses an attenuated dengue virus backbone engineered to provide immunity against all four serotypes of the viral infection.",
        "Health authorities recommend prioritizing high-transmission urban zones and pediatric age groups following national immunization guidelines."
      ]
    },
    readTime: { en: '4 min read' },
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
    author: {
      name: { en: 'Dr. Ritu Verma' },
      role: { en: 'Epidemiologist & Health Correspondent' },
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'
    }
  },
  {
    id: 'exp-3',
    category: 'ENVIRONMENT',
    title: {
      en: 'What is GRAP-3 in Delhi-NCR? Full list of banned construction activities and vehicle restrictions'
    },
    summary: {
      en: 'Stage-3 restrictions explained: What stays open, diesel truck bans, and GRAP protocols.'
    },
    content: {
      en: [
        "The Commission for Air Quality Management (CAQM) enforced Stage-3 Graded Response Action Plan (GRAP-3) across Delhi-NCR following a sharp drop in air quality index.",
        "Under Stage 3, all non-essential construction and demolition activities are strictly prohibited, alongside restrictions on BS-III petrol and BS-IV diesel light motor vehicles.",
        "Schools up to primary classes are directed to switch to online learning modes to prevent prolonged exposure to hazardous particulate matter."
      ]
    },
    readTime: { en: '3 min read' },
    imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80',
    author: {
      name: { en: 'Sunita Narain' },
      role: { en: 'Environmental Policy Analyst' },
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    }
  },
  {
    id: 'exp-4',
    category: 'PERSONAL FINANCE',
    title: {
      en: 'Understanding Mutual Fund SIP step-up strategy: How investing 10% extra every year multiplies your wealth'
    },
    summary: {
      en: 'Compounding math, inflation protection, and real returns comparison for long-term wealth building.'
    },
    content: {
      en: [
        "A step-up Systematic Investment Plan (SIP) allows investors to automatically increase their monthly contribution by a fixed percentage or amount every year.",
        "By aligning annual SIP increases with expected salary hikes (e.g. 10% annual bump), compounding accelerated returns beat inflation significantly over a 15-20 year horizon.",
        "Financial planners demonstrate how a ₹10,000 monthly SIP with a 10% step-up generates over double the corpus compared to a flat SIP."
      ]
    },
    readTime: { en: '6 min read' },
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
    author: {
      name: { en: 'Vikram Mehta' },
      role: { en: 'Certified Financial Planner' },
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80'
    }
  },
  {
    id: 'exp-5',
    category: 'ECONOMY & TAX',
    title: {
      en: 'New Income Tax Regime vs Old Regime 2026: Tax slabs, deductions, and calculator guide'
    },
    summary: {
      en: 'Complete tax planning breakdown: Section 80C exemptions, standard deductions, and net tax savings.'
    },
    content: {
      en: [
        "Choosing between the New Tax Regime and Old Tax Regime depends heavily on your total gross income and deductible investments under Section 80C, 80D, and HRA.",
        "The default New Tax Regime offers lower tax rates across expanded income slabs up to ₹7 lakh tax-free income limit for salaried employees.",
        "Tax consultants recommend computing tax liability under both models before submitting investment declarations to your employer."
      ]
    },
    readTime: { en: '5 min read' },
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    author: {
      name: { en: 'Anil Agarwal' },
      role: { en: 'Senior Tax Advisor' },
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    }
  },
  {
    id: 'exp-6',
    category: 'ARTIFICIAL INTELLIGENCE',
    title: {
      en: 'Generative AI and Copyright Law: How courts are treating AI-created music, art, and text'
    },
    summary: {
      en: 'Intellectual property rights explained in the age of LLMs, training data fair use, and creator royalties.'
    },
    content: {
      en: [
        "Courts worldwide are grappling with whether content created purely by Generative AI algorithms qualifies for copyright protection without human authorship.",
        "Major lawsuits by authors, music labels, and news publishers argue that scraping copyrighted text for model training violates fair use doctrines.",
        "Legal experts predict new licensing frameworks where tech firms will pay recurring royalties to artists and digital media houses."
      ]
    },
    readTime: { en: '6 min read' },
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=600&q=80',
    author: {
      name: { en: 'Priya Iyer' },
      role: { en: 'Tech Policy & IP Law Analyst' },
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'
    }
  }
];

// Cricket Section Data
export const mockCricketLead = {
  id: 'cric-lead',
  category: 'MATCH REPORT',
  title: {
    en: "India vs Australia 5th T20I: Arshdeep Singh's 4-wicket haul helps India clinch thrilling series 4-1"
  },
  imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
  timeAgo: { en: '3 hours ago' }
};
export const mockCricketGrid = [
  {
    id: 'cric-1',
    category: 'IPL 2026',
    title: {
      en: 'IPL 2026 mega auction retention rules finalized: Teams allowed up to 6 players with RTM option'
    },
    imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'cric-2',
    category: 'ICC RANKINGS',
    title: {
      en: 'Jasprit Bumrah reclaims No. 1 spot in ICC Men’s Test Bowling Rankings after sensational spell'
    },
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'cric-3',
    category: 'WOMENS CRICKET',
    title: {
      en: 'Smriti Mandhana smashes fastest century in Women’s ODI cricket history against England'
    },
    imageUrl: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'cric-4',
    category: 'CHAMPIONS TROPHY',
    title: {
      en: 'Hybrid model finalized for 2026 Champions Trophy; India matches scheduled in Dubai'
    },
    imageUrl: 'https://images.unsplash.com/photo-1512719355433-e029c72e2cf5?auto=format&fit=crop&w=400&q=80'
  }
];

// Lifestyle Section (4 Cards)
export const mockLifestyleCards = [
  {
    id: 'life-1',
    category: 'HEALTH',
    title: {
      en: 'Intermittent fasting benefits: Why 16:8 schedule works best for reversing insulin resistance'
    },
    imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80',
    timeAgo: { en: '2 hours ago' }
  },
  {
    id: 'life-2',
    category: 'TRAVEL',
    title: {
      en: 'Top 7 serene offbeat hill stations in Himachal and Uttarakhand to escape autumn tourist rush'
    },
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
    timeAgo: { en: '4 hours ago' }
  },
  {
    id: 'life-3',
    category: 'FASHION',
    title: {
      en: 'Festive season ethnic wear trends: Sustainable handloom silk and pastel kurtas take center stage'
    },
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
    timeAgo: { en: '5 hours ago' }
  },
  {
    id: 'life-4',
    category: 'WELLNESS',
    title: {
      en: '5 ancient Ayurvedic herbs proven by modern science to boost memory and reduce stress'
    },
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
    timeAgo: { en: '6 hours ago' }
  }
];

// Auto Section (4 Cards)
export const mockAutoCards = [
  {
    id: 'auto-1',
    category: 'ELECTRIC CARS',
    title: {
      en: 'Tata Curvv EV real-world range test: Does it really deliver 500 km on single highway charge?'
    },
    imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80',
    timeAgo: { en: '1 hour ago' }
  },
  {
    id: 'auto-2',
    category: 'NEW LAUNCH',
    title: {
      en: 'Mahindra Thar Roxx 5-door bookings open: Waiting period shoots up to 9 months for diesel automatic'
    },
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
    timeAgo: { en: '3 hours ago' }
  },
  {
    id: 'auto-3',
    category: 'BIKES',
    title: {
      en: 'Royal Enfield Classic 650 twin spotted testing without camouflage, India launch expected at Motoverse'
    },
    imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80',
    timeAgo: { en: '4 hours ago' }
  },
  {
    id: 'auto-4',
    category: 'SAFETY',
    title: {
      en: 'Bharat NCAP crash tests 5 popular budget family hatchbacks: Check complete safety star ratings'
    },
    imageUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80',
    timeAgo: { en: '5 hours ago' }
  }
];

// Horoscope Section (12 Zodiac Signs)
export const mockHoroscopeSigns = [
  { name: 'ARIES', date: 'MAR 21 - APR 19', icon: '♈', color: 'from-red-500 to-rose-600' },
  { name: 'TAURUS', date: 'APR 20 - MAY 20', icon: '♉', color: 'from-amber-500 to-orange-600' },
  { name: 'GEMINI', date: 'MAY 21 - JUN 21', icon: '♊', color: 'from-yellow-500 to-amber-600' },
  { name: 'CANCER', date: 'JUN 21 - JUL 22', icon: '♋', color: 'from-emerald-500 to-teal-600' },
  { name: 'LEO', date: 'JUL 23 - AUG 22', icon: '♌', color: 'from-orange-500 to-red-600' },
  { name: 'VIRGO', date: 'AUG 23 - SEP 22', icon: '♍', color: 'from-teal-500 to-cyan-600' },
  { name: 'LIBRA', date: 'SEP 23 - OCT 22', icon: '♎', color: 'from-blue-500 to-indigo-600' },
  { name: 'SCORPIO', date: 'OCT 23 - NOV 21', icon: '♏', color: 'from-purple-500 to-pink-600' },
  { name: 'SAGITTARIUS', date: 'NOV 22 - DEC 21', icon: '♐', color: 'from-indigo-500 to-purple-600' },
  { name: 'CAPRICORN', date: 'DEC 22 - JAN 19', icon: '♑', color: 'from-slate-600 to-slate-800' },
  { name: 'AQUARIUS', date: 'JAN 20 - FEB 18', icon: '♒', color: 'from-cyan-500 to-blue-600' },
  { name: 'PISCES', date: 'FEB 19 - MAR 20', icon: '♓', color: 'from-violet-500 to-fuchsia-600' }
];

// Technology Section (4 Cards)
export const mockTechCards = [
  {
    id: 'tech-1',
    category: 'AI TECH',
    title: {
      en: 'OpenAI releases new o1 reasoning models for all users: How it solves complex PhD-level math and coding'
    },
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    timeAgo: { en: '2 hours ago' }
  },
  {
    id: 'tech-2',
    category: 'GADGETS',
    title: {
      en: 'Samsung Galaxy S25 Ultra dummy units reveal rounded corners and ultra-slim bezels'
    },
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
    timeAgo: { en: '3 hours ago' }
  },
  {
    id: 'tech-3',
    category: 'CYBERSECURITY',
    title: {
      en: 'Government warns Android users against new malware stealing banking OTPs through fake utility apps'
    },
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',
    timeAgo: { en: '4 hours ago' }
  },
  {
    id: 'tech-4',
    category: 'HARDWARE',
    title: {
      en: 'Nvidia RTX 5090 Blackwell GPU launch expected in January: Massive 32GB GDDR7 VRAM confirmed'
    },
    imageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80',
    timeAgo: { en: '5 hours ago' }
  }
];

// Education Section Data
export const mockEducationLead = {
  id: 'edu-lead',
  category: 'EXAM UPDATES',
  title: {
    en: "UPSC Civil Services Mains Exam 2026 begins today: Check dress code, exam hall guidelines, and reporting timings"
  },
  imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
  timeAgo: { en: '1 hour ago' }
};
export const mockEducationGrid = [
  {
    id: 'edu-1',
    category: 'SCHOLARSHIPS',
    title: {
      en: 'National Means-cum-Merit Scholarship (NMMSS) registration deadline extended till October 15'
    },
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'edu-2',
    category: 'BOARD EXAMS',
    title: {
      en: 'CBSE issues advisory on 75% attendance rule for Class 10 and 12 board exams 2026'
    },
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'edu-3',
    category: 'HIGHER ED',
    title: {
      en: 'IIT Madras introduces new online B.Tech program in Artificial Intelligence for working professionals'
    },
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'edu-4',
    category: 'CAREERS',
    title: {
      en: 'Top 5 high-paying tech careers in 2026 that do not require computer science engineering degree'
    },
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80'
  }
];

// Business Section (4 Cards)
export const mockBusinessCards = [
  {
    id: 'biz-1',
    category: 'STOCK MARKET',
    title: {
      en: 'FIIs pump ₹4,500 crore into Indian equities in single trading session as global central banks cut rates'
    },
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80',
    timeAgo: { en: '2 hours ago' }
  },
  {
    id: 'biz-2',
    category: 'IPO WATCH',
    title: {
      en: 'Hyundai Motor India IPO opens next week: Price band fixed at ₹1,865-1,960; should you subscribe?'
    },
    imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=600&q=80',
    timeAgo: { en: '3 hours ago' }
  },
  {
    id: 'biz-3',
    category: 'REAL ESTATE',
    title: {
      en: 'NCR luxury home sales jump 40% in Q3; Gurugram and Noida see record price appreciation'
    },
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80',
    timeAgo: { en: '4 hours ago' }
  },
  {
    id: 'biz-4',
    category: 'BANKING',
    title: {
      en: 'RBI clarifies new UPI transaction limits for hospital and educational payments up to ₹5 lakh'
    },
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
    timeAgo: { en: '5 hours ago' }
  }
];

// You May Like (Curated Articles)
export const mockYouMayLike = [
  {
    id: 'yml-1',
    title: {
      en: 'Thinking about retirement in your 40s? Here is how much corpus you actually need'
    },
    source: 'Jagran Money',
    imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'yml-2',
    title: {
      en: 'Top 10 scenic road trips in South India that every traveler must experience once'
    },
    source: 'Jagran Travel',
    imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'yml-3',
    title: {
      en: 'Simple lifestyle habits of people who never get sick according to doctors'
    },
    source: 'Only My Health',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400&q=80'
  }
];

// Opinion Section
export const mockOpinionArticles: NewsArticle[] = [
  {
    id: 'op-1',
    title: {
      en: 'Perspective: Can India Become the Global Capital of Technological Innovation in the 21st Century?'
    },
    summary: {
      en: 'Our national focus must shift from service delivery to indigenous patents and core fundamental science.'
    },
    category: 'Editorial',
    imageUrl: '',
    publishedAt: '',
    timeAgo: { en: 'Today' },
    readTime: { en: '6 min read' },
    author: {
      name: { en: 'Dr. Arvind Subramanian' },
      role: { en: 'Senior Economist & Author' },
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
    }
  },
  {
    id: 'op-2',
    title: {
      en: 'Climate Change & Indian Agriculture: The Urgent Need for Climate-Resistant Hybrid Seeds'
    },
    summary: {
      en: 'Amid erratic monsoon patterns, supplying sustainable agritech to farmers is non-negotiable.'
    },
    category: 'Analysis',
    imageUrl: '',
    publishedAt: '',
    timeAgo: { en: 'Today' },
    readTime: { en: '5 min read' },
    author: {
      name: { en: 'Sunita Narain' },
      role: { en: 'Environmental Policy Analyst' },
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'
    }
  }
];

// Web Stories
export const mockWebStories: WebStory[] = [
  {
    id: 'ws-1',
    title: { en: 'Chandrayaan-4: Complete Master Plan for Lunar Sample Return' },
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    slidesCount: 6,
    category: 'Space'
  },
  {
    id: 'ws-2',
    title: { en: 'Indias 5 New Semiconductor Plants: Locations and Fabrication Details' },
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    slidesCount: 5,
    category: 'Tech'
  },
  {
    id: 'ws-3',
    title: { en: 'Vande Bharat Sleeper Express: 10 Luxury Features That Will Amaze You' },
    imageUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=600&q=80',
    slidesCount: 7,
    category: 'Infra'
  },
  {
    id: 'ws-4',
    title: { en: 'Asia Cup 2026: Top 5 X-Factor Players in Team India' },
    imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80',
    slidesCount: 5,
    category: 'Sports'
  }
];

export const mockBreakingTicker: BreakingTickerItem[] = [
  {
    id: 'bt-1',
    headline: {
      en: 'ISRO successfully launches new Navigation Satellite, a landmark milestone for India in space'
    },
    category: 'Science',
    articleId: 'lead-bmw',
    isLive: true
  },
  {
    id: 'bt-2',
    headline: {
      en: 'G20 Summit: Global leaders agree on digital economy and infrastructure framework'
    },
    category: 'World',
    articleId: 'w-1',
    isLive: false
  },
  {
    id: 'bt-3',
    headline: {
      en: 'Stock Market hits record high, Sensex crosses 85,000 points'
    },
    category: 'Business',
    articleId: 'biz-1',
    isLive: false
  }
];

export const mockCategoryTabs: CategoryTab[] = [
  { id: 'cat-all', label: { en: 'HOME' }, slug: 'all' },
  { id: 'cat-latest', label: { en: 'LATEST NEWS' }, slug: 'latest' },
  { id: 'cat-india', label: { en: 'INDIA' }, slug: 'india' },
  { id: 'cat-world', label: { en: 'WORLD' }, slug: 'world' },
  { id: 'cat-ent', label: { en: 'ENTERTAINMENT' }, slug: 'entertainment' },
  { id: 'cat-life', label: { en: 'LIFESTYLE' }, slug: 'lifestyle' },
  { id: 'cat-biz', label: { en: 'BUSINESS' }, slug: 'business' },
  { id: 'cat-edu', label: { en: 'EDUCATION' }, slug: 'education' },
  { id: 'cat-cric', label: { en: 'CRICKET' }, slug: 'cricket' },
  { id: 'cat-tech', label: { en: 'TECH' }, slug: 'tech' },
  { id: 'cat-sports', label: { en: 'SPORTS' }, slug: 'sports' },
  { id: 'cat-auto', label: { en: 'AUTO' }, slug: 'auto' },
  { id: 'cat-spiritual', label: { en: 'SPIRITUAL' }, slug: 'spiritual' },
  { id: 'cat-horoscope', label: { en: 'HOROSCOPE' }, slug: 'horoscope' }
];

export const mockTopNewsSidebar = [
  {
    id: 'top-1',
    rank: 1,
    title: {
      en: '18% GST On UPI MDR, Burden On Consumer, Back To Cash Economy: Key Concerns And Finance Ministry\'s Plans'
    }
  },
  {
    id: 'top-2',
    rank: 2,
    title: {
      en: "'Illegal Decision': Noel Tata Disapproves Chandrasekaran's Reappointment In New Twist To Tata Sons' Leadership Woes"
    }
  },
  {
    id: 'top-3',
    rank: 3,
    title: {
      en: 'Gurugram Hit-And-Run Case: Driver Kalyan Bainsla, Other Companions Were Drunk And Returning From Party, SIT Reveals'
    }
  },
  {
    id: 'top-4',
    rank: 4,
    title: {
      en: "'No Specific Proposal Was Discussed': Karnataka CM Rejects Speculation On Cabinet Expansion"
    }
  },
  {
    id: 'top-5',
    rank: 5,
    title: {
      en: 'Bengal Bypolls 2026: High Security Deployment Across 6 Constituencies As Voting Begins'
    }
  }
];

export const mockLatestPageArticles: NewsArticle[] = [
  {
    id: 'lat-1',
    title: {
      en: "Pakistan's Crackdown On Family Of 'Cricket Legend' And Ex-PM Imran Draws Global Ire After His Sister Arrested In Lahore"
    },
    summary: {
      en: "International human rights monitors and diplomatic missions express deep concern following the high-profile arrest in Lahore amidst ongoing political tensions."
    },
    category: 'WORLD',
    imageUrl: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T09:21:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 09:21 AM (IST)' },
    readTime: { en: '3 min read' }
  },
  {
    id: 'lat-2',
    title: {
      en: "Rain Hammers Keralam: Several Dead In Flash Floods, Landslides; 6 Districts On Alert For Heavy Showers"
    },
    summary: {
      en: "Torrential downpours trigger severe landslides and urban inundation in several high-range areas as emergency rescue teams are deployed."
    },
    category: 'NATIONAL',
    imageUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T09:19:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 09:19 AM (IST)' },
    readTime: { en: '4 min read' }
  },
  {
    id: 'lat-3',
    title: {
      en: "'No Specific Proposal Was Discussed': Karnataka CM Rejects Speculation On Cabinet Expansion"
    },
    summary: {
      en: "Chief Minister clarifies standing after high-level consultative meetings in New Delhi with senior party leaders."
    },
    category: 'POLITICS',
    imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T09:15:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 09:15 AM (IST)' },
    readTime: { en: '2 min read' }
  },
  {
    id: 'lat-4',
    title: {
      en: "Sensex Surges 450 Points In Early Trade; Nifty Crosses Historic 26,000 Mark Driven By IT & Tech Stocks"
    },
    summary: {
      en: "Indian equity benchmark indices scale new record highs supported by strong foreign institutional inflows and positive global cues."
    },
    category: 'BUSINESS',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T09:05:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 09:05 AM (IST)' },
    readTime: { en: '3 min read' }
  },
  {
    id: 'lat-5',
    title: {
      en: "DUSU Elections 2026: Counting Underway Across Campuses As ABVP & NSUI Battle For Top Student Posts"
    },
    summary: {
      en: "Tight security personnel deployed around North Campus counting centers as round-by-round tally updates are released."
    },
    category: 'EDUCATION',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T08:50:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 08:50 AM (IST)' },
    readTime: { en: '2 min read' }
  },
  {
    id: 'lat-6',
    title: {
      en: "US President Signs Legislation Impacting Global Energy Crude Purchases; Bilateral Talks Underway"
    },
    summary: {
      en: "Diplomatic negotiations continue to mitigate potential tariff fallout on key strategic partner nations."
    },
    category: 'WORLD',
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T08:30:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 08:30 AM (IST)' },
    readTime: { en: '4 min read' }
  },
  {
    id: 'lat-7',
    title: {
      en: "Apple Unveils M4 Powered MacBook Pro Lineup With Liquid Retina XDR Display And Advanced AI Engine"
    },
    summary: {
      en: "New hardware architecture promises unprecedented battery efficiency and on-device machine learning capabilities."
    },
    category: 'TECH',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T08:15:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 08:15 AM (IST)' },
    readTime: { en: '3 min read' }
  },
  {
    id: 'lat-8',
    title: {
      en: "India vs Australia Test Series 2026: Jasprit Bumrah Named Captain For Opening Encounter At Perth"
    },
    summary: {
      en: "BCCI confirms squad composition with key pace bowling rotations ahead of the highly anticipated Border-Gavaskar Trophy."
    },
    category: 'CRICKET',
    imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T08:00:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 08:00 AM (IST)' },
    readTime: { en: '3 min read' }
  },
  {
    id: 'lat-9',
    title: {
      en: "RBI Keeps Repo Rate Unchanged At 6.5%; Projects GDP Growth Rate At 7.2% For FY26"
    },
    summary: {
      en: "Monetary Policy Committee maintains calibrated stance to align headline inflation with medium-term target."
    },
    category: 'BUSINESS',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T07:45:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 07:45 AM (IST)' },
    readTime: { en: '4 min read' }
  },
  {
    id: 'lat-10',
    title: {
      en: "Chandrayaan-4 Launch Date Announced: ISRO Mission To Bring Back Lunar Samples In Dual Rocket Architecture"
    },
    summary: {
      en: "Space agency finalizes technical reviews for the complex lunar return sample landing operation."
    },
    category: 'SCIENCE',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T07:30:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 07:30 AM (IST)' },
    readTime: { en: '3 min read' }
  },
  {
    id: 'lat-11',
    title: {
      en: "Gurugram Expressway Traffic Advisory: Diversions Planned For Elevated Corridor Construction Work"
    },
    summary: {
      en: "Traffic police issue route guidelines for daily commuters traveling between Delhi and Millennium City."
    },
    category: 'CITY',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T07:15:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 07:15 AM (IST)' },
    readTime: { en: '2 min read' }
  },
  {
    id: 'lat-12',
    title: {
      en: "Stree 2 Box Office Record: Rajkummar Rao & Shraddha Kapoor Starrer Crosses ₹600 Crore Domestic Net Collection"
    },
    summary: {
      en: "Supernatural comedy thriller maintains strong theatrical hold across single screens and multiplex chains."
    },
    category: 'BOLLYWOOD',
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T07:00:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 07:00 AM (IST)' },
    readTime: { en: '3 min read' }
  },
  {
    id: 'lat-13',
    title: {
      en: "NITI Aayog Releases State Energy Index: Gujarat Tops Overall Rankings Followed By Kerala And Punjab"
    },
    summary: {
      en: "Annual report evaluates clean energy adoption, grid reliability, and DISCOM operational efficiency."
    },
    category: 'ECONOMY',
    imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T06:45:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 06:45 AM (IST)' },
    readTime: { en: '4 min read' }
  },
  {
    id: 'lat-14',
    title: {
      en: "WHO Issues Global Health Warning On New Avian Flu Strain Subtype Detected In North America"
    },
    summary: {
      en: "Surveillance protocols enhanced across international airports as health agencies monitor transmission vectors."
    },
    category: 'HEALTH',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T06:30:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 06:30 AM (IST)' },
    readTime: { en: '3 min read' }
  },
  {
    id: 'lat-15',
    title: {
      en: "Tesla Formally Submits EV Manufacturing Proposal To Ministry Of Heavy Industries For India Plant"
    },
    summary: {
      en: "Electric automaker seeks phased local sourcing exemptions under newly notified EV capital policy."
    },
    category: 'AUTO',
    imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T06:15:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 06:15 AM (IST)' },
    readTime: { en: '3 min read' }
  },
  {
    id: 'lat-16',
    title: {
      en: "G20 Digital Economy Working Group Concludes Summit With Declaration On Ethical AI Governance"
    },
    summary: {
      en: "Member nations agree on baseline principles for algorithmic transparency and cross-border data flows."
    },
    category: 'WORLD',
    imageUrl: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T06:00:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 06:00 AM (IST)' },
    readTime: { en: '4 min read' }
  },
  {
    id: 'lat-17',
    title: {
      en: "NEET UG 2026 Application Portal To Close Midnight Tonight: Step-By-Step Checklist For Aspirants"
    },
    summary: {
      en: "NTA advises candidates to verify payment confirmation slips and scanned document uploads before portal freeze."
    },
    category: 'EDUCATION',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T05:45:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 05:45 AM (IST)' },
    readTime: { en: '2 min read' }
  },
  {
    id: 'lat-18',
    title: {
      en: "Supreme Court Directs High Courts To Expedite Pendency Of Criminal Appeals Older Than 10 Years"
    },
    summary: {
      en: "Bench mandates special Saturday sittings and digital case management systems to reduce judicial backlog."
    },
    category: 'LAW',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T05:30:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 05:30 AM (IST)' },
    readTime: { en: '3 min read' }
  },
  {
    id: 'lat-19',
    title: {
      en: "Gold Prices Surge To New High Of ₹78,500 Per 10 Grams Amid Global Geopolitical Uncertainty"
    },
    summary: {
      en: "Bullion traders attribute price surge to central bank accumulation and safe-haven buying."
    },
    category: 'MARKETS',
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T05:15:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 05:15 AM (IST)' },
    readTime: { en: '2 min read' }
  },
  {
    id: 'lat-20',
    title: {
      en: "Indian Railways Announces 500 Special Festival Trains For Upcoming Dussehra And Diwali Rush"
    },
    summary: {
      en: "Additional passenger coaches to be attached on high-demand routes connecting major metro hubs to Eastern states."
    },
    category: 'NATIONAL',
    imageUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T05:00:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 05:00 AM (IST)' },
    readTime: { en: '3 min read' }
  }
];

export const mockIndiaPageArticles: NewsArticle[] = [
  {
    id: 'ind-1',
    title: {
      en: "Rain Hammers Keralam: Several Dead In Flash Floods, Landslides; 6 Districts On Alert For Heavy Showers"
    },
    summary: {
      en: "Torrential downpours trigger severe landslides and urban inundation in several high-range areas as emergency rescue teams are deployed."
    },
    category: 'INDIA',
    imageUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T09:19:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 09:19 AM (IST)' },
    readTime: { en: '4 min read' }
  },
  {
    id: 'ind-2',
    title: {
      en: "'No Specific Proposal Was Discussed': Karnataka CM Rejects Speculation On Cabinet Expansion"
    },
    summary: {
      en: "Chief Minister clarifies standing after high-level consultative meetings in New Delhi with senior party leaders."
    },
    category: 'POLITICS',
    imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T09:15:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 09:15 AM (IST)' },
    readTime: { en: '2 min read' }
  },
  {
    id: 'ind-3',
    title: {
      en: "DUSU Elections 2026: Counting Underway Across Campuses As ABVP & NSUI Battle For Top Student Posts"
    },
    summary: {
      en: "Tight security personnel deployed around North Campus counting centers as round-by-round tally updates are released."
    },
    category: 'EDUCATION',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T08:50:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 08:50 AM (IST)' },
    readTime: { en: '2 min read' }
  },
  {
    id: 'ind-4',
    title: {
      en: "Bengal Bypolls 2026: High Security Deployment Across 6 Constituencies As Voting Begins"
    },
    summary: {
      en: "Voting progresses peacefully across key assembly seats with heavy central paramilitary forces monitoring polling booths."
    },
    category: 'POLITICS',
    imageUrl: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T08:35:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 08:35 AM (IST)' },
    readTime: { en: '3 min read' }
  },
  {
    id: 'ind-5',
    title: {
      en: "NEET PG 2026 Counselling Registration Window Opens Today At mcc.nic.in; Check Guidelines"
    },
    summary: {
      en: "Medical Counselling Committee initiates all-India quota registration process for post-graduate medical admissions."
    },
    category: 'EDUCATION',
    imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T08:20:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 08:20 AM (IST)' },
    readTime: { en: '3 min read' }
  },
  {
    id: 'ind-6',
    title: {
      en: "Gurugram Hit-And-Run Case: Driver Kalyan Bainsla, Other Companions Were Drunk And Returning From Party, SIT Reveals"
    },
    summary: {
      en: "Special Investigation Team submits preliminary forensic and CCTV evidence in the high-speed collision probe."
    },
    category: 'CRIME',
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T08:05:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 08:05 AM (IST)' },
    readTime: { en: '3 min read' }
  },
  {
    id: 'ind-7',
    title: {
      en: "Chandrayaan-4 Launch Architecture Approved: ISRO To Bring Back Lunar Soil Samples To Earth"
    },
    summary: {
      en: "Indian Space Research Organisation outlines two-rocket module mission payload design for lunar sample return."
    },
    category: 'SCIENCE',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T07:50:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 07:50 AM (IST)' },
    readTime: { en: '4 min read' }
  },
  {
    id: 'ind-8',
    title: {
      en: "Indian Railways Announces 500 Special Trains For Festive Season Rush Across Metro Corridors"
    },
    summary: {
      en: "High-capacity trains deployed between Delhi, Mumbai, Kolkata, Patna, and South Indian hubs for passenger convenience."
    },
    category: 'NATIONAL',
    imageUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T07:35:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 07:35 AM (IST)' },
    readTime: { en: '3 min read' }
  },
  {
    id: 'ind-9',
    title: {
      en: "Supreme Court Directs High Courts To Fast-Track Criminal Appeals Pending Over 10 Years"
    },
    summary: {
      en: "Apex court highlights right to speedy trial and advises state legal service authorities to assist undertrials."
    },
    category: 'LAW',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T07:20:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 07:20 AM (IST)' },
    readTime: { en: '3 min read' }
  },
  {
    id: 'ind-10',
    title: {
      en: "Sensex & Nifty Hit Historic Record Highs Driven By Strong Foreign Inflows And Tech Rallies"
    },
    summary: {
      en: "BSE benchmark index crosses 85,000 level for the first time as domestic macroeconomic indicators remain robust."
    },
    category: 'MARKETS',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T07:05:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 07:05 AM (IST)' },
    readTime: { en: '3 min read' }
  },
  {
    id: 'ind-11',
    title: {
      en: "Delhi Air Quality Index Remains In 'Moderate' Zone; Anti-Dust Campaign Launched Across Capital"
    },
    summary: {
      en: "Municipal authorities deploy mechanical sweepers and anti-smog guns near construction hotspots."
    },
    category: 'ENVIRONMENT',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T06:50:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 06:50 AM (IST)' },
    readTime: { en: '2 min read' }
  },
  {
    id: 'ind-12',
    title: {
      en: "PM Modi Flags Off New Vande Bharat Express Corridor Connecting Western Industrial Hubs"
    },
    summary: {
      en: "Semi-high speed train service significantly cuts travel time between key commercial centers."
    },
    category: 'NATIONAL',
    imageUrl: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T06:35:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 06:35 AM (IST)' },
    readTime: { en: '3 min read' }
  },
  {
    id: 'ind-13',
    title: {
      en: "NITI Aayog Energy Index Ranks Gujarat First In Clean Transition & Power Reliability"
    },
    summary: {
      en: "State performance report commends renewable energy capacity expansion and reduced DISCOM losses."
    },
    category: 'ECONOMY',
    imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T06:20:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 06:20 AM (IST)' },
    readTime: { en: '4 min read' }
  },
  {
    id: 'ind-14',
    title: {
      en: "Tesla Formally Submits India EV Plant Proposal To Heavy Industries Ministry"
    },
    summary: {
      en: "Electric mobility major outlines phased capital investment plans for domestic component assembly."
    },
    category: 'AUTO',
    imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T06:05:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 06:05 AM (IST)' },
    readTime: { en: '3 min read' }
  },
  {
    id: 'ind-15',
    title: {
      en: "National Means-cum-Merit Scholarship Registration Extended Till October 15"
    },
    summary: {
      en: "Ministry of Education provides additional time for eligible Class 8 students to apply online."
    },
    category: 'SCHOLARSHIPS',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T05:50:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 05:50 AM (IST)' },
    readTime: { en: '2 min read' }
  },
  {
    id: 'ind-16',
    title: {
      en: "CBSE Mandates 75% Attendance Requirement For Class 10 & 12 Board Exams 2026"
    },
    summary: {
      en: "Board advises affiliated schools to upload attendance records ahead of admit card generation."
    },
    category: 'BOARD EXAMS',
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T05:35:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 05:35 AM (IST)' },
    readTime: { en: '3 min read' }
  },
  {
    id: 'ind-17',
    title: {
      en: "India Dengue Vaccine Trials: QDenga Clinical Safety Data Submitted To Drug Controller"
    },
    summary: {
      en: "Expert panel reviews phase 3 efficacy trial metrics ahead of potential emergency authorization."
    },
    category: 'HEALTH',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T05:20:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 05:20 AM (IST)' },
    readTime: { en: '3 min read' }
  },
  {
    id: 'ind-18',
    title: {
      en: "UPSC Civil Services Mains Exam Begins Today: Exam Hall Guidelines & Dress Code"
    },
    summary: {
      en: "Thousands of candidates appear across nationwide examination centers under strict invigilation."
    },
    category: 'EXAM UPDATES',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T05:05:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 05:05 AM (IST)' },
    readTime: { en: '3 min read' }
  },
  {
    id: 'ind-19',
    title: {
      en: "Gold Prices Hit Record High Of ₹78,500 Per 10 Grams In Local Bullion Markets"
    },
    summary: {
      en: "Jewellers report festive season buying demand alongside international price momentum."
    },
    category: 'MARKETS',
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T04:50:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 04:50 AM (IST)' },
    readTime: { en: '2 min read' }
  },
  {
    id: 'ind-20',
    title: {
      en: "FII Inflows Touch ₹4,500 Crore In Single Session As Domestic Equities Surge"
    },
    summary: {
      en: "Foreign institutional buyers increase stakes in banking, automotive, and IT bluechip stocks."
    },
    category: 'BUSINESS',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-21T04:35:00Z',
    timeAgo: { en: 'MON, 21 SEP 2026 04:35 AM (IST)' },
    readTime: { en: '3 min read' }
  }
];

export const mockWorldPageArticles: NewsArticle[] = [
  {
    id: 'w-1',
    title: {
      en: 'US Presidential Race 2026: Key battleground states swing unpredictably as early voting kicks off'
    },
    summary: {
      en: 'High voter turnout recorded across critical swing states with tight margins predicted by late national polls.'
    },
    content: {
      en: [
        'High voter turnout recorded across critical swing states with tight margins predicted by late national polls.',
        'Political analysts note record mail-in ballot submissions across key suburban electoral districts.',
        'Campaign headquarters release final rally itineraries ahead of election day voting.'
      ]
    },
    category: 'US POLITICS',
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-20T11:00:00Z',
    timeAgo: { en: '1 hour ago' },
    readTime: { en: '4 min read' }
  },
  {
    id: 'w-2',
    title: {
      en: 'Ceasefire talks resume in Cairo as international mediators push for immediate humanitarian corridor'
    },
    summary: {
      en: 'Diplomatic delegations arrive in Egypt for high-stakes peace discussions aimed at resolving border tensions.'
    },
    content: {
      en: [
        'Diplomatic delegations arrive in Egypt for high-stakes peace discussions aimed at resolving border tensions.',
        'UN humanitarian envoys stress the urgent requirement for medical aid convoys to reach conflict zones.',
        'Talks continue behind closed doors with multilateral observers expressing cautious optimism.'
      ]
    },
    category: 'MIDDLE EAST',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-20T10:00:00Z',
    timeAgo: { en: '2 hours ago' },
    readTime: { en: '3 min read' }
  },
  {
    id: 'w-3',
    title: {
      en: 'UK introduces stricter visa regulations for international graduates, minimum salary thresholds raised'
    },
    summary: {
      en: 'New British immigration policy targets post-study work visas with updated income criteria for skilled workers.'
    },
    category: 'EUROPE',
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-20T09:00:00Z',
    timeAgo: { en: '3 hours ago' },
    readTime: { en: '4 min read' }
  },
  {
    id: 'w-4',
    title: {
      en: 'Japan and South Korea sign historic semiconductor trade pact to protect supply chains'
    },
    summary: {
      en: 'Bilateral agreement enhances tech manufacturing collaboration and microchip resilience across East Asia.'
    },
    category: 'ASIA PACIFIC',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-20T08:00:00Z',
    timeAgo: { en: '4 hours ago' },
    readTime: { en: '3 min read' }
  },
  {
    id: 'w-5',
    title: {
      en: 'G20 Infrastructure Summit: World leaders sign historic green energy transport corridor agreement'
    },
    summary: {
      en: 'Multi-billion dollar global climate fund established to accelerate sustainable railway and port networks.'
    },
    category: 'GEOPOLITICS',
    imageUrl: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-20T07:00:00Z',
    timeAgo: { en: '5 hours ago' },
    readTime: { en: '5 min read' }
  },
  {
    id: 'w-6',
    title: {
      en: 'Donald Trump signs Russia sanctions bill, secondary tariffs impacting global petroleum refiners'
    },
    summary: {
      en: 'US executive action mandates stringent compliance guidelines for international crude oil shipments.'
    },
    category: 'GLOBAL DIPLOMACY',
    imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-20T06:00:00Z',
    timeAgo: { en: '6 hours ago' },
    readTime: { en: '4 min read' }
  },
  {
    id: 'w-7',
    title: {
      en: 'UN General Assembly votes overwhelmingly for new global digital governance standards'
    },
    summary: {
      en: 'Member states agree on unified framework targeting artificial intelligence ethics and data sovereignty.'
    },
    category: 'UNITED NATIONS',
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-20T05:00:00Z',
    timeAgo: { en: '7 hours ago' },
    readTime: { en: '3 min read' }
  },
  {
    id: 'w-8',
    title: {
      en: 'European Central Bank cuts interest rates by 25 bps as eurozone inflation cools down'
    },
    summary: {
      en: 'Monetary policy easing signals economic recovery support across major European manufacturing hubs.'
    },
    category: 'EUROPEAN ECONOMY',
    imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-20T04:00:00Z',
    timeAgo: { en: '8 hours ago' },
    readTime: { en: '3 min read' }
  },
  {
    id: 'w-9',
    title: {
      en: 'China pledges fresh economic stimulus package to support domestic housing sector'
    },
    summary: {
      en: 'State banks reduce mortgage benchmarks to boost consumer confidence and urban real estate liquidity.'
    },
    category: 'CHINA AFFAIRS',
    imageUrl: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-20T03:00:00Z',
    timeAgo: { en: '9 hours ago' },
    readTime: { en: '3 min read' }
  },
  {
    id: 'w-10',
    title: {
      en: 'Federal Reserve indicates cautious path on rate cuts amid steady US job growth data'
    },
    summary: {
      en: 'Central bank officials emphasize data-dependent policy adjustments for upcoming quarterly reviews.'
    },
    category: 'US ECONOMY',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-20T02:00:00Z',
    timeAgo: { en: '10 hours ago' },
    readTime: { en: '4 min read' }
  },
  {
    id: 'w-11',
    title: {
      en: 'Global Climate Summit in Geneva approves $100 Billion Loss & Damage Fund allocation'
    },
    summary: {
      en: 'Developing nations receive priority access to climate adaptation grants for coastal infrastructure.'
    },
    category: 'CLIMATE ACTION',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-20T01:00:00Z',
    timeAgo: { en: '11 hours ago' },
    readTime: { en: '3 min read' }
  },
  {
    id: 'w-12',
    title: {
      en: 'Australia passes groundbreaking social media age limit bill for minors in parliament'
    },
    summary: {
      en: 'Tech platforms mandated to enforce age verification measures to safeguard adolescent mental health.'
    },
    category: 'AUSTRALIA',
    imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-19T23:00:00Z',
    timeAgo: { en: '13 hours ago' },
    readTime: { en: '3 min read' }
  },
  {
    id: 'w-13',
    title: {
      en: 'France launches high-speed renewable energy grid project connecting Western Europe'
    },
    summary: {
      en: 'Inter-country solar and wind transmission networks aim for 100% clean power distribution.'
    },
    category: 'RENEWABLES',
    imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-19T22:00:00Z',
    timeAgo: { en: '14 hours ago' },
    readTime: { en: '4 min read' }
  },
  {
    id: 'w-14',
    title: {
      en: 'NATO alliance expands joint cyber defense intelligence sharing platform'
    },
    summary: {
      en: 'Member countries enhance real-time threat detection to protect critical national infrastructure.'
    },
    category: 'CYBER SECURITY',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-19T21:00:00Z',
    timeAgo: { en: '15 hours ago' },
    readTime: { en: '3 min read' }
  },
  {
    id: 'w-15',
    title: {
      en: 'South America Trade Bloc signs expanded commercial treaty with Asian economies'
    },
    summary: {
      en: 'Duty-free lithium and agricultural export agreements boost trans-Pacific trade volumes.'
    },
    category: 'LATIN AMERICA',
    imageUrl: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-19T20:00:00Z',
    timeAgo: { en: '16 hours ago' },
    readTime: { en: '3 min read' }
  },
  {
    id: 'w-16',
    title: {
      en: 'Canada opens new immigration pathway for healthcare professionals and engineers'
    },
    summary: {
      en: 'Express entry draws lower points cutoffs to address labor shortages across provincial territories.'
    },
    category: 'CANADA',
    imageUrl: 'https://images.unsplash.com/photo-1517935703635-27c5696e2457?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-19T19:00:00Z',
    timeAgo: { en: '17 hours ago' },
    readTime: { en: '3 min read' }
  },
  {
    id: 'w-17',
    title: {
      en: 'Singapore unveils AI innovation hub to host international research laboratories'
    },
    summary: {
      en: 'Government commits billion-dollar grants for ethical machine learning & robotics applications.'
    },
    category: 'SINGAPORE TECH',
    imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-19T18:00:00Z',
    timeAgo: { en: '18 hours ago' },
    readTime: { en: '3 min read' }
  },
  {
    id: 'w-18',
    title: {
      en: 'German Bundestag passes major green transit funding package for national railways'
    },
    summary: {
      en: 'Subsidized public transit tickets extended nationwide to cut urban carbon emissions.'
    },
    category: 'GERMANY',
    imageUrl: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-19T17:00:00Z',
    timeAgo: { en: '19 hours ago' },
    readTime: { en: '3 min read' }
  },
  {
    id: 'w-19',
    title: {
      en: 'African Union announces unified intra-continental digital payment gateway system'
    },
    summary: {
      en: 'Cross-border currency conversion fees reduced to facilitate regional trade integration.'
    },
    category: 'AFRICA UNION',
    imageUrl: 'https://images.unsplash.com/photo-1489493887464-892be6d1daae?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-19T16:00:00Z',
    timeAgo: { en: '20 hours ago' },
    readTime: { en: '3 min read' }
  },
  {
    id: 'w-20',
    title: {
      en: 'Global Space Agency Accord signed for peaceful lunar surface resource exploration'
    },
    summary: {
      en: 'International space agencies pool scientific telemetry data for deep space human missions.'
    },
    category: 'SPACE EXPLORATION',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-09-19T15:00:00Z',
    timeAgo: { en: '21 hours ago' },
    readTime: { en: '4 min read' }
  }
];

export const mockBusinessPageArticles: NewsArticle[] = mockIndiaPageArticles.map((a, i) => ({
  ...a,
  id: `biz-${i + 1}`,
  category: i === 0 ? 'MARKETS' : i === 1 ? 'BANKING' : i === 2 ? 'CORPORATE' : 'BUSINESS',
  title: i === 0 ? {
    en: 'Sensex Hits Record 85,000 Milestone As Foreign Institutional Inflows Surge'
  } : a.title
}));

export const mockTechPageArticles: NewsArticle[] = mockIndiaPageArticles.map((a, i) => ({
  ...a,
  id: `tech-${i + 1}`,
  category: i === 0 ? 'AI & TECH' : i === 1 ? 'SMARTPHONES' : 'TECHNOLOGY',
  title: i === 0 ? {
    en: 'Google DeepMind Unveils Real-Time Multimodal AI Reasoning Model'
  } : a.title
}));

export const mockSportsPageArticles: NewsArticle[] = mockIndiaPageArticles.map((a, i) => ({
  ...a,
  id: `sports-${i + 1}`,
  category: i === 0 ? 'OLYMPICS' : i === 1 ? 'ATHLETICS' : 'SPORTS',
  title: i === 0 ? {
    en: 'Neeraj Chopra Wins Gold At Diamond League Final With Historic Javelin Throw'
  } : a.title
}));

export const mockCricketPageArticles: NewsArticle[] = mockIndiaPageArticles.map((a, i) => ({
  ...a,
  id: `cric-${i + 1}`,
  category: i === 0 ? 'TEST CRICKET' : i === 1 ? 'IPL 2026' : 'CRICKET',
  title: i === 0 ? {
    en: 'Border-Gavaskar Trophy 2026: Team India Squad Announced For 5-Test Series'
  } : a.title
}));

export const mockEntertainmentPageArticles: NewsArticle[] = mockIndiaPageArticles.map((a, i) => ({
  ...a,
  id: `ent-${i + 1}`,
  category: i === 0 ? 'BOLLYWOOD' : i === 1 ? 'OTT' : 'ENTERTAINMENT',
  title: i === 0 ? {
    en: 'Pushpa 2 Box Office Day 15: Allu Arjun Starrer Crosses ₹1,100 Crore Worldwide'
  } : a.title
}));

export const mockLifestylePageArticles: NewsArticle[] = mockIndiaPageArticles.map((a, i) => ({
  ...a,
  id: `life-${i + 1}`,
  category: i === 0 ? 'HEALTH' : i === 1 ? 'FITNESS' : 'LIFESTYLE',
  title: i === 0 ? {
    en: 'Monsoon Wellness Guide: 10 Natural Herbs To Boost Immunity & Vitality'
  } : a.title
}));

export const mockEducationPageArticles: NewsArticle[] = mockIndiaPageArticles.map((a, i) => ({
  ...a,
  id: `edu-${i + 1}`,
  category: i === 0 ? 'NEET PG' : i === 1 ? 'BOARD EXAMS' : 'EDUCATION',
  title: i === 0 ? {
    en: 'NEET PG 2026 Counselling Schedule Released On mcc.nic.in; Check Round 1 Details'
  } : a.title
}));

export const mockAutoPageArticles: NewsArticle[] = mockIndiaPageArticles.map((a, i) => ({
  ...a,
  id: `auto-${i + 1}`,
  category: i === 0 ? 'EV NEWS' : i === 1 ? 'CAR REVIEWS' : 'AUTO',
  title: i === 0 ? {
    en: 'Tesla Formally Submits $2 Billion India EV Factory Proposal To Heavy Industries Ministry'
  } : a.title
}));

export const mockSpiritualPageArticles: NewsArticle[] = mockIndiaPageArticles.map((a, i) => ({
  ...a,
  id: `spir-${i + 1}`,
  category: i === 0 ? 'MAHAKUMBH' : i === 1 ? 'AYODHYA' : 'SPIRITUAL',
  title: i === 0 ? {
    en: 'Mahakumbh 2026 Preparations In Prayagraj: Floating Pontoon Bridges Installed'
  } : a.title
}));

export const mockOpinionPageArticles: NewsArticle[] = mockIndiaPageArticles.map((a, i) => ({
  ...a,
  id: `op-${i + 1}`,
  category: i === 0 ? 'OPINION' : i === 1 ? 'ANALYSIS' : 'OPINION',
  title: i === 0 ? {
    en: 'Geopolitics Of Global Energy Transition: Why Oil Tariffs Impact Developing Economies'
  } : a.title
}));

export const mockExplainerPageArticles: NewsArticle[] = mockIndiaPageArticles.map((a, i) => ({
  ...a,
  id: `exp-${i + 1}`,
  category: i === 0 ? 'EXPLAINER' : i === 1 ? 'DEEP DIVE' : 'EXPLAINER',
  title: i === 0 ? {
    en: 'Explained: Russia Sanctions Bill & Impact On Indian Crude Oil Imports'
  } : a.title
}));

export const mockHoroscopePageArticles: NewsArticle[] = [
  {
    id: 'horoscope-1',
    title: {
      en: 'Love Horoscope Today, August 7, 2026: One Conversation Could Change Everything'
    },
    summary: {
      en: 'Love Horoscope Today, August 7, 2026: Today is one of the most favourable days of the year for love and relationships. You are likely to feel emotionally secure, calm, and more open to expressing your feelings.'
    },
    category: 'HOROSCOPE',
    imageUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
    imageCaption: {
      en: 'Love Horoscope Today, August 7, 2026 (Image: Magnific)'
    },
    publishedAt: 'Fri, 07 Aug 2026 08:30 AM (IST)',
    timeAgo: { en: 'FRI, 07 AUG 2026 08:30 AM (IST)' },
    readTime: { en: '4 min read' },
    author: {
      name: { en: 'Anushka Shalya' },
      role: { en: 'Horoscope Specialist' },
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    },
    content: {
      en: [
        'Today brings a beautiful opportunity to strengthen emotional connections and deepen your relationships. You are likely to feel calmer, more emotionally balanced, and ready to express your feelings honestly. At times, you may briefly question yourself or your relationship, but do not let temporary insecurities influence your decisions. Avoid speaking impulsively or reacting in anger, as even small misunderstandings can grow if words are not chosen carefully. Open communication, transparency, and patience will be the key to maintaining harmony. Check out today\'s prediction given by Astropatri.',
        'Aries Love Horoscope Today: The sense of stability you feel in your personal and financial life today will positively influence your relationship as well. With a lighter mind, expressing your feelings to your partner will feel easier, leading to open and meaningful conversations that strengthen mutual understanding. However, do not let your excitement prevent you from listening to your partner\'s emotions, as their feelings deserve equal attention. Singles may find themselves attracted to someone with a calm personality whose honesty and warmth create an instant sense of comfort.',
        'Taurus Love Horoscope Today: Today is likely to be one of the most special days for your love life. You will experience greater emotional depth, trust, and security in your relationship, and an old misunderstanding may finally be resolved. Conversations about the future could bring you and your partner closer together.',
        'Gemini Love Horoscope Today: Communication is your greatest strength today. Share your feelings openly and listen attentively to your partner. Singles might bump into someone special during social events.',
        'Cancer Love Horoscope Today: Deep emotional bonds get even stronger today. Trust your intuition and spend quality time with loved ones.',
        'Leo Love Horoscope Today: Warmth and passion fill your romantic sphere. A heartwarming gesture will make your partner feel cherished.',
        'Virgo Love Horoscope Today: Patience and clarity will bring balance to your romantic relationship. Focus on active listening.',
        'Libra Love Horoscope Today: Harmony and charm rule your day. A sweet surprise or heart-to-heart conversation deepens trust.',
        'Scorpio Love Horoscope Today: Emotional intensity transforms into deep mutual respect. Express your vulnerability freely.',
        'Sagittarius Love Horoscope Today: Optimism and joy spark romance. Plan an outing or creative date with your partner.',
        'Capricorn Love Horoscope Today: Mutual commitment and security provide peace of mind. Loyalty shines bright.',
        'Aquarius Love Horoscope Today: Spontaneous and uplifting energy encourages playful interaction with your companion.',
        'Pisces Love Horoscope Today: Empathy and romantic vibes create a serene atmosphere for love to flourish.'
      ]
    }
  },
  {
    id: 'horoscope-2',
    title: {
      en: 'Horoscope Today, August 7, 2026: The Heavy Phase Ends And A Stronger Chapter Begins'
    },
    summary: {
      en: 'Horoscope Today, August 7, 2026: The cosmic alignment marks a transformative shift in energy as heavy planetary pressures dissipate.'
    },
    category: 'HOROSCOPE',
    imageUrl: 'https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?auto=format&fit=crop&w=800&q=80',
    imageCaption: {
      en: 'Horoscope Today, August 7, 2026 (Image: Astrological Alignment)'
    },
    publishedAt: 'Fri, 07 Aug 2026 08:00 AM (IST)',
    timeAgo: { en: 'FRI, 07 AUG 2026 08:00 AM (IST)' },
    readTime: { en: '3 min read' },
    author: {
      name: { en: 'Anushka Shalya' },
      role: { en: 'Astrology Editor' },
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    },
    content: {
      en: [
        'Horoscope Today, August 7, 2026: Planetary transits bring fresh momentum across all zodiac signs as Saturn and Jupiter form favorable aspects.',
        'Aries Horoscope Today: A major relief in work pressure allows you to plan your upcoming goals with clarity.',
        'Taurus Horoscope Today: Financial stability improves. An unexpected opportunity for growth presents itself.',
        'Gemini Horoscope Today: Sharp focus enables you to complete long-pending projects with ease.',
        'Cancer Horoscope Today: Inner peace returns as emotional clutter clears away.'
      ]
    }
  },
  {
    id: 'horoscope-3',
    title: {
      en: 'Love Horoscope Today, August 6, 2026: The Universe Has A Romantic Surprise For These Zodiac Signs'
    },
    summary: {
      en: 'Love Horoscope Today, August 6, 2026: Planetary positions hint at unexpected confessions of affection and romantic turn of events.'
    },
    category: 'HOROSCOPE',
    imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
    imageCaption: {
      en: 'Love Horoscope Today, August 6, 2026 (Image: Celestial Love)'
    },
    publishedAt: 'Thu, 06 Aug 2026 08:30 AM (IST)',
    timeAgo: { en: 'THU, 06 AUG 2026 08:30 AM (IST)' },
    readTime: { en: '3 min read' },
    author: {
      name: { en: 'Anushka Shalya' },
      role: { en: 'Astrology Editor' },
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    },
    content: {
      en: [
        'Venus alignment today brings affection, warmth, and surprising romantic developments for water and earth signs.',
        'Leo Love Horoscope Today: Express your passion without holding back; your sincerity will impress.',
        'Libra Love Horoscope Today: A surprise invitation leads to unforgettable romantic memories.'
      ]
    }
  },
  {
    id: 'horoscope-4',
    title: {
      en: 'Horoscope Today, August 6, 2026: One Conversation Could Change The Course Of Your Day'
    },
    summary: {
      en: 'Horoscope Today, August 6, 2026: Important astrological insights reveal crucial career, health, and relationship guidance.'
    },
    category: 'HOROSCOPE',
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
    imageCaption: {
      en: 'Daily Horoscope Analysis (Image: Cosmic Insights)'
    },
    publishedAt: 'Thu, 06 Aug 2026 08:00 AM (IST)',
    timeAgo: { en: 'THU, 06 AUG 2026 08:00 AM (IST)' },
    readTime: { en: '3 min read' },
    author: {
      name: { en: 'Anushka Shalya' },
      role: { en: 'Astrology Editor' },
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    },
    content: {
      en: [
        'Important astrological insights reveal crucial career, health, and relationship guidance for all signs today.',
        'Scorpio Horoscope Today: Trust your instinct when dealing with important decision makers.'
      ]
    }
  },
  {
    id: 'horoscope-5',
    title: {
      en: 'Weekly Horoscope Predictions: What Stars Have In Store For You From August 7 to August 13'
    },
    summary: {
      en: 'Weekly Horoscope: Detailed cosmic breakdown of career, finance, love, and health trends for all 12 zodiac signs.'
    },
    category: 'HOROSCOPE',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    imageCaption: {
      en: 'Weekly Zodiac Forecast'
    },
    publishedAt: 'Wed, 05 Aug 2026 09:00 AM (IST)',
    timeAgo: { en: 'WED, 05 AUG 2026 09:00 AM (IST)' },
    readTime: { en: '5 min read' },
    author: {
      name: { en: 'Anushka Shalya' },
      role: { en: 'Astrology Editor' },
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    },
    content: {
      en: [
        'Weekly astrological breakdown highlighting key transit events, lunar phases, and luck rankings.'
      ]
    }
  }
];

export const mockCategoryArticles: Record<string, NewsArticle[]> = {
  national: mockIndiaPageArticles,
  india: mockIndiaPageArticles,
  latest: mockLatestPageArticles,
  world: mockWorldPageArticles,
  business: mockBusinessPageArticles,
  tech: mockTechPageArticles,
  sports: mockSportsPageArticles,
  cricket: mockCricketPageArticles,
  entertainment: mockEntertainmentPageArticles,
  lifestyle: mockLifestylePageArticles,
  education: mockEducationPageArticles,
  auto: mockAutoPageArticles,
  spiritual: mockSpiritualPageArticles,
  horoscope: mockHoroscopePageArticles,
  opinion: mockOpinionPageArticles,
  explainer: mockExplainerPageArticles
};

export const mockLeadStory = mockHeroLeadArticle;
export const mockSubLeads = mockHeroSubLeads;
export const mockTrendingNews = mockRightTopNews.map(r => ({
  id: r.id,
  title: typeof r.title === 'string' ? { en: r.title } : r.title,
  summary: { en: '' },
  category: r.category,
  imageUrl: '',
  publishedAt: '',
  timeAgo: { en: '2h ago' },
  readTime: { en: '2 min read' },
  trendingRank: r.rank
}));
export const mockFastUpdates = mockHeroLeftHeadlines.map(h => ({
  id: h.id,
  timestamp: h.timeAgo,
  headline: { en: h.title },
  category: h.category,
  isUrgent: false
}));

export const mockVideoArticles: NewsArticle[] = [
  {
    id: 'vid-01',
    title: {
      en: 'Special Ground Report: Historic Infrastructure Milestones Across India'
    },
    summary: {
      en: 'Watch our comprehensive video report on the high-speed corridors transformed this year.'
    },
    category: 'national',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&q=80',
    publishedAt: '2026-03-20T10:00:00Z',
    timeAgo: { en: '2h ago' },
    readTime: { en: '5 min watch' },
    videoDuration: '04:15',
    isVideo: true
  },
  {
    id: 'vid-02',
    title: {
      en: 'Space Mission Update: Chandrayaan and Beyond Direct Press Briefing'
    },
    summary: {
      en: 'Key takeaways from the scientist panel outlining India next orbital expeditions.'
    },
    category: 'tech',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
    publishedAt: '2026-03-20T09:30:00Z',
    timeAgo: { en: '4h ago' },
    readTime: { en: '3 min watch' },
    videoDuration: '03:45',
    isVideo: true
  }
];

export const mockQuickHighlightArticles: NewsArticle[] = [
  {
    id: 'hl-1',
    title: {
      en: "Donald Trump signs Russia sanctions bill, India among countries at risk of 100% tariffs over oil purchases"
    },
    summary: {
      en: "US President Donald Trump has signed a far-reaching sanctions bill targeting nations purchasing Russian crude oil. The legislation includes strict secondary tariffs that could impact Indian refineries."
    },
    content: {
      en: [
        "US President Donald Trump has signed a far-reaching sanctions bill targeting nations purchasing Russian crude oil. The legislation includes strict secondary tariffs that could impact Indian refineries.",
        "Diplomatic channels between Washington and New Delhi are negotiating potential waiver mechanisms for long-term energy contracts.",
        "Global oil benchmarks fluctuated following the announcement as market analysts assess supply chain adjustments."
      ]
    },
    category: 'WORLD',
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
    publishedAt: '2026-09-20T11:00:00Z',
    timeAgo: { en: '1 hour ago' },
    readTime: { en: '4 min read' },
    author: {
      name: { en: 'Vaidika Thapa' },
      role: { en: 'Senior World Affairs Bureau' },
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    }
  },
  {
    id: 'hl-2',
    title: {
      en: 'NEET PG 2026 counselling schedule released on mcc.nic.in; check round 1 registration details'
    },
    summary: {
      en: 'The Medical Counselling Committee (MCC) has announced the official schedule for NEET PG 2026 admissions. Registration for Round 1 begins this Thursday for all-India quota seats.'
    },
    content: {
      en: [
        "The Medical Counselling Committee (MCC) has announced the official schedule for NEET PG 2026 admissions. Registration for Round 1 begins this Thursday for all-India quota seats.",
        "Candidates can submit their choices of specialty and medical institute through the official candidate portal.",
        "Seat allocation results for Round 1 will be declared on the scheduled date followed by physical reporting at designated colleges."
      ]
    },
    category: 'EDUCATION',
    imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
    publishedAt: '2026-09-20T10:00:00Z',
    timeAgo: { en: '2 hours ago' },
    readTime: { en: '3 min read' },
    author: {
      name: { en: 'Rajesh Sharma' },
      role: { en: 'Education & Careers Editor' },
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    }
  },
  {
    id: 'hl-3',
    title: {
      en: 'Mamata Banerjee faces major setback as candidate withdraws nomination ahead of Bengal bypolls'
    },
    summary: {
      en: 'In a dramatic political development ahead of the upcoming West Bengal assembly by-elections, the Trinamool Congress candidate filed an official withdrawal of nomination paper.'
    },
    content: {
      en: [
        "In a dramatic political development ahead of the upcoming West Bengal assembly by-elections, the Trinamool Congress candidate filed an official withdrawal of nomination paper.",
        "Senior party leadership has summoned an emergency meeting to address the constituency strategy.",
        "Opposition parties claimed this reflects shifting political dynamics in key parliamentary segments."
      ]
    },
    category: 'INDIA',
    imageUrl: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80',
    publishedAt: '2026-09-20T09:00:00Z',
    timeAgo: { en: '3 hours ago' },
    readTime: { en: '3 min read' },
    author: {
      name: { en: 'Anita Roy' },
      role: { en: 'Senior National Political Correspondent' },
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'
    }
  },
  {
    id: 'hl-4',
    title: {
      en: 'Pushpa 2 box office day 15: Allu Arjun starrer crosses ₹1,100 crore worldwide milestone'
    },
    summary: {
      en: 'The pan-India blockbuster Pushpa 2: The Rule continues its record-breaking box office run, becoming one of the highest-grossing Indian films of all time globally.'
    },
    content: {
      en: [
        "The pan-India blockbuster Pushpa 2: The Rule continues its record-breaking box office run, becoming one of the highest-grossing Indian films of all time globally.",
        "Trade analysts report strong weekend occupancies across multiplexes and single screens nationwide.",
        "International distribution circuits have registered unprecedented ticket sales in North America and Gulf territories."
      ]
    },
    category: 'ENTERTAINMENT',
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    publishedAt: '2026-09-20T09:00:00Z',
    timeAgo: { en: '3 hours ago' },
    readTime: { en: '4 min read' },
    author: {
      name: { en: 'Karan Kapoor' },
      role: { en: 'Bollywood Trade Analyst' },
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
    }
  },
  {
    id: 'hl-5',
    title: {
      en: 'Sensex hits fresh record high, surges past 85,000 points on strong foreign fund inflows'
    },
    summary: {
      en: 'Indian equity markets surged to unprecedented levels today as the BSE Sensex crossed the historic 85,000 mark driven by massive foreign institutional investments and strong quarterly earnings.'
    },
    content: {
      en: [
        "Indian equity markets surged to unprecedented levels today as the BSE Sensex crossed the historic 85,000 mark driven by massive foreign institutional investments and strong quarterly earnings.",
        "Banking, IT, and automobile stocks led the market rally with broad-based buying across smallcap and midcap indices.",
        "Market strategists project sustained bullish momentum supported by domestic macroeconomic fundamentals."
      ]
    },
    category: 'BUSINESS',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    publishedAt: '2026-09-20T08:00:00Z',
    timeAgo: { en: '4 hours ago' },
    readTime: { en: '3 min read' },
    author: {
      name: { en: 'Vikram Mehta' },
      role: { en: 'Markets Editor' },
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80'
    }
  }
];

export const mockRightTopNewsArticles: NewsArticle[] = [
  {
    id: 'rtn-1',
    title: {
      en: 'Mutual Funds vs Fixed Deposits: Where should you invest in 2026 high interest regime?'
    },
    summary: {
      en: 'A comprehensive financial comparison detailing post-tax returns, risk profiles, and optimal asset allocation strategies for retail investors in 2026.'
    },
    content: {
      en: [
        "A comprehensive financial comparison detailing post-tax returns, risk profiles, and optimal asset allocation strategies for retail investors in 2026.",
        "Financial advisors recommend a balanced hybrid approach combining fixed-yield instruments with equity SIPs to optimize long-term wealth accumulation.",
        "Tax implication breakdowns highlight key differences across short-term and long-term capital gains treatments."
      ]
    },
    category: 'BUSINESS',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
    publishedAt: '2026-09-20T07:00:00Z',
    timeAgo: { en: '5 hours ago' },
    readTime: { en: '4 min read' },
    author: {
      name: { en: 'Vikram Mehta' },
      role: { en: 'Personal Finance Expert' },
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80'
    }
  }
];

export function getArticleById(id: string): NewsArticle | undefined {
  if (mockHeroLeadArticle.id === id) return mockHeroLeadArticle;
  const hl = mockQuickHighlightArticles.find(a => a.id === id);
  if (hl) return hl;
  const rtn = mockRightTopNewsArticles.find(a => a.id === id);
  if (rtn) return rtn;
  const sub = mockHeroSubLeads.find(a => a.id === id);
  if (sub) return sub;

  for (const key in mockCategoryArticles) {
    const item = mockCategoryArticles[key].find(a => a.id === id);
    if (item) return item;
  }

  return mockHeroLeadArticle;
}
