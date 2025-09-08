export interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  status: "active" | "inactive";
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
}