// src/config/Brand.js

/**
 * Brand list for all categories
 * You can expand or fetch dynamically later
 */

export const brands = {
  "Phones & Tablets": [
    "Apple",
    "Samsung",
    "Tecno",
    "Infinix",
    "Huawei",
    "Xiaomi",
    "Oppo",
    "Vivo",
    "Google",
    "OnePlus"
  ],
  "Computers & Laptops": [
    "Dell",
    "HP",
    "Lenovo",
    "Asus",
    "Acer",
    "Apple",
    "Microsoft",
    "Samsung"
  ],
  "Cars & Trucks": [
    "Toyota",
    "Honda",
    "Mercedes-Benz",
    "BMW",
    "Ford",
    "Hyundai",
    "Nissan",
    "Kia"
  ],
  "Motorcycles & Scooters": [
    "Yamaha",
    "Honda",
    "Suzuki",
    "Kawasaki",
    "Bajaj",
    "TVS"
  ],
  "Electronics & Accessories": [
    "Sony",
    "LG",
    "Philips",
    "Panasonic",
    "Samsung",
    "JBL",
    "Bose"
  ],
  "Home & Furniture": [
    "Ikea",
    "Jumia Home",
    "Lagos Furnitures",
    "Local Brands"
  ],
  "Appliances": [
    "Samsung",
    "LG",
    "Whirlpool",
    "Haier",
    "Bosch"
  ],
  "Fashion - Men": [
    "Nike",
    "Adidas",
    "Puma",
    "Zara",
    "H&M"
  ],
  "Fashion - Women": [
    "Zara",
    "H&M",
    "Mango",
    "Gucci",
    "Prada"
  ],
  "Beauty & Health": [
    "Nivea",
    "L’Oreal",
    "Dove",
    "Maybelline",
    "MAC"
  ],
  "Shoes": [
    "Nike",
    "Adidas",
    "Puma",
    "Reebok",
    "Skechers"
  ],
  "Watches": [
    "Rolex",
    "Casio",
    "Seiko",
    "Fossil",
    "Tissot"
  ]
};

/**
 * Function to get brands by category
 * @param {string} category
 * @returns {array} brands for that category
 */
export const getBrandsByCategory = (category) => {
  return brands[category] || [];
};