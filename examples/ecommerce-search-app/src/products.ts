export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
}

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Mouse',
    price: 25.99,
    category: 'Electronics',
    imageUrl: 'https://via.placeholder.com/150/0000FF/808080?Text=Mouse',
  },
  {
    id: '2',
    name: 'Bluetooth Keyboard',
    price: 49.99,
    category: 'Electronics',
    imageUrl: 'https://via.placeholder.com/150/0000FF/808080?Text=Keyboard',
  },
  {
    id: '3',
    name: 'USB-C Hub',
    price: 39.99,
    category: 'Electronics',
    imageUrl: 'https://via.placeholder.com/150/0000FF/808080?Text=USB+Hub',
  },
  {
    id: '4',
    name: 'Laptop Stand',
    price: 22.50,
    category: 'Accessories',
    imageUrl: 'https://via.placeholder.com/150/FF0000/FFFFFF?Text=Laptop+Stand',
  },
  {
    id: '5',
    name: 'Monitor Arm',
    price: 89.00,
    category: 'Accessories',
    imageUrl: 'https://via.placeholder.com/150/FF0000/FFFFFF?Text=Monitor+Arm',
  },
  {
    id: '6',
    name: 'Ergonomic Chair',
    price: 299.99,
    category: 'Furniture',
    imageUrl: 'https://via.placeholder.com/150/00FF00/000000?Text=Chair',
  },
  {
    id: '7',
    name: 'Standing Desk',
    price: 450.00,
    category: 'Furniture',
    imageUrl: 'https://via.placeholder.com/150/00FF00/000000?Text=Desk',
  },
  {
    id: '8',
    name: 'Webcam HD 1080p',
    price: 65.00,
    category: 'Electronics',
    imageUrl: 'https://via.placeholder.com/150/0000FF/808080?Text=Webcam',
  },
  {
    id: '9',
    name: 'Desk Lamp',
    price: 19.99,
    category: 'Furniture',
    imageUrl: 'https://via.placeholder.com/150/00FF00/000000?Text=Lamp',
  },
  {
    id: '10',
    name: 'Noise Cancelling Headphones',
    price: 199.99,
    category: 'Electronics',
    imageUrl: 'https://via.placeholder.com/150/0000FF/808080?Text=Headphones',
  },
];
