const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { slugify } = require('./utils/slugify');

const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const CartItem = require('./models/CartItem');
const Order = require('./models/Order');
const Review = require('./models/Review');

const img = (id) =>
  `https://images.unsplash.com/photo-${id}?w=400&h=500&fit=crop&auto=format`;

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
const users = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@stylecart.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'customer123',
    role: 'customer',
  },
];

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
const catImg = (id) =>
  `https://images.unsplash.com/photo-${id}?w=800&h=1000&fit=crop&auto=format`;

const categories = [
  {
    name: 'Men',
    description: "Men's clothing and essentials.",
    image: catImg('1507003211169-0a1dd7228f2d'),
  },
  {
    name: 'Women',
    description: "Women's clothing and essentials.",
    image: catImg('1572804013309-59a88b7e92f1'),
  },
  {
    name: 'Accessories',
    description: 'Bags, watches, belts and more.',
    image: catImg('1548036328-c9fa89d128fa'),
  },
  {
    name: 'Footwear',
    description: 'Shoes, boots and sandals for every step.',
    image: catImg('1549298916-b41d501d3772'),
  },
  {
    name: 'Activewear',
    description: 'Performance gear for every workout.',
    image: catImg('1506629082955-511b1aa562c8'),
  },
];

// ---------------------------------------------------------------------------
// Products — 30 items, 6 per category, with real Unsplash imagery.
// `category` holds the category name; it is resolved to an ObjectId below.
// ---------------------------------------------------------------------------
const productData = [
  // ----- Men -----
  {
    name: 'Classic Oxford Shirt',
    description:
      'A timeless cotton oxford shirt with button-down collar. Perfect for both office and casual settings. Crafted from premium breathable fabric.',
    price: 49.99,
    category: 'Men',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 45,
    // second Unsplash id (1598033129183…) is dead (404); keeping the working one
    images: [img('1602810318383-e386cc2a3ccf')],
  },
  {
    name: 'Slim Fit Chinos',
    description:
      'Modern slim-fit chinos tailored for a clean silhouette. Versatile enough for work or weekend. Made from stretch cotton twill.',
    price: 59.99,
    category: 'Men',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 38,
    images: [img('1473966968600-fa801b869a1a'), img('1624378439575-d8705ad7ae80')],
  },
  {
    name: 'Denim Jacket',
    description:
      'Classic trucker-style denim jacket with vintage wash. Features chest pockets and adjustable waist tabs. A wardrobe essential for layering.',
    price: 89.99,
    category: 'Men',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 22,
    images: [img('1551028719-00167b16eac5'), img('1576995853123-5a10305d93c0')],
  },
  {
    name: 'Wool Blend Blazer',
    description:
      'Sophisticated wool-blend blazer with structured shoulders and notch lapels. Ideal for business or smart-casual events.',
    price: 149.99,
    category: 'Men',
    sizes: ['M', 'L', 'XL'],
    stock: 15,
    images: [img('1507003211169-0a1dd7228f2d'), img('1593030761757-71fae45fa0e7')],
  },
  {
    name: 'Crew Neck T-Shirt',
    description:
      'Essential crew neck tee crafted from soft combed cotton. Available in classic colors. The perfect everyday foundation piece.',
    price: 24.99,
    category: 'Men',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    stock: 80,
    images: [img('1521572163474-6864f9cf17ab'), img('1583743814966-8936f5b7be1a')],
  },
  {
    name: 'Cargo Shorts',
    description:
      'Relaxed cargo shorts with multiple utility pockets. Made from durable cotton canvas. Perfect for summer adventures.',
    price: 39.99,
    category: 'Men',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 3, // low stock edge case
    images: [img('1591195853828-11db59a44f6b'), img('1565084888279-aca607ecce0c')],
  },

  // ----- Women -----
  {
    name: 'Floral Wrap Dress',
    description:
      'Elegant wrap dress with a flattering V-neckline and floral print. Flows beautifully with every step. Perfect for brunches and date nights.',
    price: 69.99,
    category: 'Women',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    stock: 30,
    images: [img('1572804013309-59a88b7e92f1'), img('1595777457583-95e059d581b8')],
  },
  {
    name: 'High-Rise Skinny Jeans',
    description:
      'Figure-hugging high-rise skinny jeans with stretch denim. Features classic five-pocket styling and a comfortable fit that moves with you.',
    price: 64.99,
    category: 'Women',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    stock: 50,
    images: [img('1541099649105-f69ad21f3246'), img('1584370848010-d7fe6bc767ec')],
  },
  {
    name: 'Silk Blouse',
    description:
      'Luxurious silk blouse with a relaxed fit and subtle sheen. Transitions seamlessly from desk to dinner. Dry clean recommended.',
    price: 79.99,
    category: 'Women',
    sizes: ['XS', 'S', 'M', 'L'],
    stock: 18,
    images: [img('1564257631407-4deb1f99d992'), img('1485462537746-965f33f7f6a7')],
  },
  {
    name: 'Pleated Midi Skirt',
    description:
      'Flowing pleated midi skirt with elastic waistband. Creates effortless movement and pairs beautifully with tucked-in blouses.',
    price: 54.99,
    category: 'Women',
    sizes: ['XS', 'S', 'M', 'L'],
    stock: 25,
    images: [img('1583496661160-fb5886a0aaaa'), img('1577900232427-18219b9166a0')],
  },
  {
    name: 'Oversized Knit Sweater',
    description:
      'Cozy oversized sweater in a chunky cable knit. Drop shoulders and ribbed trim add a relaxed vibe. Your go-to for cold weather layering.',
    price: 59.99,
    category: 'Women',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 35,
    // second Unsplash id (1434389677669…) is dead (404); keeping the working one
    images: [img('1576566588028-4147f3842f27')],
  },
  {
    name: 'Linen Wide-Leg Pants',
    description:
      'Breezy wide-leg pants in pure linen. High-waisted with a belted design. The ultimate warm-weather statement piece.',
    price: 64.99,
    category: 'Women',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    stock: 0, // out of stock edge case
    images: [img('1509631179647-0177331693ae'), img('1594633312681-425c7b97ccd1')],
  },

  // ----- Accessories -----
  {
    name: 'Leather Crossbody Bag',
    description:
      'Compact crossbody bag in genuine leather with adjustable strap. Multiple compartments keep essentials organized. Polished hardware finish.',
    price: 89.99,
    category: 'Accessories',
    sizes: [],
    stock: 20,
    images: [img('1548036328-c9fa89d128fa'), img('1590874103328-eac38a683ce7')],
  },
  {
    name: 'Aviator Sunglasses',
    description:
      'Classic aviator frames with UV400 protection lenses. Lightweight metal construction with adjustable nose pads for all-day comfort.',
    price: 34.99,
    category: 'Accessories',
    sizes: [],
    stock: 60,
    images: [img('1511499767150-a48a237f0083'), img('1577803645773-f96470509666')],
  },
  {
    name: 'Minimalist Watch',
    description:
      'Clean dial minimalist watch with genuine leather strap. Japanese quartz movement ensures precision. Water-resistant to 30 meters.',
    price: 129.99,
    category: 'Accessories',
    sizes: [],
    stock: 12,
    images: [img('1524592094714-0f0654e20314'), img('1522312346375-d1a52e2b99b3')],
  },
  {
    name: 'Wool Scarf',
    description:
      'Soft merino wool scarf with herringbone pattern. Generously sized for draping and wrapping. Adds instant polish to any winter outfit.',
    price: 39.99,
    category: 'Accessories',
    sizes: [],
    stock: 40,
    // first Unsplash id (1520903920243…) is dead (404); keeping the working one
    images: [img('1457545195570-67f207084966')],
  },
  {
    name: 'Canvas Backpack',
    description:
      'Durable canvas backpack with padded laptop compartment. Features leather trim and brass hardware. Perfect for commuting or weekend trips.',
    price: 54.99,
    category: 'Accessories',
    sizes: [],
    stock: 28,
    // second Unsplash id (1581605405669…) is dead (404); keeping the working one
    images: [img('1553062407-98eeb64c6a62')],
  },
  {
    name: 'Leather Belt',
    description:
      'Full-grain leather belt with brushed nickel buckle. Features single-prong closure and five-hole adjustment. Built to last.',
    price: 44.99,
    category: 'Accessories',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 55,
    // second Unsplash id (1553591589…) is dead (404); keeping the working one
    images: [img('1624222247344-550fb60583dc')],
  },

  // ----- Footwear -----
  {
    name: 'White Leather Sneakers',
    description:
      'Clean white leather sneakers with cushioned insole. Minimalist design pairs with everything. Rubber outsole for everyday traction.',
    price: 79.99,
    category: 'Footwear',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 42,
    images: [img('1549298916-b41d501d3772'), img('1460353581641-37baddab0fa2')],
  },
  {
    name: 'Chelsea Boots',
    description:
      'Classic Chelsea boots in polished leather. Elastic side panels for easy on-off. Versatile enough for both casual and smart occasions.',
    price: 119.99,
    category: 'Footwear',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 18,
    // first Unsplash id (1638953983694…) is dead (404); keeping the working one
    images: [img('1605733160314-4fc7dac4bb16')],
  },
  {
    name: 'Running Shoes',
    description:
      'Lightweight running shoes with responsive foam cushioning. Breathable mesh upper keeps feet cool. Engineered for road and treadmill.',
    price: 99.99,
    category: 'Footwear',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 55,
    images: [img('1542291026-7eec264c27ff'), img('1606107557195-0e29a4b5b4aa')],
  },
  {
    name: 'Strappy Sandals',
    description:
      'Elegant strappy sandals with block heel. Adjustable ankle strap for a secure fit. Ideal for warm-weather dressing.',
    price: 49.99,
    category: 'Footwear',
    sizes: ['S', 'M', 'L'],
    stock: 2, // low stock edge case
    images: [img('1543163521-1bf539c55dd2'), img('1603487742131-4160ec999306')],
  },
  {
    name: 'Classic Loafers',
    description:
      'Timeless penny loafers in supple leather. Hand-stitched moccasin construction. Effortlessly transitions from office to weekend.',
    price: 89.99,
    category: 'Footwear',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 30,
    images: [img('1533867617858-e7b97e060509'), img('1614252235316-8c857d38b5f4')],
  },
  {
    name: 'Hiking Boots',
    description:
      'Rugged hiking boots with waterproof membrane and Vibram outsole. Padded collar and tongue for ankle support on tough terrain.',
    price: 139.99,
    category: 'Footwear',
    sizes: ['M', 'L', 'XL'],
    stock: 16,
    images: [img('1520639888713-7851133b1ed0'), img('1606890737304-57a1ca8a5b62')],
  },

  // ----- Activewear -----
  {
    name: 'Yoga Leggings',
    description:
      'High-waisted yoga leggings with four-way stretch. Moisture-wicking fabric keeps you dry through every pose. Hidden waistband pocket.',
    price: 44.99,
    category: 'Activewear',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    stock: 65,
    images: [img('1506629082955-511b1aa562c8'), img('1538805060514-97d9cc17730c')],
  },
  {
    name: 'Performance Tank Top',
    description:
      'Lightweight performance tank with breathable mesh panels. Quick-dry technology for intense training sessions. Relaxed athletic fit.',
    price: 29.99,
    category: 'Activewear',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 70,
    images: [img('1571019614242-c5c5dee9f50b'), img('1518459031867-a89b944bffe4')],
  },
  {
    name: 'Track Jacket',
    description:
      'Retro-inspired track jacket with zip front and contrast piping. Soft jersey lining for comfort. Great for warm-ups or casual wear.',
    price: 69.99,
    category: 'Activewear',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 25,
    images: [img('1556906781-9a412961c28c'), img('1515886657613-9f3515b0c78f')],
  },
  {
    name: 'Sports Bra',
    description:
      'Medium-impact sports bra with racerback design. Supportive band and removable pads. Sweat-wicking fabric for all-day comfort.',
    price: 34.99,
    category: 'Activewear',
    sizes: ['XS', 'S', 'M', 'L'],
    stock: 50,
    images: [img('1571019613454-1cb2f99b2d8b'), img('1518310383802-640c2de311b2')],
  },
  {
    name: 'Running Shorts',
    description:
      'Lightweight running shorts with built-in liner. Side split hem for full range of motion. Reflective details for low-light visibility.',
    price: 34.99,
    category: 'Activewear',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 45,
    // first Unsplash id (1562886889…) is dead (404); keeping the working one
    images: [img('1517466787929-bc90951d0974')],
  },
  {
    name: 'Compression Tights',
    description:
      'Full-length compression tights that support muscles during and after workouts. Flatlock seams prevent chafing. UPF 50+ sun protection.',
    price: 49.99,
    category: 'Activewear',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 32,
    isActive: false, // inactive product edge case
    images: [img('1490645935967-10de6ba17061'), img('1594381898411-846e7d193883')],
  },
];

