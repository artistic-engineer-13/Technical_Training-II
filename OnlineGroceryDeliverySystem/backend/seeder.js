import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

// Models
import User from './models/User.js';
import Category from './models/Category.js';
import Product from './models/Product.js';
import DeliveryPartner from './models/DeliveryPartner.js';

dotenv.config();

// Connect DB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/online-grocery');

const categoriesData = [
  { name: 'Fresh Fruits', icon: 'RiAppleLine', image: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=500&q=80', description: 'Fresh organic farm fruits' },
  { name: 'Fresh Vegetables', icon: 'RiLeafLine', image: 'https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=500&q=80', description: 'Crisp green farm fresh vegetables' },
  { name: 'Dairy & Milk', icon: 'RiCupLine', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&q=80', description: 'Pure milk, butter, paneer and cheese' },
  { name: 'Bread & Eggs', icon: 'RiCakeLine', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80', description: 'Fresh bakery bread slices and farm eggs' },
  { name: 'Cold Drinks & Sodas', icon: 'RiCupFill', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80', description: 'Chilled soft drinks, sodas, and energy drinks' },
  { name: 'Juices & Smoothies', icon: 'RiDropLine', image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500&q=80', description: 'Pure fruit juices and healthy smoothies' },
  { name: 'Snacks & Chips', icon: 'RiShoppingBag3Line', image: 'https://images.unsplash.com/photo-1599490659273-e316c12db935?w=500&q=80', description: 'Crunchy potato chips, nachos, and crackers' },
  { name: 'Chocolates & Sweets', icon: 'RiHeartLine', image: 'https://images.unsplash.com/photo-1548907040-4d42b5212510?w=500&q=80', description: 'Premium chocolates, bars, and traditional sweets' },
  { name: 'Ice Cream & Desserts', icon: 'RiIceCreamLine', image: 'https://images.unsplash.com/photo-1501443782917-cfc57388fe6b?w=500&q=80', description: 'Chilled delicious ice creams and cups' },
  { name: 'Tea & Coffee', icon: 'RiCupLine', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80', description: 'Premium tea leaves, dust, and roasted coffee blends' },
  { name: 'Rice & Grains', icon: 'RiListCheck2', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80', description: 'Basmati rice, brown rice, grains and millets' },
  { name: 'Atta & Flour', icon: 'RiArchiveLine', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80', description: 'Whole wheat flour, maida, sooji, and besan' },
  { name: 'Pulses & Dals', icon: 'RiMenuFoldLine', image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&q=80', description: 'Healthy dals, pulses, and rajma lentils' },
  { name: 'Edible Oils & Ghee', icon: 'RiDropFill', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80', description: 'Mustard oil, sunflower oil, and pure cow ghee' },
  { name: 'Spices & Masalas', icon: 'RiFireLine', image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&q=80', description: 'Indian spices powder, turmeric, and whole masalas' },
  { name: 'Instant Food', icon: 'RiTimerLine', image: 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=500&q=80', description: 'Ready-to-eat meals, soups, and mixes' },
  { name: 'Noodles & Pasta', icon: 'RiSettings4Line', image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&q=80', description: 'Instant noodles, spaghetti, and macaroni pasta' },
  { name: 'Frozen Food', icon: 'RiSnowflakeLine', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500&q=80', description: 'Frozen peas, french fries, and nuggets' },
  { name: 'Dry Fruits & Nuts', icon: 'RiInboxUnarchiveLine', image: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=500&q=80', description: 'Almonds, cashews, raisins and walnuts' },
  { name: 'Organic Foods', icon: 'RiLeafLine', image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&q=80', description: 'Certified chemical-free organic groceries' },
  { name: 'Personal Care', icon: 'RiUserLine', image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=500&q=80', description: 'Soaps, body wash, shampoos and toothpastes' },
  { name: 'Beauty & Grooming', icon: 'RiScissorsCutLine', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80', description: 'Cosmetics, skin serums, and shaving creams' },
  { name: 'Home Cleaning', icon: 'RiSparklingLine', image: 'https://images.unsplash.com/photo-1585421514738-ee3468457b5b?w=500&q=80', description: 'Floor cleaners, glass cleaners, and toilet liquids' },
  { name: 'Detergents & Fabric', icon: 'RiTShirtAirLine', image: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=500&q=80', description: 'Washing powders, liquid detergents, and conditioners' },
  { name: 'Baby Care', icon: 'RiUserHeartLine', image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=500&q=80', description: 'Baby diapers, wipes, powder and baby lotions' },
  { name: 'Pet Food', icon: 'RiHeartFill', image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&q=80', description: 'Premium dog food, cat food, and pet snacks' }
];

// Curated Unsplash images for products to prevent broken images
const productTemplates = {
  'Fresh Fruits': [
    ['Shimla Apple Red', 'FarmFresh', 'Sweet crisp Kashmiri apples.', 180, 149, '1 kg', 40, true, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&q=80', '10 mins', true, true, false, false],
    ['Fresh Cavendish Bananas', 'FarmFresh', 'Sweet ripe yellow bananas rich in potassium.', 60, 49, '1 dozen', 90, true, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&q=80', '12 mins', false, true, true, false],
    ['Nagpur Orange', 'FarmFresh', 'Tangy sweet oranges full of Vitamin C.', 120, 99, '1 kg', 60, true, 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=500&q=80', '9 mins', false, false, false, false],
    ['Anar Pomegranate', 'FarmFresh', 'High-quality red rubies pomegranates.', 250, 219, '1 kg', 30, true, 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&q=80', '15 mins', true, false, true, false],
    ['Premium Alphonso Mango', 'KingFruits', 'Sweet mangoes, direct from Devgad farms.', 600, 499, '6 pcs', 25, true, 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&q=80', '10 mins', true, true, true, false],
    ['Green Seedless Grapes', 'FarmFresh', 'Sweet juicy green seedless grapes.', 160, 129, '500 g', 45, true, 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=500&q=80', '11 mins', false, false, false, false],
    ['Papaya Semi-Ripe', 'FarmFresh', 'Rich in digestive enzymes papayas.', 90, 79, '1 pc (approx 1kg)', 35, true, 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=500&q=80', '14 mins', false, false, false, false],
    ['Fresh Kiwi Import', 'FarmFresh', 'Tangy green slices kiwi packed with Vitamin E.', 140, 119, '3 pcs', 40, true, 'https://images.unsplash.com/photo-1585059895524-72359e061381?w=500&q=80', '10 mins', false, false, false, false],
    ['Fresh Pineapple Queen', 'FarmFresh', 'Sweet juicy large pineapple.', 110, 89, '1 pc', 20, true, 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=500&q=80', '13 mins', false, false, false, false],
    ['Premium Strawberry Pack', 'Berryland', 'Sweet handpicked strawberries.', 220, 179, '200 g', 30, true, 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&q=80', '12 mins', true, true, false, false]
  ],
  'Fresh Vegetables': [
    ['Potato Jyoti New', 'FarmFresh', 'Fresh organic local cooking potatoes.', 45, 32, '1 kg', 200, true, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&q=80', '10 mins', false, true, true, false],
    ['Hybrid Tomato', 'FarmFresh', 'Juicy red cooking tomatoes.', 60, 45, '1 kg', 150, true, 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=500&q=80', '9 mins', false, true, true, false],
    ['Onion Local Nashik', 'FarmFresh', 'High-quality Nashik pink onions.', 50, 39, '1 kg', 180, true, 'https://images.unsplash.com/photo-1508747703725-719ae2c73ee8?w=500&q=80', '10 mins', false, true, true, false],
    ['English Cucumber', 'FarmFresh', 'Crisp local salad cucumbers.', 55, 39, '500 g', 100, true, 'https://images.unsplash.com/photo-1449300079324-964320ded47c?w=500&q=80', '11 mins', false, false, false, false],
    ['Fresh Cauliflower', 'FarmFresh', 'Clean chemical-free large cauliflower heads.', 70, 49, '1 pc (approx 600g)', 60, true, 'https://images.unsplash.com/photo-1568584711271-6c929fb49b60?w=500&q=80', '12 mins', false, false, false, false],
    ['Green Capsicum Bellpepper', 'FarmFresh', 'Crisp green bell pepper for stir fry.', 60, 48, '250 g', 80, true, 'https://images.unsplash.com/photo-1563565088-91349b8114f6?w=500&q=80', '11 mins', false, false, false, false],
    ['Coriander Leaves Bunch', 'FarmFresh', 'Fresh leafy greens for garnishing.', 20, 12, '1 bunch', 250, true, 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=500&q=80', '9 mins', false, true, false, false],
    ['Fresh Ginger Adrak', 'FarmFresh', 'Strong flavor fresh root ginger.', 80, 59, '250 g', 90, true, 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500&q=80', '12 mins', false, false, false, false],
    ['Local Garlic Lehsun', 'FarmFresh', 'Aromatic garlic cloves pack.', 90, 75, '200 g', 110, true, 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=500&q=80', '10 mins', false, false, false, false],
    ['Bhindi Lady Finger', 'FarmFresh', 'Fresh tender green okra ladies finger.', 50, 39, '500 g', 75, true, 'https://images.unsplash.com/photo-1464454709131-ffd692ba94eb?w=500&q=80', '10 mins', false, false, false, false]
  ],
  'Dairy & Milk': [
    ['Amul Taaza Toned Milk', 'Amul', 'Pasteurized toned milk packet.', 28, 27, '500 ml', 300, true, 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&q=80', '10 mins', false, true, true, false],
    ['Amul Gold Full Cream Milk', 'Amul', 'Pasteurized rich full cream milk packet.', 34, 33, '500 ml', 250, true, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&q=80', '10 mins', false, true, true, false],
    ['Amul Butter Salted', 'Amul', 'Creamy salted table butter block.', 115, 106, '100 g', 180, true, 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&q=80', '11 mins', true, true, true, false],
    ['Amul Fresh Paneer', 'Amul', 'Rich soft fresh cottage cheese block.', 90, 85, '200 g', 95, true, 'https://images.unsplash.com/photo-1628207615316-45584fad1c6c?w=500&q=80', '12 mins', true, false, true, false],
    ['Mother Dairy Curd Masti', 'MotherDairy', 'Rich creamy curd dahi tub.', 50, 46, '400 g', 120, true, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&q=80', '10 mins', false, false, false, false],
    ['Amul Cheese Slices Pack', 'Amul', 'Processed cheese slices packet.', 150, 138, '100 g', 80, true, 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=500&q=80', '11 mins', false, false, true, false],
    ['Nandini Pure Ghee Pack', 'Nandini', 'Pure golden cow ghee.', 330, 310, '500 ml', 70, true, 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&q=80', '13 mins', false, false, false, false],
    ['Hersheys Chocolate Milkshake', 'Hersheys', 'Rich chocolate flavored milk drink.', 45, 39, '200 ml', 100, true, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&q=80', '10 mins', false, false, false, false],
    ['Amul Fresh Cream Pack', 'Amul', 'Low-fat fresh cream for cooking.', 70, 64, '250 ml', 60, true, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&q=80', '12 mins', false, false, false, false],
    ['Yakult Probiotic Drink', 'Yakult', 'Probiotic health drink bottles pack.', 90, 85, '5 pcs', 50, true, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&q=80', '10 mins', false, true, false, false]
  ],
  'Bread & Eggs': [
    ['Britannia Premium Sandwich Bread', 'Britannia', 'Soft white bread slices pack.', 50, 42, '400 g', 150, true, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80', '10 mins', false, true, true, false],
    ['Harvest Gold Brown Bread', 'HarvestGold', 'High-fiber wheat brown bread.', 55, 48, '400 g', 120, true, 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=500&q=80', '10 mins', false, true, true, false],
    ['Fresh Farm White Eggs', 'FarmFresh', 'High protein clean farm white eggs.', 90, 78, '6 pcs', 200, false, 'https://images.unsplash.com/photo-1516448424440-5743b10a9508?w=500&q=80', '11 mins', true, true, true, false],
    ['Organic Brown Eggs Pack', 'OrganicInd', 'Free-range organic brown chicken eggs.', 150, 135, '6 pcs', 90, false, 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=500&q=80', '12 mins', false, false, false, true],
    ['Wibs Sandwich Large Bread', 'Wibs', 'Local favorite fresh bread loaf.', 40, 36, '400 g', 100, true, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80', '10 mins', false, false, false, false],
    ['Amul Garlic Bread Loaf', 'Amul', 'Fresh bakery garlic bread.', 60, 52, '200 g', 40, true, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80', '14 mins', false, false, false, false],
    ['English Oven Burger Buns', 'EnglishOven', 'Soft sesame burger buns pack.', 45, 38, '2 pcs', 80, true, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80', '11 mins', false, false, false, false],
    ['Britannia Fruit Buns Pack', 'Britannia', 'Sweet baked buns loaded with tutti frutti.', 35, 29, '150 g', 60, true, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80', '12 mins', false, false, false, false],
    ['Table Butter Croissants', 'FreshBakery', 'Flaky butter baked croissants.', 120, 99, '2 pcs', 30, true, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&q=80', '15 mins', true, false, false, false],
    ['Wheat Pizza Base Pack', 'EnglishOven', 'Ready-to-bake whole wheat pizza crusts.', 50, 42, '2 pcs', 50, true, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80', '13 mins', false, false, false, false]
  ],
  'Cold Drinks & Sodas': [
    ['Coca-Cola Original Can', 'CocaCola', 'Chilled carbonated soft drink can.', 40, 36, '300 ml', 300, true, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80', '10 mins', false, true, true, false],
    ['Pepsi Soda Can', 'Pepsi', 'Chilled cola soft drink.', 40, 35, '300 ml', 250, true, 'https://images.unsplash.com/photo-1531749668029-2db88e4b76ce?w=500&q=80', '10 mins', false, false, false, false],
    ['Thums Up Strong Cola', 'ThumsUp', 'Strong fizzy carbonated cola.', 45, 40, '250 ml', 200, true, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80', '10 mins', false, true, true, false],
    ['Sprite Lime Soda', 'Sprite', 'Clear crisp lemon-lime fizzy soda.', 40, 36, '300 ml', 180, true, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80', '10 mins', false, false, false, false],
    ['Monster Energy Original Drink', 'Monster', 'Carbonated energy drink with taurine.', 125, 115, '350 ml', 95, true, 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&q=80', '10 mins', true, true, true, false],
    ['Red Bull Energy Drink', 'RedBull', 'Vitalizes body and mind energy drink.', 125, 119, '250 ml', 120, true, 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=500&q=80', '10 mins', true, true, true, false],
    ['Kinley Club Soda Can', 'Kinley', 'Carbonated plain soda sparkling water.', 25, 22, '300 ml', 150, true, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80', '10 mins', false, false, false, false],
    ['Bisleri Mineral Water Bottle', 'Bisleri', 'Safe packaged drinking mineral water.', 20, 18, '1 Litre', 500, true, 'https://images.unsplash.com/photo-1608885898957-a599fb18ec3d?w=500&q=80', '10 mins', false, true, true, false],
    ['7Up Lemon Fizz Soda', '7Up', 'Refreshing lime and lemon soda bottle.', 45, 40, '750 ml', 85, true, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80', '11 mins', false, false, false, false],
    ['Fanta Orange Can', 'Fanta', 'Fizzy carbonated orange flavor soft drink.', 40, 36, '300 ml', 120, true, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80', '10 mins', false, false, false, false]
  ],
  'Juices & Smoothies': [
    ['Tropicana 100% Orange Juice', 'Tropicana', 'Pure squeezed orange juice, no sugar.', 130, 115, '1 Litre', 80, true, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500&q=80', '10 mins', true, true, true, false],
    ['Real Fruit Juice Mixed Fruit', 'Real', 'Delicious blend of 9 fruits juice.', 125, 110, '1 Litre', 100, true, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500&q=80', '10 mins', false, true, true, false],
    ['Paper Boat Aamras', 'PaperBoat', 'Mango pulp rich sweet traditional juice.', 45, 38, '250 ml', 150, true, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500&q=80', '9 mins', false, false, false, false],
    ['Real Fruit Power Cranberry', 'Real', 'Tangy active cranberry juice beverage.', 130, 115, '1 Litre', 60, true, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500&q=80', '10 mins', false, false, false, false],
    ['B Natural Guava Juice', 'BNatural', 'Rich thick guava juice with pink guava pulp.', 110, 95, '1 Litre', 70, true, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500&q=80', '11 mins', false, false, false, false],
    ['Paper Boat Anar Juice', 'PaperBoat', 'Healthy sweet pomegranate juice pack.', 50, 42, '250 ml', 90, true, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500&q=80', '10 mins', false, false, false, false],
    ['Epigamia Strawberry Greek Yogurt Smoothie', 'Epigamia', 'Creamy greek yogurt smoothie.', 80, 72, '200 ml', 50, true, 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&q=80', '11 mins', true, false, false, false],
    ['Epigamia Alphonso Mango Smoothie', 'Epigamia', 'Thick mango greek yogurt smoothie.', 80, 72, '200 ml', 45, true, 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&q=80', '12 mins', false, false, false, false],
    ['Raw Pressery Cold Pressed Sugarcane Juice', 'RawPressery', 'Clean cold pressed sugarcane juice.', 80, 70, '250 ml', 40, true, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500&q=80', '10 mins', true, true, false, false],
    ['Aloe Vera Orange Juice Pack', 'AloeActive', 'Healthy aloe vera juice with orange pulp.', 140, 119, '1 Litre', 30, true, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500&q=80', '14 mins', false, false, false, false]
  ],
  'Snacks & Chips': [
    ['Lays Potato Chips India Magic Masala', 'Lays', 'Spicy classic Indian masala potato chips.', 20, 19, '50 g', 500, true, 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&q=80', '10 mins', false, true, true, false],
    ['Lays American Style Cream Onion', 'Lays', 'Sweet onion sour cream potato chips.', 20, 19, '50 g', 400, true, 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&q=80', '10 mins', false, false, true, false],
    ['Kurkure Masala Munch Crunchy', 'Kurkure', 'Spicy crunchy corn puffs snack.', 20, 18, '90 g', 350, true, 'https://images.unsplash.com/photo-1599490659273-e316c12db935?w=500&q=80', '9 mins', false, true, true, false],
    ['Doritos Nacho Cheese Tortilla Chips', 'Doritos', 'Cheesy crunchy Mexican tortilla chips.', 35, 32, '60 g', 180, true, 'https://images.unsplash.com/photo-1518047601542-79f18c655718?w=500&q=80', '10 mins', true, true, true, false],
    ['Haldirams Bhujia Sev Pack', 'Haldirams', 'Classic crispy moth beans fried noodles bhujia.', 110, 99, '400 g', 150, true, 'https://images.unsplash.com/photo-1599490659273-e316c12db935?w=500&q=80', '11 mins', false, true, true, false],
    ['Haldirams Aloo Bhujia', 'Haldirams', 'Crunchy potato bhujia sev snack.', 110, 99, '400 g', 160, true, 'https://images.unsplash.com/photo-1599490659273-e316c12db935?w=500&q=80', '10 mins', false, true, true, false],
    ['Bingo Mad Angles Achari Masti', 'Bingo', 'Tangy pickle flavored triangles chips.', 20, 19, '80 g', 120, true, 'https://images.unsplash.com/photo-1599490659273-e316c12db935?w=500&q=80', '10 mins', false, false, false, false],
    ['Too Yumm Karare Munch Chilli', 'TooYumm', 'Baked non-fried healthy spicy curls.', 30, 27, '70 g', 80, true, 'https://images.unsplash.com/photo-1599490659273-e316c12db935?w=500&q=80', '12 mins', false, false, false, false],
    ['Pringles Potato Chips Sour Cream', 'Pringles', 'Premium stacked potato chips canister.', 120, 109, '110 g', 95, true, 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&q=80', '10 mins', true, true, true, false],
    ['Haldirams Moong Dal Fried', 'Haldirams', 'Salty fried yellow split moong dal.', 45, 39, '150 g', 100, true, 'https://images.unsplash.com/photo-1599490659273-e316c12db935?w=500&q=80', '10 mins', false, false, false, false]
  ],
  'Chocolates & Sweets': [
    ['Cadbury Dairy Milk Silk Chocolate', 'Cadbury', 'Smooth rich creamy milk chocolate bar.', 80, 72, '60 g', 200, true, 'https://images.unsplash.com/photo-1548907040-4d42b5212510?w=500&q=80', '10 mins', true, true, true, false],
    ['Nestle Kitkat 4 Finger Bar', 'Nestle', 'Crispy wafer fingers covered in milk chocolate.', 30, 28, '38 g', 250, true, 'https://images.unsplash.com/photo-1548907040-4d42b5212510?w=500&q=80', '10 mins', false, true, true, false],
    ['Cadbury 5 Star Chocolate Bar', 'Cadbury', 'Chewy caramel chocolate bar.', 20, 19, '40 g', 300, true, 'https://images.unsplash.com/photo-1548907040-4d42b5212510?w=500&q=80', '10 mins', false, false, true, false],
    ['Ferrero Rocher Chocolates Pack', 'FerreroRocher', 'Premium whole hazelnut chocolate crisp pralines.', 520, 480, '16 pcs', 45, true, 'https://images.unsplash.com/photo-1549007994-cb92ca7a4b2a?w=500&q=80', '12 mins', true, true, true, false],
    ['Snickers Peanut Chocolate Bar', 'Snickers', 'Peanut nougat chocolate bar for hunger.', 50, 45, '50 g', 180, true, 'https://images.unsplash.com/photo-1548907040-4d42b5212510?w=500&q=80', '9 mins', false, false, true, false],
    ['Haldirams Kaju Katli Pack', 'Haldirams', 'Traditional Indian cashew sweets.', 350, 310, '250 g', 60, true, 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&q=80', '15 mins', true, false, true, false],
    ['Amul Dark Chocolate Cocoa 75%', 'Amul', 'Rich dark chocolate bar, cocoa active.', 110, 99, '150 g', 75, true, 'https://images.unsplash.com/photo-1548907040-4d42b5212510?w=500&q=80', '11 mins', true, false, false, false],
    ['Hersheys Kisses Milk Chocolate', 'Hersheys', 'Bite-sized drops of milk chocolate pack.', 140, 125, '100 g', 65, true, 'https://images.unsplash.com/photo-1548907040-4d42b5212510?w=500&q=80', '12 mins', false, false, false, false],
    ['Kinder Joy Boy Toy Chocolate', 'Kinder', 'Creamy chocolate spread with wafer balls.', 45, 43, '20 g', 120, true, 'https://images.unsplash.com/photo-1548907040-4d42b5212510?w=500&q=80', '10 mins', false, true, false, false],
    ['Haldirams Gulab Jamun Tin', 'Haldirams', 'Sweet soft spongy gulab jamun balls in syrup.', 240, 199, '1 kg', 80, true, 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&q=80', '15 mins', false, false, false, false]
  ],
  'Ice Cream & Desserts': [
    ['Amul Vanilla Magic Ice Cream', 'Amul', 'Classic rich vanilla ice cream tub.', 160, 140, '1 Litre', 120, true, 'https://images.unsplash.com/photo-1501443782917-cfc57388fe6b?w=500&q=80', '11 mins', false, true, true, false],
    ['Amul Belgian Chocolate Tub', 'Amul', 'Rich Belgian chocolate premium ice cream.', 220, 199, '1 Litre', 95, true, 'https://images.unsplash.com/photo-1501443782917-cfc57388fe6b?w=500&q=80', '12 mins', true, true, true, false],
    ['Kwalls Cornetto Double Chocolate', 'Kwalls', 'Crispy cone loaded with chocolate scoop.', 40, 36, '1 pc', 200, true, 'https://images.unsplash.com/photo-1501443782917-cfc57388fe6b?w=500&q=80', '10 mins', false, true, true, false],
    ['Amul Choco Bar Ice Cream', 'Amul', 'Chocolate coated vanilla ice bar stick.', 20, 19, '1 pc', 250, true, 'https://images.unsplash.com/photo-1501443782917-cfc57388fe6b?w=500&q=80', '10 mins', false, false, true, false],
    ['Havmor Kulfi Ice Cream Stick', 'Havmor', 'Indian traditional cardamom kulfi ice stick.', 35, 30, '1 pc', 150, true, 'https://images.unsplash.com/photo-1501443782917-cfc57388fe6b?w=500&q=80', '10 mins', false, false, false, false],
    ['Amul Tricone Butterscotch', 'Amul', 'Butterscotch creamy tricone ice cream.', 45, 40, '1 pc', 180, true, 'https://images.unsplash.com/photo-1501443782917-cfc57388fe6b?w=500&q=80', '10 mins', false, false, false, false],
    ['Kwalls Shahi Kulfi Tub', 'Kwalls', 'Rich traditional milk kulfi ice cream tub.', 200, 175, '1 Litre', 70, true, 'https://images.unsplash.com/photo-1501443782917-cfc57388fe6b?w=500&q=80', '12 mins', false, false, false, false],
    ['Baskin Robbins Mississippi Mud Tub', 'BaskinRobbins', 'Ultra premium chocolate fudge ice cream.', 399, 360, '450 ml', 40, true, 'https://images.unsplash.com/photo-1501443782917-cfc57388fe6b?w=500&q=80', '13 mins', true, false, false, false],
    ['Amul Cassata Ice Cream Slice', 'Amul', 'Multi-layered fruit and nut ice cream slice.', 60, 52, '1 pc', 85, true, 'https://images.unsplash.com/photo-1501443782917-cfc57388fe6b?w=500&q=80', '12 mins', false, false, false, false],
    ['Mother Dairy Choco Sundae Cup', 'MotherDairy', 'Delicious chocolate sundae ice cream cup.', 35, 30, '1 pc', 110, true, 'https://images.unsplash.com/photo-1501443782917-cfc57388fe6b?w=500&q=80', '10 mins', false, false, false, false]
  ],
  'Tea & Coffee': [
    ['Tata Tea Premium Pack', 'TataTea', 'High-quality loose tea leaf dust.', 230, 209, '500 g', 180, true, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80', '10 mins', false, true, true, false],
    ['Red Label Natural Care Tea', 'RedLabel', 'Tea leaf dust mixed with ginger, tulsi, ashwagandha.', 250, 229, '500 g', 160, true, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80', '10 mins', false, false, true, false],
    ['Nescafe Classic Instant Coffee', 'Nescafe', 'Pure instant soluble coffee powder jar.', 320, 299, '100 g', 120, true, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80', '11 mins', true, true, true, false],
    ['Bru Gold Instant Coffee', 'Bru', 'Rich aromatic instant coffee powder glass jar.', 300, 275, '100 g', 100, true, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80', '11 mins', false, false, false, false],
    ['Taj Mahal Loose Leaf Tea', 'TajMahal', 'Premium rich aroma CTC tea leaf pack.', 390, 355, '500 g', 80, true, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80', '12 mins', true, false, false, false],
    ['Wagh Bakri Strong Tea Pack', 'WaghBakri', 'Strong CTC black tea leaves.', 240, 219, '500 g', 130, true, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80', '10 mins', false, false, false, false],
    ['Society Tea Dust Pack', 'SocietyTea', 'Strong local favorite tea dust.', 220, 199, '500 g', 140, true, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80', '10 mins', false, false, false, false],
    ['Davidoff Rich Aroma Ground Coffee', 'Davidoff', 'Imported luxury roasted coffee beans jar.', 599, 549, '100 g', 40, true, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80', '14 mins', true, false, true, false],
    ['Tetley Green Tea Lemon Ginger', 'Tetley', 'Healthy green tea tea bags packet.', 180, 158, '25 bags', 95, true, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80', '10 mins', false, true, false, false],
    ['Lipton Green Tea Honey Lemon', 'Lipton', 'Pure light green tea bags packet.', 175, 149, '25 bags', 110, true, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80', '10 mins', false, false, false, false]
  ],
  'Rice & Grains': [
    ['Daawat Rozana Basmati Rice', 'Daawat', 'Everyday cooking long grain basmati rice.', 110, 89, '1 kg', 180, true, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80', '10 mins', false, true, true, false],
    ['India Gate Super Basmati Rice', 'IndiaGate', 'Super long aged basmati rice grains.', 220, 189, '1 kg', 120, true, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80', '11 mins', true, true, true, false],
    ['India Gate Feast Basmati', 'IndiaGate', 'Biryani cooking long grain rice.', 130, 105, '1 kg', 140, true, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80', '10 mins', false, false, false, false],
    ['Kolam Rice Super Quality', 'FarmFresh', 'Short grain white daily eating rice.', 90, 75, '1 kg', 250, true, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80', '10 mins', false, true, false, false],
    ['Brown Rice Whole Grain', 'OrganicInd', 'Unpolished rich fiber brown rice.', 160, 139, '1 kg', 90, true, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80', '12 mins', false, false, false, true],
    ['Organic Foxtail Millet Kangni', 'OrganicInd', 'Healthy low glycemic foxtail millets.', 120, 99, '500 g', 65, true, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80', '13 mins', false, false, false, true],
    ['Aashirvaad Superior MP Wheat', 'Aashirvaad', 'Unmilled superior Madhya Pradesh wheat grains.', 80, 68, '1 kg', 80, true, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80', '12 mins', false, false, false, false],
    ['Pro Nature Organic Brown Basmati', 'ProNature', 'Certified organic brown basmati rice.', 240, 219, '1 kg', 40, true, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80', '14 mins', false, false, false, true],
    ['Duraly Cracked Wheat Lapsi Fada', 'FarmFresh', 'Cracked wheat lapsi sooji fada.', 50, 42, '500 g', 110, true, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80', '11 mins', false, false, false, false],
    ['Quinoa White Grain Pack', 'TrueElements', 'Premium high-protein white quinoa.', 299, 249, '500 g', 50, true, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80', '13 mins', true, false, false, false]
  ],
  'Atta & Flour': [
    ['Aashirvaad Shudh Chakki Atta', 'Aashirvaad', '100% whole wheat shudh chakki atta.', 260, 239, '5 kg', 200, true, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80', '10 mins', true, true, true, false],
    ['Fortune Chakki Fresh Atta', 'Fortune', 'Chakki fresh whole wheat flour.', 250, 225, '5 kg', 180, true, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80', '10 mins', false, false, true, false],
    ['Rajdhani Besan Pack', 'Rajdhani', 'Pure chana dal gram chickpea flour.', 60, 52, '500 g', 160, true, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80', '11 mins', false, true, true, false],
    ['Rajdhani Sooji Rava', 'Rajdhani', 'Coarse wheat semolina sooji rava.', 35, 29, '500 g', 120, true, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80', '11 mins', false, false, false, false],
    ['Aashirvaad Multigrain Atta', 'Aashirvaad', 'Multi-grain wheat blend flour (soya, oats, chana).', 320, 295, '5 kg', 90, true, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80', '12 mins', true, false, true, false],
    ['Organic Tattva Ragi Flour', 'OrganicTattva', 'Healthy finger millet ragi flour.', 70, 59, '500 g', 75, true, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80', '13 mins', false, false, false, true],
    ['Rajdhani Maida Refined Flour', 'Rajdhani', 'Super-fine wheat refined maida flour.', 35, 30, '500 g', 130, true, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80', '11 mins', false, false, false, false],
    ['Pillsbury Chakki Fresh Atta', 'Pillsbury', 'Chakki fresh multi-fiber whole wheat flour.', 265, 245, '5 kg', 100, true, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80', '10 mins', false, false, false, false],
    ['Pro Nature Organic Wheat Atta', 'ProNature', 'Certified organic chakki whole wheat flour.', 310, 279, '5 kg', 50, true, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80', '14 mins', false, false, false, true],
    ['Organic Rice Flour Pack', 'OrganicTattva', 'Fine milled gluten-free white rice flour.', 55, 48, '500 g', 60, true, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80', '12 mins', false, false, false, true]
  ],
  'Pulses & Dals': [
    ['Tata Sampann Toor Dal Chana', 'TataSampann', 'Unpolished split yellow pigeon peas pigeon peas.', 110, 95, '500 g', 150, true, 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&q=80', '10 mins', false, true, true, false],
    ['Tata Sampann Moong Dal Split', 'TataSampann', 'Unpolished split yellow moong dal.', 105, 92, '500 g', 120, true, 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&q=80', '10 mins', false, true, true, false],
    ['Tata Sampann Kabuli Chana Large', 'TataSampann', 'Premium white chickpeas kabuli chana.', 120, 105, '500 g', 110, true, 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&q=80', '11 mins', true, false, true, false],
    ['Rajma Chitra Kidney Beans', 'FarmFresh', 'High-quality Kashmiri rajma kidney beans.', 95, 82, '500 g', 95, true, 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&q=80', '12 mins', false, false, false, false],
    ['Organic Urad Dal Split White', 'OrganicInd', 'Split black gram deskinned white urad dal.', 115, 99, '500 g', 85, true, 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&q=80', '12 mins', false, false, false, true],
    ['Masoor Dal Split Orange', 'FarmFresh', 'Split orange red lentils masoor dal.', 70, 59, '500 g', 130, true, 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&q=80', '10 mins', false, false, false, false],
    ['Tata Sampann Black Urad Sabut', 'TataSampann', 'Whole black gram urad dal sabut.', 100, 89, '500 g', 75, true, 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&q=80', '11 mins', false, false, false, false],
    ['Organic Chana Dal Yellow', 'OrganicTattva', 'Unpolished organic split yellow chana dal.', 80, 68, '500 g', 100, true, 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&q=80', '11 mins', false, false, false, true],
    ['Brown Chana Kala Vatana', 'FarmFresh', 'Whole brown gram kala chana.', 60, 48, '500 g', 120, true, 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&q=80', '11 mins', false, false, false, false],
    ['Green Moong Sabut Whole', 'FarmFresh', 'Whole green gram split mung bean.', 90, 75, '500 g', 90, true, 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&q=80', '10 mins', false, false, false, false]
  ],
  'Edible Oils & Ghee': [
    ['Fortune Mustard Oil Kachi Ghani', 'Fortune', 'Pure kachi ghani mustard oil bottle.', 180, 169, '1 Litre', 200, true, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80', '10 mins', true, true, true, false],
    ['Fortune Soya Health Sunflower Oil', 'Fortune', 'Refined soyabean health oil packet.', 140, 129, '1 Litre', 250, true, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80', '10 mins', false, true, true, false],
    ['Amul Cow Ghee Tin', 'Amul', 'Pure traditional cow milk ghee tin.', 650, 610, '1 Litre', 120, true, 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&q=80', '11 mins', true, true, true, false],
    ['Saffola Gold Pro Healthy Blend', 'Saffola', 'Physically refined rice bran and safflower blend oil.', 220, 199, '1 Litre', 150, true, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80', '11 mins', false, false, true, false],
    ['Figaro Olive Oil Pure', 'Figaro', 'Imported mild pure olive oil tin.', 900, 799, '1 Litre', 80, true, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80', '13 mins', true, false, false, false],
    ['Organic India Extra Virgin Coconut Oil', 'OrganicInd', 'Cold pressed raw extra virgin coconut oil.', 350, 310, '500 ml', 60, true, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80', '12 mins', false, false, false, true],
    ['Patanjali Cow Ghee Pack', 'Patanjali', 'Pure cow ghee pouch.', 310, 295, '500 ml', 95, true, 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&q=80', '11 mins', false, false, false, false],
    ['Fortune Sunlite Refined Sunflower Oil', 'Fortune', 'Refined sunflower cooking oil bottle.', 160, 145, '1 Litre', 110, true, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80', '10 mins', false, false, false, false],
    ['Pro Nature Organic Cold Pressed Mustard Oil', 'ProNature', 'Organic wood-pressed cold-pressed mustard oil.', 240, 219, '1 Litre', 40, true, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80', '14 mins', false, false, false, true],
    ['Aashirvaad Svasti Pure Cow Ghee', 'Aashirvaad', 'Svasti danedar cow ghee jar.', 340, 320, '500 ml', 70, true, 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&q=80', '11 mins', false, false, false, false]
  ],
  'Spices & Masalas': [
    ['Tata Sampann Turmeric Haldi Powder', 'TataSampann', 'High curcumin turmeric powder.', 60, 52, '200 g', 250, true, 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&q=80', '10 mins', false, true, true, false],
    ['Tata Sampann Coriander Dhania Powder', 'TataSampann', 'Aromatic coriander powder.', 55, 48, '200 g', 200, true, 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&q=80', '10 mins', false, false, true, false],
    ['Everest Tikhalal Chilli Powder', 'Everest', 'Hot red chilli powder pack.', 70, 62, '200 g', 180, true, 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&q=80', '10 mins', false, true, true, false],
    ['MDH Garam Masala Powder', 'MDH', 'Traditional spice blend garam masala.', 90, 79, '100 g', 150, true, 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&q=80', '10 mins', false, false, true, false],
    ['Catch Kasuri Methi Pack', 'Catch', 'Dried fenugreek leaves kasuri methi.', 30, 24, '50 g', 120, true, 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&q=80', '11 mins', false, false, false, false],
    ['MDH Kitchen King Masala', 'MDH', 'All-in-one kitchen king spice powder.', 85, 75, '100 g', 100, true, 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&q=80', '10 mins', false, false, false, false],
    ['Everest Sambhar Masala', 'Everest', 'South Indian sambhar curry powder.', 75, 66, '100 g', 90, true, 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&q=80', '10 mins', false, false, false, false],
    ['Tata Sampann Paneer Masala Pack', 'TataSampann', 'Rich aromatic paneer spice blend.', 50, 42, '100 g', 80, true, 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&q=80', '11 mins', false, false, false, false],
    ['Organic Tattva Black Pepper Whole', 'OrganicTattva', 'Pure organic black peppercorns whole.', 160, 139, '100 g', 55, true, 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&q=80', '12 mins', false, false, false, true],
    ['Whole Cumin Jeera Pack', 'FarmFresh', 'High-flavor seed whole cumin.', 90, 75, '200 g', 110, true, 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&q=80', '10 mins', false, true, false, false]
  ],
  'Instant Food': [
    ['Maggi Masala 2-Min Noodles', 'Maggi', 'Instant wheat flour noodles with taste maker.', 18, 17, '70 g', 500, true, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&q=80', '10 mins', false, true, true, false],
    ['Maggi Masala 12-Pack', 'Maggi', 'Instant noodles family pack.', 196, 175, '12 pcs', 150, true, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&q=80', '10 mins', true, true, true, false],
    ['Yippee Classic Masala Noodles', 'Yippee', 'Non-sticky round instant noodles.', 18, 17, '70 g', 300, true, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&q=80', '10 mins', false, false, true, false],
    ['Knorr Mixed Vegetable Soup Mix', 'Knorr', 'Instant healthy mixed vegetable hot soup.', 55, 48, '50 g', 120, true, 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500&q=80', '11 mins', false, false, false, false],
    ['MTR Instant Rava Idli Mix', 'MTR', 'Ready-to-steam rava idli breakfast mix.', 130, 115, '500 g', 80, true, 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=500&q=80', '12 mins', false, true, false, false],
    ['Chings Secret Schezwan Noodles', 'Chings', 'Spicy schezwan instant fried noodles.', 20, 18, '70 g', 200, true, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&q=80', '10 mins', false, false, false, false],
    ['Haldirams Ready Ready Pav Bhaji', 'Haldirams', 'Ready-to-eat spiced potato pav bhaji curry.', 99, 85, '300 g', 60, true, 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=500&q=80', '14 mins', true, false, false, false],
    ['Gits Instant Gulab Jamun Mix', 'Gits', 'Easy-to-make sweet gulab jamun flour mix.', 120, 99, '200 g', 100, true, 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=500&q=80', '12 mins', false, false, false, false],
    ['Act II Popcorn Golden Sizzle', 'ActII', 'Microwave instant salted golden popcorn.', 40, 34, '100 g', 150, true, 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=500&q=80', '10 mins', false, false, false, false],
    ['Chings Hakka Noodles Veg', 'Chings', 'Dry hakka stir-fry noodles pack.', 45, 39, '150 g', 90, true, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&q=80', '12 mins', false, false, false, false]
  ],
  'Personal Care': [
    ['Dettol Liquid Handwash Original', 'Dettol', 'Antibacterial liquid handwash refill pack.', 99, 89, '750 ml', 180, true, 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=500&q=80', '10 mins', true, true, true, false],
    ['Dove Cream Beauty Soap Bar', 'Dove', 'Moisturizing beauty bathing soap bar.', 65, 59, '100 g', 250, true, 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=500&q=80', '10 mins', false, true, true, false],
    ['Sunsilk Black Shine Shampoo', 'Sunsilk', 'Co-created with hair experts black shine shampoo.', 199, 179, '350 ml', 120, true, 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=500&q=80', '11 mins', false, false, true, false],
    ['Colgate MaxFresh Gel Toothpaste', 'Colgate', 'Maxfresh cooling gel toothpaste with crystals.', 110, 99, '150 g', 180, true, 'https://images.unsplash.com/photo-1559591937-e746e1dbcd86?w=500&q=80', '10 mins', false, true, true, false],
    ['Lifebuoy Total 10 Soap Bar', 'Lifebuoy', 'Red germ protection bathing soap bar.', 40, 36, '125 g', 200, true, 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=500&q=80', '10 mins', false, false, false, false],
    ['Nivea Soft Moisturizing Cream', 'Nivea', 'Light moisturizing cream with Jojoba oil.', 240, 219, '200 ml', 75, true, 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=500&q=80', '11 mins', true, false, false, false],
    ['Pears Pure Gentle Glycerine Soap', 'Pears', 'Pure glycerine bathing soap bar.', 75, 68, '100 g', 90, true, 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=500&q=80', '10 mins', false, false, false, false],
    ['Garnier Men Acno Fight Face Wash', 'Garnier', 'Men cooling anti-pimple face wash.', 180, 159, '100 g', 80, true, 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=500&q=80', '12 mins', false, false, false, false],
    ['Parachute 100% Coconut Hair Oil', 'Parachute', 'Pure edible coconut hair oil bottle.', 99, 89, '250 ml', 150, true, 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=500&q=80', '10 mins', false, true, false, false],
    ['Whisper Ultra Clean Sanitary Pads', 'Whisper', 'Ultra clean wings sanitary pads packet.', 175, 149, '15 pads', 110, true, 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=500&q=80', '10 mins', false, false, false, false]
  ],
  'Home Cleaning': [
    ['Lizol Floor Cleaner Citrus', 'Lizol', 'Disinfectant floor cleaner liquid.', 120, 109, '500 ml', 180, true, 'https://images.unsplash.com/photo-1585421514738-ee3468457b5b?w=500&q=80', '10 mins', false, true, true, false],
    ['Harpic Disinfectant Toilet Cleaner', 'Harpic', 'Strong blue disinfectant toilet cleaner liquid.', 140, 125, '1 Litre', 150, true, 'https://images.unsplash.com/photo-1585421514738-ee3468457b5b?w=500&q=80', '10 mins', false, true, true, false],
    ['Vim Dishwash Gel Lemon Liquid', 'Vim', 'Dishwash gel lemon liquid bottle.', 115, 105, '500 ml', 250, true, 'https://images.unsplash.com/photo-1585421514738-ee3468457b5b?w=500&q=80', '10 mins', true, true, true, false],
    ['Colin Glass Cleaner Spray', 'Colin', 'Glass and multi-surface spray cleaner.', 90, 82, '500 ml', 110, true, 'https://images.unsplash.com/photo-1585421514738-ee3468457b5b?w=500&q=80', '11 mins', false, false, false, false],
    ['Dettol Disinfectant Spray', 'Dettol', 'Multipurpose sanitizing disinfectant spray.', 299, 269, '225 ml', 85, true, 'https://images.unsplash.com/photo-1585421514738-ee3468457b5b?w=500&q=80', '10 mins', true, false, false, false],
    ['Vim Dishwash Bar Soap', 'Vim', 'Yellow lemon dishwash bar soap.', 20, 19, '130 g', 300, true, 'https://images.unsplash.com/photo-1585421514738-ee3468457b5b?w=500&q=80', '10 mins', false, false, false, false],
    ['Exo Dishwash Round Tub', 'Exo', 'Exo dishwash clean round tub.', 60, 52, '500 g', 95, true, 'https://images.unsplash.com/photo-1585421514738-ee3468457b5b?w=500&q=80', '11 mins', false, false, false, false],
    ['Gala Scrub Pad Pack', 'Gala', 'Heavy-duty steel scrub pads for pans.', 45, 38, '3 pcs', 120, true, 'https://images.unsplash.com/photo-1585421514738-ee3468457b5b?w=500&q=80', '12 mins', false, false, false, false],
    ['Hit Roach Crawling Spray', 'Hit', 'Roach crawling insect killer spray aerosol.', 199, 179, '400 ml', 65, true, 'https://images.unsplash.com/photo-1585421514738-ee3468457b5b?w=500&q=80', '10 mins', false, false, false, false],
    ['Scotch-Brite Sponge Scrub', 'ScotchBrite', 'Sponge kitchen dish cleaning scrub pad.', 50, 44, '1 pc', 150, true, 'https://images.unsplash.com/photo-1585421514738-ee3468457b5b?w=500&q=80', '10 mins', false, true, false, false]
  ]
};

// Add fallback category templates for remaining categories programmatically to get 26 categories & 260 products!
const remainingCategories = [
  'Bakery & Cakes', 'Noodles & Pasta', 'Frozen Food', 'Dry Fruits & Nuts', 'Organic Foods',
  'Beauty & Grooming', 'Detergents & Fabric', 'Baby Care', 'Pet Food'
];

// Fallback arrays to construct 10 products per category for these
const rawTemplates = {
  'Bakery & Cakes': [
    ['Choco Lava Cake Cup', 'FreshBakery', 'Warm melting core choco lava cake.', 80, 69, '1 pc', 50, '12 mins', true, 'photo-1578985545062-69928b1d9587'],
    ['Eggless Vanilla Muffin Pack', 'FreshBakery', 'Baked vanilla soft muffins.', 90, 75, '2 pcs', 45, '11 mins', false, 'photo-1509440159596-0249088772ff'],
    ['Pineapple Pastry Slice', 'FreshBakery', 'Fresh cream sweet pineapple pastry.', 65, 59, '1 pc', 40, '10 mins', false, 'photo-1578985545062-69928b1d9587'],
    ['Baked Butter Rusk Pack', 'Britannia', 'Crispy crunchy morning tea toast rusks.', 50, 44, '300 g', 120, '10 mins', false, 'photo-1509440159596-0249088772ff'],
    ['Milk Toast Rusk', 'Britannia', 'Sweet milk tea rusks pack.', 40, 36, '200 g', 100, '10 mins', false, 'photo-1509440159596-0249088772ff'],
    ['Cream Chocolate Roll', 'FreshBakery', 'Baked cream roll filled with cocoa.', 20, 18, '1 pc', 150, '10 mins', false, 'photo-1578985545062-69928b1d9587'],
    ['Bakery Butter Cookies Jar', 'GoodDay', 'Crispy buttery baked cookies.', 140, 119, '250 g', 80, '12 mins', true, 'photo-1509440159596-0249088772ff'],
    ['Waffle Cone Wafers', 'Kwalls', 'Crisp waffle cone wafer pack.', 60, 52, '5 pcs', 60, '13 mins', false, 'photo-1509440159596-0249088772ff'],
    ['Eggless Fruit Cake Loaf', 'Britannia', 'Baked fruit cake loaf slice.', 65, 59, '150 g', 95, '12 mins', false, 'photo-1578985545062-69928b1d9587'],
    ['Cheese Garlic Sticks Pack', 'FreshBakery', 'Baked crisp cheese garlic sticks.', 80, 72, '150 g', 55, '14 mins', false, 'photo-1509440159596-0249088772ff']
  ],
  'Noodles & Pasta': [
    ['Chings Hakka Veg Noodles', 'Chings', 'Easy stir fry hakka noodles.', 35, 29, '150 g', 150, '10 mins', false, 'photo-1551183053-bf91a1d81141'],
    ['Del Monte Penne Pasta Pack', 'DelMonte', 'Penne semolina white pasta packet.', 120, 99, '500 g', 110, '11 mins', true, 'photo-1551183053-bf91a1d81141'],
    ['Maggie Hot Heads Noodles', 'Maggi', 'Spicy red chilli instant noodles.', 22, 20, '70 g', 140, '10 mins', false, 'photo-1551183053-bf91a1d81141'],
    ['Chings Schezwan Instant Cup', 'Chings', 'Ready-to-eat hot spicy schezwan cup.', 45, 39, '80 g', 95, '9 mins', false, 'photo-1551183053-bf91a1d81141'],
    ['Del Monte Elbow Macaroni', 'DelMonte', 'Durum wheat semolina macaroni pasta.', 120, 99, '500 g', 80, '12 mins', false, 'photo-1551183053-bf91a1d81141'],
    ['Knorr Soupy Noodles Pack', 'Knorr', 'Soupy spicy hot instant noodles.', 20, 18, '75 g', 130, '10 mins', false, 'photo-1551183053-bf91a1d81141'],
    ['Yippee Mood Masala Noodles', 'Yippee', 'Instant noodles with double masala mix.', 22, 20, '70 g', 120, '10 mins', false, 'photo-1551183053-bf91a1d81141'],
    ['Bambino Roasted Vermicelli', 'Bambino', 'Roasted wheat vermicelli seviyan.', 45, 39, '450 g', 90, '12 mins', false, 'photo-1551183053-bf91a1d81141'],
    ['Maggi Fusilli Oats Pasta', 'Maggi', 'Oats instant fusilli pasta packet.', 30, 27, '65 g', 50, '10 mins', false, 'photo-1551183053-bf91a1d81141'],
    ['Del Monte Spaghetti Pasta', 'DelMonte', 'Durum wheat semolina long spaghetti.', 140, 119, '500 g', 65, '11 mins', true, 'photo-1551183053-bf91a1d81141']
  ],
  'Frozen Food': [
    ['Safal Frozen Green Peas', 'Safal', 'Sweet fresh frozen green peas.', 120, 99, '1 kg', 150, '10 mins', false, 'photo-1547592180-85f173990554'],
    ['McCaian French Fries Pack', 'McCain', 'Frozen classic salted french fries.', 180, 159, '450 g', 120, '11 mins', true, 'photo-1547592180-85f173990554'],
    ['McCain Aloo Tikki Frozen', 'McCain', 'Frozen spicy potato aloo tikki.', 130, 112, '400 g', 110, '11 mins', false, 'photo-1547592180-85f173990554'],
    ['Frozen Sweet Corn Kernel', 'Safal', 'Sweet juicy frozen golden corn.', 80, 69, '500 g', 95, '10 mins', false, 'photo-1547592180-85f173990554'],
    ['Yummiez Chicken Nuggets', 'Yummiez', 'Frozen breaded chicken nuggets.', 280, 245, '400 g', 80, '12 mins', false, 'photo-1547592180-85f173990554'],
    ['Safal Frozen Jackfruit Kathal', 'Safal', 'Clean chopped frozen jackfruit.', 90, 78, '400 g', 75, '12 mins', false, 'photo-1547592180-85f173990554'],
    ['Frozen Mixed Vegetable Pack', 'Safal', 'Carrot, peas, beans frozen mix.', 100, 89, '500 g', 65, '10 mins', false, 'photo-1547592180-85f173990554'],
    ['McCain Veggie Fingers', 'McCain', 'Frozen crisp breaded veggie fingers.', 140, 122, '400 g', 50, '11 mins', false, 'photo-1547592180-85f173990554'],
    ['Yummiez Chicken Seekh Kebab', 'Yummiez', 'Frozen spiced chicken seekh kebabs.', 320, 289, '400 g', 40, '13 mins', true, 'photo-1547592180-85f173990554'],
    ['Frozen Paneer Paratha Pack', 'Haldirams', 'Ready-to-toast frozen paneer parathas.', 150, 129, '4 pcs', 55, '14 mins', false, 'photo-1547592180-85f173990554']
  ],
  'Dry Fruits & Nuts': [
    ['Premium California Almonds Badam', 'NuttyWild', 'Crisp wholesome California almonds.', 250, 225, '250 g', 150, '10 mins', true, 'photo-1596547609652-9cf5d8d76921'],
    ['Premium Cashews Kaju Whole', 'NuttyWild', 'Crisp raw cashew whole kernels.', 320, 289, '250 g', 120, '10 mins', true, 'photo-1596547609652-9cf5d8d76921'],
    ['Salted Roasted Pistachios Pista', 'NuttyWild', 'Crunchy salted roasted pistachios.', 350, 310, '250 g', 110, '10 mins', false, 'photo-1596547609652-9cf5d8d76921'],
    ['Black Seedless Raisins Kishmish', 'NuttyWild', 'Sweet organic black raisins.', 180, 149, '250 g', 95, '10 mins', false, 'photo-1596547609652-9cf5d8d76921'],
    ['Premium California Walnuts Akhrot', 'NuttyWild', 'Rich shelled walnut halves.', 400, 355, '200 g', 80, '11 mins', true, 'photo-1596547609652-9cf5d8d76921'],
    ['NuttyWild Salted Cashews', 'NuttyWild', 'Salted roasted cashew nuts pack.', 190, 169, '100 g', 75, '10 mins', false, 'photo-1596547609652-9cf5d8d76921'],
    ['Seedless Soft Dates Khajoor', 'Falcon', 'Rich sweet seedless dates pack.', 250, 219, '500 g', 65, '12 mins', false, 'photo-1596547609652-9cf5d8d76921'],
    ['Raw Pumpkin Seeds Pack', 'TrueElements', 'Healthy raw nutritious pumpkin seeds.', 150, 129, '150 g', 50, '12 mins', false, 'photo-1596547609652-9cf5d8d76921'],
    ['Dried Turkish Apricots Pack', 'Falcon', 'Imported sweet dried apricots.', 290, 255, '200 g', 40, '13 mins', false, 'photo-1596547609652-9cf5d8d76921'],
    ['TrueElements Dried Cranberries', 'TrueElements', 'Sweet tangy dried cranberries.', 220, 199, '150 g', 55, '11 mins', false, 'photo-1596547609652-9cf5d8d76921']
  ],
  'Organic Foods': [
    ['Organic Whole Wheat Atta', 'OrganicInd', 'Certified chemical-free organic whole wheat flour.', 320, 289, '5 kg', 80, '10 mins', true, 'photo-1542601906990-b4d3fb778b09'],
    ['Organic Brown Basmati Rice', 'OrganicInd', 'Aromatic high-fiber organic brown basmati.', 240, 219, '1 kg', 75, '10 mins', false, 'photo-1542601906990-b4d3fb778b09'],
    ['Organic Toor Dal Yellow', 'OrganicInd', 'Unpolished organic yellow pigeon split peas.', 120, 105, '500 g', 90, '10 mins', true, 'photo-1542601906990-b4d3fb778b09'],
    ['Organic Mustard Oil Bottle', 'OrganicInd', 'Cold pressed organic kachi ghani mustard oil.', 260, 229, '1 Litre', 60, '10 mins', false, 'photo-1542601906990-b4d3fb778b09'],
    ['Organic Honey Raw Wild', 'OrganicInd', 'Raw organic wild forest honey jar.', 299, 265, '250 g', 50, '12 mins', true, 'photo-1542601906990-b4d3fb778b09'],
    ['Organic Turmeric Haldi Powder', 'OrganicTattva', 'Chemical-free high curcumin organic haldi.', 90, 78, '200 g', 130, '10 mins', false, 'photo-1542601906990-b4d3fb778b09'],
    ['Organic Cow Ghee Jar', 'OrganicInd', 'Certified organic pure A2 cow ghee.', 750, 699, '500 ml', 40, '13 mins', true, 'photo-1542601906990-b4d3fb778b09'],
    ['Organic Jaggery Powder Gur', 'OrganicInd', 'Healthy natural jaggery sweetener powder.', 80, 68, '500 g', 110, '11 mins', false, 'photo-1542601906990-b4d3fb778b09'],
    ['Organic Rolled Oats Bag', 'TrueElements', 'Gluten-free organic rolled oats.', 280, 245, '1 kg', 95, '10 mins', false, 'photo-1542601906990-b4d3fb778b09'],
    ['Organic Apple Cider Vinegar', 'Bragg', 'Organic apple cider vinegar with mother.', 620, 575, '473 ml', 30, '14 mins', true, 'photo-1542601906990-b4d3fb778b09']
  ],
  'Beauty & Grooming': [
    ['Nivea Men Dark Spot Reduction Face Wash', 'Nivea', 'Effective dark spot reduction face wash.', 199, 179, '100 g', 150, '10 mins', false, 'photo-1596462502278-27bfdc403348'],
    ['Gillette Mach 3 Razor Base', 'Gillette', 'Manual 3-blade mens face razor handle.', 350, 319, '1 pc', 120, '10 mins', true, 'photo-1596462502278-27bfdc403348'],
    ['Gillette Mach 3 Cartridge Pack', 'Gillette', 'Replacement shaving blades cartridges.', 799, 749, '4 pcs', 110, '11 mins', false, 'photo-1596462502278-27bfdc403348'],
    ['Ponds Bright Beauty Face Cream', 'Ponds', 'Bright beauty spot-less glow face cream.', 140, 125, '50 g', 95, '10 mins', false, 'photo-1596462502278-27bfdc403348'],
    ['Gillette Shaving Foam Sensitive', 'Gillette', 'Sensitive skin cooling shaving foam.', 220, 199, '200 g', 80, '11 mins', true, 'photo-1596462502278-27bfdc403348'],
    ['Nivea Protect Deodorant Spray', 'Nivea', 'Protect & care fresh deodorant body spray.', 240, 210, '150 ml', 75, '10 mins', false, 'photo-1596462502278-27bfdc403348'],
    ['Axe Dark Temptation Perfume Spray', 'Axe', 'Deodorant spray with dark chocolate aroma.', 250, 219, '150 ml', 65, '12 mins', false, 'photo-1596462502278-27bfdc403348'],
    ['Tresemme Keratin Smooth Conditioner', 'Tresemme', 'Keratin smooth hair conditioner tube.', 299, 269, '190 ml', 50, '12 mins', false, 'photo-1596462502278-27bfdc403348'],
    ['Wild Stone Code Perfume Body Spray', 'WildStone', 'Code titanium long-lasting perfume spray.', 275, 245, '120 ml', 40, '13 mins', false, 'photo-1596462502278-27bfdc403348'],
    ['Vaseline Lip Therapy Cocoa Butter', 'Vaseline', 'Cocoa butter lip care moisturizer balm.', 120, 99, '20 g', 55, '11 mins', false, 'photo-1596462502278-27bfdc403348']
  ],
  'Detergents & Fabric': [
    ['Surf Excel Easy Wash Powder', 'SurfExcel', 'Easy wash detergent washing powder.', 220, 199, '1 kg', 200, '10 mins', true, 'photo-1582738411706-bfc8e691d1c2'],
    ['Ariel Matic Front Load Detergent', 'Ariel', 'Matic front load washing machine powder.', 310, 289, '1 kg', 180, '10 mins', true, 'photo-1582738411706-bfc8e691d1c2'],
    ['Surf Excel Matic Liquid Detergent', 'SurfExcel', 'Matic liquid laundry washing detergent.', 250, 229, '1 Litre', 160, '10 mins', false, 'photo-1582738411706-bfc8e691d1c2'],
    ['Comfort After Wash Conditioner Blue', 'Comfort', 'Comfort fabric softener after wash liquid.', 240, 215, '860 ml', 110, '10 mins', false, 'photo-1582738411706-bfc8e691d1c2'],
    ['Rin Detergent Bar Soap Pack', 'Rin', 'Crisp bright laundry detergent bar soap.', 40, 36, '4 pcs', 85, '10 mins', false, 'photo-1582738411706-bfc8e691d1c2'],
    ['Genteel Liquid Detergent Bottle', 'Genteel', 'Genteel woolens liquid detergent wash.', 180, 159, '1 Litre', 75, '11 mins', false, 'photo-1582738411706-bfc8e691d1c2'],
    ['Vanish All in One Liquid Bleach', 'Vanish', 'Fabric stain remover pink liquid helper.', 240, 219, '800 ml', 60, '11 mins', false, 'photo-1582738411706-bfc8e691d1c2'],
    ['Tide Plus Double Power Detergent', 'Tide', 'Tide plus double power lemon laundry powder.', 160, 145, '1 kg', 50, '10 mins', false, 'photo-1582738411706-bfc8e691d1c2'],
    ['Comfort Morning Fresh Softener', 'Comfort', 'Morning fresh pink fabric conditioner.', 65, 59, '200 ml', 40, '12 mins', false, 'photo-1582738411706-bfc8e691d1c2'],
    ['Surf Excel Bar Pack', 'SurfExcel', 'Surf excel stain remover washing bar.', 60, 54, '4 pcs', 55, '11 mins', false, 'photo-1582738411706-bfc8e691d1c2']
  ],
  'Baby Care': [
    ['Pampers Baby Dry Diapers Large', 'Pampers', 'Baby dry pants diapers pack.', 899, 799, '50 pcs', 150, '10 mins', true, 'photo-1555252333-9f8e92e65df9'],
    ['Himalaya Gentle Baby Wipes', 'Himalaya', 'Gentle moisturizing baby wipes pack.', 180, 149, '72 wipes', 120, '10 mins', false, 'photo-1555252333-9f8e92e65df9'],
    ['Himalaya Baby Powder Herbals', 'Himalaya', 'Cooling herbal baby powder pack.', 160, 139, '200 g', 110, '10 mins', false, 'photo-1555252333-9f8e92e65df9'],
    ['Johnsons Baby No More Tears Shampoo', 'Johnsons', 'Gentle mild baby cleaning shampoo.', 240, 219, '200 ml', 95, '10 mins', false, 'photo-1555252333-9f8e92e65df9'],
    ['Johnsons Baby Soap Pink', 'Johnsons', 'Gentle moisturizing mild baby soap.', 60, 54, '75 g', 80, '11 mins', true, 'photo-1555252333-9f8e92e65df9'],
    ['Himalaya Baby Lotion Pack', 'Himalaya', 'Gentle herbal skin baby lotion.', 199, 179, '200 ml', 75, '10 mins', false, 'photo-1555252333-9f8e92e65df9'],
    ['Sebamed Baby Wash Extra Soft', 'Sebamed', 'Ultra mild baby wash pH 5.5.', 450, 410, '200 ml', 65, '12 mins', true, 'photo-1555252333-9f8e92e65df9'],
    ['Johnsons Baby Massage Oil Pure', 'Johnsons', 'Pure mineral massage oil with Vitamin E.', 220, 199, '200 ml', 50, '12 mins', false, 'photo-1555252333-9f8e92e65df9'],
    ['Himalaya Baby Shampoo Mild', 'Himalaya', 'Herbal baby shampoo no tears formula.', 199, 179, '200 ml', 40, '13 mins', false, 'photo-1555252333-9f8e92e65df9'],
    ['Pampers Active Baby Wipes', 'Pampers', 'Moisturizing active baby wipes.', 99, 89, '20 wipes', 55, '11 mins', false, 'photo-1555252333-9f8e92e65df9']
  ],
  'Pet Food': [
    ['Pedigree Adult Dog Food Chicken Rice', 'Pedigree', 'Premium adult dry dog food.', 380, 339, '1.2 kg', 150, '10 mins', true, 'photo-1583511655857-d19b40a7a54e'],
    ['Whiskas Adult Dry Cat Food', 'Whiskas', 'Ocean fish flavor crunchy cat kibbles.', 250, 225, '450 g', 120, '10 mins', true, 'photo-1583511655857-d19b40a7a54e'],
    ['Pedigree Puppy Dog Food Chicken Milk', 'Pedigree', 'High protein puppy growth dry dog food.', 420, 379, '1.2 kg', 110, '10 mins', false, 'photo-1583511655857-d19b40a7a54e'],
    ['Whiskas Wet Cat Food Salmon Gravy', 'Whiskas', 'Salmon jelly cat food gravy pouch.', 50, 44, '85 g', 95, '10 mins', false, 'photo-1583511655857-d19b40a7a54e'],
    ['Chappi Dry Adult Dog Food', 'Chappi', 'Chappi dry dog kibbles meat flavor.', 299, 269, '1 kg', 80, '11 mins', false, 'photo-1583511655857-d19b40a7a54e'],
    ['Pedigree Dentastix Dog Chew Medium', 'Pedigree', 'Dental chew treats for fresh breath.', 190, 169, '7 chews', 75, '10 mins', false, 'photo-1583511655857-d19b40a7a54e'],
    ['Purepet Adult Cat Food Mackerel', 'Purepet', 'Mackerel dry food for skin and coat.', 150, 129, '450 g', 65, '12 mins', false, 'photo-1583511655857-d19b40a7a54e'],
    ['SmartHeart Puppy Food Beef Gravy', 'SmartHeart', 'Puppy food chunks in beef gravy pouch.', 60, 52, '80 g', 50, '12 mins', false, 'photo-1583511655857-d19b40a7a54e'],
    ['Meat Up Adult Dog Biscuit Treats', 'MeatUp', 'Crunchy bone-shaped milk biscuits treats jar.', 250, 219, '500 g', 40, '13 mins', true, 'photo-1583511655857-d19b40a7a54e'],
    ['Whiskas Dry Kitten Food Chicken Milk', 'Whiskas', 'Growth kitten food small kibbles.', 270, 245, '450 g', 55, '11 mins', false, 'photo-1583511655857-d19b40a7a54e']
  ]
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await DeliveryPartner.deleteMany();

    console.log('Existing DB collections wiped clean.');

    // 1. Create Users
    const salt = await bcrypt.genSalt(10);
    const users = await User.create([
      {
        name: 'Grocery Admin',
        email: 'admin@grocery.com',
        phone: '9999999999',
        password: 'admin123',
        role: 'Admin',
        isVerified: true,
      },
      {
        name: 'Regular Customer',
        email: 'customer@grocery.com',
        phone: '8888888888',
        password: 'customer123',
        role: 'Customer',
        isVerified: true,
      },
      {
        name: 'Delivery Rider',
        email: 'delivery@grocery.com',
        phone: '7777777777',
        password: 'partner123',
        role: 'DeliveryPartner',
        isVerified: true,
      },
    ]);

    const partner = users[2];
    console.log('Sample Users Seeded successfully.');

    // Create detailed record for Delivery Partner
    await DeliveryPartner.create({
      userId: partner._id,
      vehicleNumber: 'KA-03-EX-1234',
      vehicleType: 'Bike',
      isAvailable: true,
      currentLocation: {
        type: 'Point',
        coordinates: [77.5946, 12.9716],
      },
    });
    console.log('Sample Delivery Partner profile initialized.');

    // 2. Create Categories
    const seededCategories = await Category.create(categoriesData);
    console.log(`Successfully seeded ${seededCategories.length} categories.`);

    // Map category name to ObjectId for product referencing
    const categoryMap = {};
    seededCategories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
    });

    // 3. Assemble and Create Products
    const productsToSeed = [];

    // Process pre-defined explicit templates
    for (const [categoryName, items] of Object.entries(productTemplates)) {
      const categoryId = categoryMap[categoryName];
      if (!categoryId) continue;

      items.forEach((item) => {
        const [name, brand, description, mrp, price, unit, stock, isVeg, imageUrl, deliveryTime, isFeatured, isTrending, isBestSeller, isOrganic] = item;
        productsToSeed.push({
          name,
          brand,
          description,
          mrp,
          price,
          unit,
          stock,
          isVeg,
          images: [imageUrl],
          category: categoryId,
          deliveryTime: deliveryTime || '10 mins',
          isFeatured: !!isFeatured,
          isTrending: !!isTrending,
          isBestSeller: !!isBestSeller,
          isOrganic: !!isOrganic,
          ratingsAverage: Math.round((4.0 + Math.random()) * 10) / 10,
          ratingsQuantity: Math.floor(10 + Math.random() * 90),
        });
      });
    }

    // Process raw templates for remaining categories
    for (const [categoryName, items] of Object.entries(rawTemplates)) {
      const categoryId = categoryMap[categoryName];
      if (!categoryId) continue;

      items.forEach((item) => {
        const [name, brand, description, mrp, price, unit, stock, deliveryTime, isOrganic, photoId] = item;
        const imageUrl = `https://images.unsplash.com/${photoId}?w=500&q=80`;
        
        productsToSeed.push({
          name,
          brand,
          description,
          mrp,
          price,
          unit,
          stock,
          isVeg: true,
          images: [imageUrl],
          category: categoryId,
          deliveryTime: deliveryTime || '10 mins',
          isFeatured: Math.random() > 0.6,
          isTrending: Math.random() > 0.6,
          isBestSeller: Math.random() > 0.6,
          isOrganic: !!isOrganic,
          ratingsAverage: Math.round((4.0 + Math.random()) * 10) / 10,
          ratingsQuantity: Math.floor(10 + Math.random() * 90),
        });
      });
    }

    const seededProducts = await Product.create(productsToSeed);
    console.log(`Successfully seeded ${seededProducts.length} high-quality products.`);
    console.log('Database Seeding Complete. Exiting...');
    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed: ', error);
    process.exit(1);
  }
};

seedData();
