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

// Deterministic pseudo-random so seeds are reproducible run to run.
let seedCounter = 0;
const nextRand = () => {
  seedCounter += 1;
  const x = Math.sin(seedCounter) * 10000;
  return x - Math.floor(x);
};
const randInt = (min, max) => Math.floor(nextRand() * (max - min + 1)) + min;

const CLOTHING_SIZES = ['S', 'M', 'L', 'XL'];
const SHOE_SIZES = ['S', 'M', 'L'];

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
const categories = [
  { name: 'Men', description: "Men's clothing and essentials." },
  { name: 'Women', description: "Women's clothing and essentials." },
  { name: 'Accessories', description: 'Bags, watches, belts and more.' },
  { name: 'Footwear', description: 'Shoes, boots and sandals for every step.' },
  { name: 'Activewear', description: 'Performance gear for every workout.' },
];

// Per-category product blueprints. sizeKind decides which sizes apply.
const productBlueprints = {
  Men: {
    sizeKind: 'clothing',
    items: [
      { name: 'Classic Oxford Shirt', description: 'A crisp button-down Oxford in breathable cotton. Tailored for a smart-casual look that transitions from office to evening. A wardrobe staple.' },
      { name: 'Slim Fit Chinos', description: 'Versatile slim-fit chinos with a hint of stretch for all-day comfort. Cut clean through the leg and finished with a classic flat front.' },
      { name: 'Denim Jacket', description: 'A rugged denim trucker jacket with a timeless silhouette. Layers effortlessly over tees and hoodies through the shoulder seasons.' },
      { name: 'Wool Blend Blazer', description: 'A structured wool-blend blazer with notch lapels and a half-canvas front. Sharp enough for formal wear, relaxed enough for weekends.' },
      { name: 'Crew Neck T-Shirt', description: 'A soft combed-cotton crew tee with a modern regular fit. Pre-shrunk and built to hold its shape wash after wash.' },
      { name: 'Cargo Shorts', description: 'Durable cotton-twill cargo shorts with roomy utility pockets. Made for warm-weather adventures and everyday wear alike.' },
    ],
  },
  Women: {
    sizeKind: 'clothing',
    items: [
      { name: 'Floral Wrap Dress', description: 'A flowing wrap dress in a delicate floral print. The adjustable tie waist flatters every figure while the midi length keeps it elegant.' },
      { name: 'High-Rise Skinny Jeans', description: 'Sculpting high-rise skinny jeans in premium stretch denim. A flattering fit that hugs in all the right places and never bags out.' },
      { name: 'Silk Blouse', description: 'A luxurious mulberry-silk blouse with a fluid drape. Understated and refined, it dresses up trousers or denim with ease.' },
      { name: 'Pleated Midi Skirt', description: 'A graceful accordion-pleated midi skirt that moves beautifully. Sits at the natural waist for a polished, feminine silhouette.' },
      { name: 'Oversized Knit Sweater', description: 'A cozy oversized sweater in a chunky rib knit. Slouchy sleeves and a dropped shoulder make it the ultimate cold-weather comfort piece.' },
      { name: 'Linen Wide-Leg Pants', description: 'Airy wide-leg trousers in pure linen. Lightweight and breathable with a relaxed drape, perfect for warm days and easy styling.' },
    ],
  },
  Accessories: {
    sizeKind: 'onesize',
    items: [
      { name: 'Leather Crossbody Bag', description: 'A compact full-grain leather crossbody with an adjustable strap. Just the right size for your everyday essentials, hands-free.' },
      { name: 'Aviator Sunglasses', description: 'Timeless aviator sunglasses with polarized lenses and a lightweight metal frame. UV400 protection in a classic silhouette.' },
      { name: 'Classic Watch', description: 'A minimalist analog watch with a stainless-steel case and genuine leather band. Clean dial, quiet confidence, effortless style.' },
      { name: 'Wool Scarf', description: 'A soft brushed-wool scarf that adds warmth and texture. Generously sized to wrap, drape, or knot however the day demands.' },
      { name: 'Canvas Backpack', description: 'A rugged water-resistant canvas backpack with a padded laptop sleeve. Built for the commute and the weekend getaway alike.' },
      { name: 'Leather Belt', description: 'A refined full-grain leather belt with a polished buckle. A subtle finishing touch that works with tailoring and denim.' },
    ],
  },
  Footwear: {
    sizeKind: 'shoes',
    items: [
      { name: 'White Leather Sneakers', description: 'Clean minimalist sneakers in premium white leather. A cushioned footbed keeps them comfortable from morning to night.' },
      { name: 'Chelsea Boots', description: 'Sleek leather Chelsea boots with elastic side panels and a pull tab. A versatile ankle boot that elevates any outfit.' },
      { name: 'Running Shoes', description: 'Lightweight running shoes with responsive foam cushioning and a breathable mesh upper. Engineered for miles of comfort.' },
      { name: 'Strappy Sandals', description: 'Elegant strappy sandals with a comfortable block heel. The perfect finishing touch for warm evenings and special occasions.' },
      { name: 'Loafers', description: 'Classic penny loafers in supple leather with a hand-stitched apron toe. Slip-on sophistication for work or weekend.' },
      { name: 'Hiking Boots', description: 'Sturdy waterproof hiking boots with aggressive grip and ankle support. Ready for the trail in any weather.' },
    ],
  },
  Activewear: {
    sizeKind: 'clothing',
    items: [
      { name: 'Yoga Leggings', description: 'High-rise yoga leggings in a buttery four-way stretch fabric. Squat-proof, sweat-wicking, and comfortable through every pose.' },
      { name: 'Performance Tank Top', description: 'A breathable performance tank with moisture-wicking mesh panels. Keeps you cool and dry through the toughest sessions.' },
      { name: 'Track Jacket', description: 'A lightweight zip-up track jacket with a slim athletic cut. Great for warm-ups, cool-downs, and everything in between.' },
      { name: 'Sports Bra', description: 'A medium-support sports bra with removable padding and a racerback design. Locks in support without sacrificing comfort.' },
      { name: 'Running Shorts', description: 'Quick-dry running shorts with a built-in liner and hidden pocket. Designed for freedom of movement on every run.' },
      { name: 'Compression Tights', description: 'Full-length compression tights that support muscles and boost recovery. A snug, second-skin fit for high-intensity training.' },
    ],
  },
};

