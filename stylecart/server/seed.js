const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectDB = require('./config/db');
const mongoose = require('mongoose');

const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const CartItem = require('./models/CartItem');
const Order = require('./models/Order');
const Review = require('./models/Review');

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------
const users = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@stylecart.com',
    password: 'password123',
    role: 'admin',
  },
  {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    password: 'password123',
    role: 'customer',
  },
];

const categories = [
  { name: 'T-Shirts', description: 'Everyday cotton tees', image: '' },
  { name: 'Jeans', description: 'Denim for every fit', image: '' },
  { name: 'Dresses', description: 'From casual to formal', image: '' },
  { name: 'Jackets', description: 'Layer up in style', image: '' },
];

// Products are built after categories exist so we can reference their ids.
const buildProducts = (categoryDocs) => {
  const byName = Object.fromEntries(categoryDocs.map((c) => [c.name, c._id]));
  return [
    {
      name: 'Classic Crew Tee',
      description: 'A soft, breathable cotton crew-neck t-shirt.',
      price: 24.99,
      category: byName['T-Shirts'],
      images: [],
      sizes: ['S', 'M', 'L', 'XL'],
      stock: 120,
    },
    {
      name: 'Slim Fit Jeans',
      description: 'Stretch denim with a modern slim silhouette.',
      price: 59.99,
      category: byName['Jeans'],
      images: [],
      sizes: ['S', 'M', 'L'],
      stock: 80,
    },
    {
      name: 'Summer Floral Dress',
      description: 'Lightweight floral dress perfect for warm days.',
      price: 79.99,
      category: byName['Dresses'],
      images: [],
      sizes: ['XS', 'S', 'M', 'L'],
      stock: 45,
    },
    {
      name: 'Denim Trucker Jacket',
      description: 'A timeless denim jacket that goes with everything.',
      price: 89.99,
      category: byName['Jackets'],
      images: [],
      sizes: ['M', 'L', 'XL', 'XXL'],
      stock: 60,
    },
  ];
};

// ---------------------------------------------------------------------------
// Import / destroy routines
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

  // create() triggers pre-save hooks (password hashing, slugs).
  await User.create(users);
  const categoryDocs = await Category.create(categories);
  await Product.create(buildProducts(categoryDocs));

  console.log('Data imported successfully.');
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
  console.log('Data destroyed successfully.');
};

const run = async () => {
  await connectDB();
  try {
    if (process.argv[2] === '--destroy' || process.argv[2] === '-d') {
      await destroyData();
    } else {
      await importData();
    }
    process.exit(0);
  } catch (error) {
    console.error(`Seed error: ${error.message}`);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

run();
