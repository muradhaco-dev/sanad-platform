import { Service, Order } from '@/types';

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-1',
    title: 'السلة الغذائية العائلية الشاملة',
    description: 'تحتوي على المواد التموينية الأساسية التي تكفي عائلة من 5 أفراد لمدة شهر كامل (زيت، سمنة، أرز، برغل، سكر، شاي، بقوليات ومعلبات).',
    category: 'food',
    price_usd: 48,
    badge: 'الأكثر طلباً',
    is_active: true,
    items: [
      '5 كغ أرز مصري نخب أول',
      '5 كغ سكر أبيض',
      '4 لتر زيت دوار الشمس',
      '4 كغ برغل بنوعيه (خشن وناعم)',
      '2 كغ سمنة نباتية ممتازة',
      'بقوليات مشكلة (عدس، حمص، فاصولياء)',
      'عبوات شاي ومعلبات متنوعة'
    ]
  },
  {
    id: 'srv-2',
    title: 'باقة الرعاية الصحية وأدوية الأمراض المزمنة',
    description: 'تأمين أدوية الضغط والسكري والقلب أو الوصفات الشهرية من الصيدليات المعتمدة مع التوصيل السريع إلى باب المنزل.',
    category: 'health',
    price_usd: 35,
    badge: 'عاجل وضروري',
    is_active: true,
    items: [
      'شراء الأدوية حسب الروشتة المرفقة بدقة',
      'مستلزمات قياس الضغط أو شرائط السكر',
      'فيتامينات ومكملات غذائية لكبار السن',
      'تغليف طبي وتوصيل آمن'
    ]
  },
  {
    id: 'srv-3',
    title: 'تأمين صهريج مياه شرب نقية (1000 لتر)',
    description: 'تعبئة صهريج مياه نظيفة ومعقمة مباشرة إلى خزان المنزل في دمشق وريفها وحلب ومختلف المحافظات.',
    category: 'water',
    price_usd: 16,
    is_active: true,
    items: [
      'مياه نقية مفحوصة وصالحة للشرب',
      'تعبئة خزان المنزل بالكامل مع خرطوم طويل',
      'إشعار فوري بعد إتمام التفريغ'
    ]
  },
  {
    id: 'srv-4',
    title: 'وقود تدفئة شتوية (ديزل مازوت 100 لتر)',
    description: 'تأمين مادة المازوت المصفى للتدفئة المنزلية الشتوية لحماية عائلتك من برد الشتاء القارس.',
    category: 'energy',
    price_usd: 75,
    badge: 'موسم الشتاء',
    is_active: true,
    items: [
      '100 لتر مازوت صافي عالي الجودة',
      'تفريغ مباشر في خزانات المدافئ المنزلية',
      'فحص العداد والمطابقة بالصورة'
    ]
  },
  {
    id: 'srv-5',
    title: 'باقة الطاقة الشمسية والإنارة البديلة',
    description: 'صيانة بطاريات الطاقة الشمسية وتوفير بطارية إضافية أو لدات إنارة ومحول (إنفرتر) لتخفيف ساعات تقنين الكهرباء.',
    category: 'energy',
    price_usd: 60,
    is_active: true,
    items: [
      'فحص منظومة الطاقة وتفقّد كفاءة البطاريات',
      'توفير شواحن وليدات إضاءة سريعة الشحن',
      'زيارة فني مختص للتركيب والمعايرة'
    ]
  },
  {
    id: 'srv-6',
    title: 'سلة حليب الأطفال ومستلزمات الرضّع',
    description: 'توفير عبوات حليب الأطفال النادرة والحفاضات ذات الجودة العالية مع فيتامينات النمو والتوصيل الفوري.',
    category: 'emergency',
    price_usd: 28,
    is_active: true,
    items: [
      'عبوات حليب أطفال بحسب المرحلة العمرية',
      'حفاضات أطفال طبية نخب أول',
      'مستحضرات عناية بالرضّع ومناديل معقمة'
    ]
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    user_id: 'usr-exp-1',
    service_id: 'srv-1',
    status: 'paid',
    total_usd: 48,
    beneficiary_name: 'أم عمار المحمد',
    beneficiary_phone: '+963944123456',
    beneficiary_city: 'دمشق',
    beneficiary_address: 'الميدان - زقاق الموصلي - بناء الوفاء - طابق 2',
    notes: 'يرجى الاتصال قبل القدوم بساعة لتواجد الأهل بالمنزل',
    lemon_squeezy_order_id: 'ls_ord_89211',
    created_at: '2026-11-01T14:30:00.000Z',
    updated_at: '2026-11-01T14:30:00.000Z',
    service: INITIAL_SERVICES[0]
  },
  {
    id: 'ord-102',
    user_id: 'usr-exp-2',
    service_id: 'srv-3',
    status: 'processing',
    total_usd: 16,
    beneficiary_name: 'أبو طارق العلي',
    beneficiary_phone: '+963933987654',
    beneficiary_city: 'ريف دمشق',
    beneficiary_address: 'صحنايا - قرب مدرسة الكرامة - حارة الزهور',
    notes: 'الخزان على السطح ويحتاج خرطوم بطول 25 متراً',
    lemon_squeezy_order_id: 'ls_ord_89212',
    created_at: '2026-11-01T11:00:00.000Z',
    updated_at: '2026-11-01T13:00:00.000Z',
    service: INITIAL_SERVICES[2]
  },
  {
    id: 'ord-103',
    user_id: 'usr-exp-1',
    service_id: 'srv-2',
    status: 'completed',
    total_usd: 35,
    beneficiary_name: 'الحاجة فريزة الجاسم',
    beneficiary_phone: '+963988554433',
    beneficiary_city: 'حلب',
    beneficiary_address: 'الشهباء الجديدة - شارع المشافي - بناء الأمل',
    notes: 'تم شراء أدوية السكري والضغط وتسليم الفاتورة مع التقرير',
    lemon_squeezy_order_id: 'ls_ord_89150',
    created_at: '2026-10-30T10:00:00.000Z',
    updated_at: '2026-10-31T15:00:00.000Z',
    service: INITIAL_SERVICES[1]
  }
];

export const SYRIAN_CITIES = [
  'دمشق',
  'ريف دمشق',
  'حلب',
  'حمص',
  'حماة',
  'اللاذقية',
  'طرطوس',
  'السويداء',
  'درعا',
  'دير الزور'
];