const sizesFor = (sizeKind) => {
  if (sizeKind === 'clothing') return CLOTHING_SIZES;
  if (sizeKind === 'shoes') return SHOE_SIZES;
  return []; // one-size accessories carry no sizes
};

// Build the 30 product docs. A few get low/zero stock and one is inactive,
// for edge-case testing.
const buildProducts = (categoryDocs) => {
  const byName = Object.fromEntries(categoryDocs.map((c) => [c.name, c._id]));
  const products = [];
  let index = 0;

  for (const [catName, blueprint] of Object.entries(productBlueprints)) {
    for (const item of blueprint.items) {
      index += 1;
      const slug = slugify(item.name);

      // Edge cases: products #5 and #12 out of stock, #19 very low stock.
      let stock;
      if (index === 5 || index === 12) stock = 0;
      else if (index === 19) stock = 2;
      else stock = randInt(5, 100);

      // Product #25 is inactive.
      const isActive = index !== 25;

      const price = Number((randInt(1999, 19999) / 100).toFixed(2));

      products.push({
        name: item.name,
        slug,
        description: item.description,
        price,
        category: byName[catName],
        images: [
          `https://picsum.photos/seed/${slug}/400/500`,
          `https://picsum.photos/seed/${slug}2/400/500`,
        ],
        sizes: sizesFor(blueprint.sizeKind),
        stock,
        isActive,
      });
    }
  }

  return products;
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
