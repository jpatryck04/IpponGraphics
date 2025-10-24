const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = './products.json';

// Middleware
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../frontend')));

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|svg|psd|ai|eps/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error(`Error: File upload only supports the following filetypes - ${filetypes}`));
  },
});

// Helper function to read data
const readData = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return []; // Return an empty array if the file doesn't exist
    }
    throw err;
  }
};

// Helper function to write data
const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// API Routes
app.get('/api/products', (req, res) => {
  const products = readData();
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const products = readData();
  const product = products.find((p) => p.id === req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

app.post('/api/products', upload.single('image'), (req, res) => {
  const { name, description, price, category, tags } = req.body;
  if (!name || !price) {
    return res.status(400).json({ message: 'Name and price are required' });
  }
  const products = readData();
  const newProduct = {
    id: uuidv4(),
    name,
    description,
    price: parseFloat(price),
    category,
    tags: tags ? JSON.parse(tags) : [],
    image: req.file ? `/uploads/${req.file.filename}` : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  products.push(newProduct);
  writeData(products);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', upload.single('image'), (req, res) => {
  const products = readData();
  const index = products.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const { name, description, price, category, tags } = req.body;
  const updatedProduct = {
    ...products[index],
    name: name || products[index].name,
    description: description || products[index].description,
    price: price ? parseFloat(price) : products[index].price,
    category: category || products[index].category,
    tags: tags ? JSON.parse(tags) : products[index].tags,
    image: req.file ? `/uploads/${req.file.filename}` : products[index].image,
    updatedAt: new Date().toISOString(),
  };
  products[index] = updatedProduct;
  writeData(products);
  res.json(updatedProduct);
});

app.delete('/api/products/:id', (req, res) => {
  let products = readData();
  const index = products.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  const [deletedProduct] = products.splice(index, 1);
  if (deletedProduct.image) {
    fs.unlink(path.join(__dirname, deletedProduct.image), (err) => {
      if (err) {
        console.error('Error deleting image:', err);
      }
    });
  }
  writeData(products);
  res.status(204).send();
});

// Serve frontend pages
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
