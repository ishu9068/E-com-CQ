const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());


app.use(express.static(path.join(__dirname, "pages")));

// Custom Routes for Pages
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "pages", "index.html"));
// });

// app.get("/signup", (req, res) => {
//   res.sendFile(path.join(__dirname, "pages", "signup.html"));
// });

// app.get("/login", (req, res) => {
//   res.sendFile(path.join(__dirname, "pages", "login.html"));
// });

// app.get("/admin", (req, res) => {
//   res.sendFile(path.join(__dirname, "pages", "admin.html"));
// });

// app.get("/user", (req, res) => {
//   res.sendFile(path.join(__dirname, "pages", "user.html"));
// });




const USERS_FILE = path.join(__dirname, "data", "users.json");
const PRODUCTS_FILE = path.join(__dirname, "data", "products.json");




// Signup Route
app.post("/signup", (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }

  let users = [];
  try {
    users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
  } catch (err) {
    return res.status(500).json({ error: "Failed to read users file" });
  }

  const userExists = users.find(u => u.email === email);
  if (userExists) {
    return res.status(409).json({ error: "User already exists" });
  }

  const newUser = {
    name,
    email,
    password,
    role
  };

  // Add empty cart only if role is "user"
  if (role === "user") {
    newUser.cart = [];
  }

  users.push(newUser);

  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ error: "Failed to write users file" });
  }
});



// app.post("/login", (req, res) => {
//   const { email, password } = req.body;
//   const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
//   const user = users.find(u => u.email === email && u.password === password);
//   if (user) res.json({ message: "Login successful" });
//   else res.status(401).json({ message: "Invalid credentials" });
// });



app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    res.json({
      name: user.name,
      email: user.email,
      role: user.role 
    });
  } else {
    res.status(401).send("Invalid credentials");
  }
});


app.get("/products", (req, res) => {
  const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf-8"));
  res.json(products);
});


app.post("/products", (req, res) => {
  const newProduct = req.body;
  const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf-8"));
  products.push(newProduct);
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  res.json({ message: "Product added" });
});



app.post("/cart", (req, res) => {
  const { username, cartItem } = req.body;

  if (!username || !cartItem) {
    return res.status(400).json({ error: "Missing username or cartItem" });
  }

  let users = JSON.parse(fs.readFileSync("data/users.json", "utf8"));

  const userIndex = users.findIndex(u => u.email === username);

  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  if (!Array.isArray(users[userIndex].cart)) {
    users[userIndex].cart = [];
  }

  const existing = users[userIndex].cart.find(item => item.id === cartItem.id);
  if (existing) {
    existing.quantity = cartItem.quantity;  // ✅ update only
  } else {
    users[userIndex].cart.push(cartItem);   // ✅ add if not exists
  }

  fs.writeFileSync("data/users.json", JSON.stringify(users, null, 2), "utf8");

  res.json({ message: "Item added/updated to cart successfully" });
});




app.put("/products/:id", (req, res) => {
  const id = req.params.id;
  const updatedProduct = req.body;

  const data = fs.readFileSync("data/products.json", "utf8");
  let products = JSON.parse(data);

  const exists = products.some(p => p.id === id);
  if (!exists) {
    return res.status(404).json({ error: "Product not found" });
  }

  updatedProduct.id = id;
  products = products.map(p => p.id === id ? updatedProduct : p);

  fs.writeFileSync("data/products.json", JSON.stringify(products, null, 2));
  res.json({ message: "Product updated", product: updatedProduct });
});




app.delete("/products/:id", (req, res) => {
  const { id } = req.params;
  let products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf-8"));
  products = products.filter(p => p.id !== id);
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  res.json({ message: "Product deleted" });
});



app.get("/get-cart", (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: "Missing email" });

  const users = JSON.parse(fs.readFileSync("data/users.json", "utf8"));
  const user = users.find(u => u.email === email);

  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({ cart: user.cart || [] });
});




app.delete("/cart", (req, res) => {
  const { username, productId } = req.body;
  const users = JSON.parse(fs.readFileSync("data/users.json", "utf8"));
  const user = users.find(u => u.email === username);
  if (!user) return res.status(404).json({ error: "User not found" });
  user.cart = user.cart.filter(item => item.id !== productId);
  fs.writeFileSync("data/users.json", JSON.stringify(users, null, 2));
  res.json({ message: "Item removed from cart" });
});




const PORT = 3000;
app.listen(PORT, () => {  
  console.log(`Server running at http://localhost:${PORT}`);
});
