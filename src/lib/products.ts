import { Product } from '@/types/store';

export const STORE_PRODUCTS: Product[] = [
  {
    id: 'prod-family-nutrition-box',
    slug: 'family-nutrition-box',
    vendor_id: 'vendor-damascus-01',
    vendor_name: 'مستودعات الشام الغذائية (دمشق)',
    latitude: 33.5138,
    longitude: 36.2765,
    location_name: 'دمشق، كفرسوسة والبرامكة',
    title_en: 'Comprehensive Family Nutrition Box',
    title_ar: 'السلة الغذائية العائلية الشاملة',
    description_en: 'A complete monthly one-time provision package packed with top-tier grains, pure cooking oils, legumes, and pantry staples. Perfect for supporting a family of 5.',
    description_ar: 'حزمة تموينية شهرية شاملة لشراء لمرة واحدة، تضم أجود أصناف الحبوب، الزيوت النقية، البقوليات والمعلبات الأساسية تكفي عائلة من 5 أفراد.',
    price_usd: 55,
    category: 'food',
    badge_en: 'Best Seller',
    badge_ar: 'الأكثر طلباً',
    image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    items_en: [
      '5 kg Premium Egyptian Rice',
      '5 kg Pure Cane Sugar',
      '4 Liters Pure Sunflower Oil',
      '4 kg Coarse & Fine Bulgur',
      '2 kg Pure Ghee',
      'Assorted Legumes (Lentils, Chickpeas, Beans)',
      'Tea & Canned Vegetables Assortment'
    ],
    items_ar: [
      '5 كغ أرز مصري نخب أول',
      '5 كغ سكر أبيض نقي',
      '4 لتر زيت دوار الشمس المصفى',
      '4 كغ برغل بنوعيه (خشن وناعم)',
      '2 كغ سمنة ممتازة',
      'بقوليات مشكلة (عدس، حمص، فاصولياء)',
      'تشكيلة شاي ومعلبات خضار ومربى'
    ],
    specs_en: {
      'Weight': 'Approx. 28 kg',
      'Fulfillment': 'Field delivery within 24-48 hours',
      'Package Type': 'Reinforced heavy-duty carton box',
      'Purchase Type': 'One-time direct purchase'
    },
    specs_ar: {
      'الوزن الإجمالي': 'حوالي 28 كغ',
      'مدة التوصيل': 'تسليم ميداني خلال 24 - 48 ساعة',
      'نوع التغليف': 'صندوق كرتوني مقوى ومحكم الإغلاق',
      'نوع الشراء': 'شراء فردي مباشر لمرة واحدة'
    },
    is_featured: true,
    stock_status: 'in_stock',
    lemon_variant_id: 'default'
  },
  {
    id: 'prod-chronic-care-medical-kit',
    slug: 'chronic-care-medical-kit',
    vendor_id: 'vendor-aleppo-02',
    vendor_name: 'مؤسسة الشهباء للرعاية (حلب)',
    latitude: 36.2021,
    longitude: 37.1343,
    location_name: 'حلب، الفرقان والجميلية',
    title_en: 'Chronic Care & Senior Medical Kit',
    title_ar: 'باقة الرعاية الصحية وأدوية كبار السن',
    description_en: 'A one-time medical supply package designed to procure essential hypertension, diabetes, and cardiovascular medications with verified pharmacy receipts.',
    description_ar: 'باقة طبية لمرة واحدة مخصصة لتأمين أدوية الضغط والسكري وأمراض القلب من صيدليات معتمدة مع فواتير الشراء الرسمية.',
    price_usd: 42,
    category: 'health',
    badge_en: 'Urgent Essential',
    badge_ar: 'عاجل وحيوي',
    image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    items_en: [
      'Prescription Medications Procurement',
      'Digital Blood Pressure Monitor or Glucose Strips',
      'Essential Senior Multivitamin Pack',
      'Insulated Medical Packaging with Delivery Confirmation'
    ],
    items_ar: [
      'شراء الأدوية المعتمدة وفق الوصفة المرفقة بدقة',
      'جهاز قياس ضغط رقمي أو شرائط قياس السكر',
      'مكملات وفيتامينات غذائية لكبار السن',
      'تغليف طبي حراري آمن مع توثيق التسليم'
    ],
    specs_en: {
      'Category': 'Health & Care',
      'Verification': 'Licensed Pharmacy Receipt Included',
      'Delivery Time': 'Urgent 24-hour priority dispatch',
      'Payment Mode': 'One-time payment'
    },
    specs_ar: {
      'التصنيف': 'رعاية صحية وأدوية',
      'التوثيق': 'فاتورة رسمية صادرة من صيدلية مرخصة',
      'سرعة التوصيل': 'أولوية قصوى خلال 24 ساعة',
      'طريقة الدفع': 'دفعة واحدة'
    },
    is_featured: true,
    stock_status: 'in_stock',
    lemon_variant_id: 'default'
  },
  {
    id: 'prod-portable-solar-emergency-station',
    slug: 'portable-solar-emergency-station',
    vendor_id: 'vendor-damascus-01',
    vendor_name: 'مستودعات الشام الغذائية (دمشق)',
    latitude: 33.5138,
    longitude: 36.2765,
    location_name: 'دمشق، كفرسوسة والبرامكة',
    title_en: 'Emergency Solar Power & Lighting Station',
    title_ar: 'محطة طاقة شمسية وإنارة طوارئ منزلية',
    description_en: 'A complete standalone solar backup kit including an ultra-durable rechargeable battery pack, dual LED lighting strips, phone power banks, and solar panel.',
    description_ar: 'منظومة طاقة وإنارة مستقلة متكاملة تشمل بطارية قابلة للشحن عالية التحمل، أشرطة إنارة LED قوية، شواحن أجهزة، ولوح طاقة شمسية شاحن.',
    price_usd: 89,
    category: 'energy',
    badge_en: 'Top Tech',
    badge_ar: 'أعلى تقييم',
    image_url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    items_en: [
      '12V High-Cycle Rechargeable Power Unit',
      'Foldable 40W Monocrystalline Solar Panel',
      '3 High-Efficiency LED Room Lights with Switches',
      'Multi-Port USB Quick Charger for Phones & Radios',
      'Complete Wiring & Installation Guide'
    ],
    items_ar: [
      'وحدة طاقة وبطارية قابلة للشحن 12V عالية التحمل',
      'لوح طاقة شمسية أحادي البلورة بقدرة 40W',
      '3 مصابيح LED عالية الكفاءة مع قواطع مستقلة',
      'مخرج شحن سريع متعدد للأجهزة والهواتف',
      'كامل التوصيلات والتثبيت من قبل فني معتمد'
    ],
    specs_en: {
      'Capacity': '150Wh Standalone Backup',
      'Run Time': 'Up to 14 hours of continuous lighting',
      'Warranty': '1 Year Manufacturer Guarantee',
      'Pricing': 'One-time cost ($89)'
    },
    specs_ar: {
      'سعة التخزين': '150Wh طاقة احتياطية مستقلة',
      'زمن التشغيل': 'حتى 14 ساعة إنارة متواصلة',
      'الضمان': 'ضمان سنة كاملة ضد عيوب المصنع',
      'نوع التكلفة': 'تكلفة تدفع لمرة واحدة ($89)'
    },
    is_featured: true,
    stock_status: 'in_stock',
    lemon_variant_id: 'default'
  },
  {
    id: 'prod-winter-warmth-blanket-bundle',
    slug: 'winter-warmth-blanket-bundle',
    vendor_id: 'vendor-homs-03',
    vendor_name: 'مؤسسة حمص للإغاثة والتوزيع',
    latitude: 34.7324,
    longitude: 36.7137,
    location_name: 'حمص، شارع الحضارة والدبلان',
    title_en: 'Winter Warmth Heavy Blanket & Heater Bundle',
    title_ar: 'باقة الدفء الشتوي (أغطية حرارية ومستلزمات تدفئة)',
    description_en: 'Heavyweight double-ply thermal winter blankets paired with safe indoor heating essentials to protect families through harsh sub-zero winter temperatures.',
    description_ar: 'أغطية وبطانيات حرارية شتوية مزدوجة السماكة مع مستلزمات تدفئة آمنة لحماية الأسرة والأطفال من برد الشتاء القارس.',
    price_usd: 68,
    category: 'winter',
    badge_en: 'Winter Protection',
    badge_ar: 'حماية الشتاء',
    image_url: 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&w=800&q=80',
    items_en: [
      '2x Premium Double-Layer Heavy Thermal Blankets',
      'Refined Heating Fuel Supply (50 Liters)',
      'Thermal Insulated Window & Door Seal Kit',
      'Field Delivery Direct to Residence'
    ],
    items_ar: [
      'بطانيتان حراريتان شتويتان فاخرتان مزدوجة الطبقة',
      'مخصص وقود تدفئة صافي ونقي (50 لتر)',
      'أشرطة عزل حراري محكمة للنوافذ والأبواب',
      'توصيل مباشر لباب المنزل مع التأكيد بالصور'
    ],
    specs_en: {
      'Materials': 'Hypoallergenic Ultra-Dense Microfiber',
      'Season': 'Winter Seasonal Supply',
      'Fulfillment': '48-hour residential delivery',
      'Type': 'Direct one-off purchase'
    },
    specs_ar: {
      'الخامات': 'مايكروفايبر عالي الكثافة مضاد للحساسية',
      'الموسم': 'مستلزمات شتوية موسمية',
      'مدة التوصيل': 'خلال 48 ساعة لباب المنزل',
      'طبيعة الشراء': 'شراء لمرة واحدة فقط'
    },
    is_featured: false,
    stock_status: 'in_stock',
    lemon_variant_id: 'default'
  }
];

export function getProductBySlug(slug: string): Product | undefined {
  return STORE_PRODUCTS.find((p) => p.slug === slug || p.id === slug);
}