// Resolve category names to their created ObjectIds and stamp slugs.
const buildProducts = (categoryDocs) => {
  const byName = Object.fromEntries(categoryDocs.map((c) => [c.name, c._id]));
  return productData.map((p) => ({
    ...p,
    slug: slugify(p.name),
    category: byName[p.category],
    isActive: p.isActive !== undefined ? p.isActive : true,
  }));
};

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------
const importData = async () => {
  await Promise.all([
    Review.deleteMany(),
    Order.deleteMany(),
    CartItem.deleteMany(),
    Product.deleteMany(),
    Category.deleteMany(),
    User.deleteMany(),
  ]);

  // User.create runs the pre-save hook so passwords are hashed.
  const createdUsers = await User.create(users);
  const createdCategories = await Category.create(categories);
  const createdProducts = await Product.create(buildProducts(createdCategories));

  console.log(
    `Seed data inserted: ${createdUsers.length} users, ${createdCategories.length} categories, ${createdProducts.length} products`
  );
};

const destroyData = async () => {
  await Promise.all([
    Review.deleteMany(),
    Order.deleteMany(),
    CartItem.deleteMany(),
    Product.deleteMany(),
    Category.deleteMany(),
    User.deleteMany(),
  ]);
  console.log('All data destroyed.');
};

const run = async () => {
  await connectDB();
  try {
    if (process.argv[2] === '--destroy' || process.argv[2] === '-d') {
      await destroyData();
    } else {
      await importData();
    }
  } catch (error) {
    console.error(`Seed error: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
