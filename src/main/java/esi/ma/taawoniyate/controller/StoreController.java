package esi.ma.taawoniyate.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import esi.ma.taawoniyate.model.Category;
import esi.ma.taawoniyate.model.Product;
import esi.ma.taawoniyate.model.ProductImage;
import esi.ma.taawoniyate.model.Seller;
import esi.ma.taawoniyate.model.User;
import esi.ma.taawoniyate.repository.CategoryRepository;
import esi.ma.taawoniyate.repository.ProductRepository;
import esi.ma.taawoniyate.repository.ProductImageRepository;
import esi.ma.taawoniyate.repository.SellerRepository;
import esi.ma.taawoniyate.service.SellerService;
import esi.ma.taawoniyate.service.UserService;
import esi.ma.taawoniyate.service.CloudinaryService;
import esi.ma.taawoniyate.dto.ProductDetailsResponse;
import jakarta.servlet.http.HttpServletRequest;
@CrossOrigin(origins = "http://localhost:8081",allowCredentials = "true")
@RestController
@RequestMapping("/store")
public class StoreController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SellerRepository sellerRepository;
    @Autowired
    private SellerService sellerService;

    @Autowired
    private UserService userService;

    @Autowired
    private ProductImageRepository productImageRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    // Get all products
    @GetMapping("/products")
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // Get all categories
    @GetMapping("/categories")
    public List<String> getAllCategories() {
        List<String> categories = new ArrayList<>();
         categoryRepository.findAll().forEach(category -> categories.add(category.getName()));
         return categories;
    }

    // Get products by category name
    @GetMapping("/products/category/{name}")
    public List<Product> getProductsByCategoryName(@PathVariable String name) {
        return productRepository.findByCategoryName(name);
    }

    // Get products by name (exact match)
    @GetMapping("/products/name/{name}")
    public List<Product> getProductsByName(@PathVariable String name) {
        return productRepository.findByName(name);
    }

    // Get products by partial name (e.g., search)
    @GetMapping("/products/search")
    public List<Product> searchProductsByName(@RequestParam String keyword) {
        return productRepository.findByNameContainingIgnoreCase(keyword);
    }

    // Get a specific category by name
    @GetMapping("/category/{name}")
    public Category getCategoryByName(@PathVariable String name) {
        return categoryRepository.findByName(name);
    }

    @PostMapping("/addProduct")
    public ResponseEntity<?> addProduct(@RequestBody Product product, jakarta.servlet.http.HttpSession session) {
        // Get the current seller from the session
        Seller currentSeller = (Seller) session.getAttribute("user");
        if (currentSeller == null) {
            return ResponseEntity.status(401).body("Seller not logged in");
        }

        // Set the seller to the current seller
        product.setSeller(currentSeller);

        // Validate required fields
        if (product.getName() == null || product.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Product name cannot be null or empty");
        }
        if (product.getCategory() == null) {
            return ResponseEntity.badRequest().body("Category information is required");
        }

        // Verify category exists
        Category category = categoryRepository.findByName(product.getCategory());
        if (category == null) {
            return ResponseEntity.badRequest().body("Category not found with Name: " + product.getCategory());
        }
        product.setCategory(category);

        try {
            Product savedProduct = productRepository.save(product);
            return ResponseEntity.ok(savedProduct);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error saving product: " + e.getMessage());
        }
    }

    // Temporary endpoint without session authentication for testing
    @PostMapping("/addProductSimple")
    public ResponseEntity<?> addProductSimple(@RequestBody Map<String, Object> productData) {
        try {
            // Extract data from request
            String name = (String) productData.get("name");
            String description = (String) productData.get("description");
            Double price = ((Number) productData.get("price")).doubleValue();
            Integer quantity = ((Number) productData.get("quantity")).intValue();

            // Handle category
            Object categoryObj = productData.get("category");
            String categoryName;
            if (categoryObj instanceof Map) {
                categoryName = (String) ((Map<?, ?>) categoryObj).get("name");
            } else {
                categoryName = (String) categoryObj;
            }

            // Validate required fields
            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Product name cannot be null or empty");
            }
            if (categoryName == null || categoryName.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Category is required");
            }

            // Find or create category
            Category category = categoryRepository.findByName(categoryName);
            if (category == null) {
                return ResponseEntity.badRequest().body("Category not found: " + categoryName);
            }

            // For now, use the first seller in the database (temporary solution)
            List<Seller> sellers = sellerRepository.findAll();
            if (sellers.isEmpty()) {
                return ResponseEntity.badRequest().body("No sellers found in the system");
            }
            Seller seller = sellers.get(0); // Use first seller as default

            // Create product
            Product product = new Product();
            product.setName(name);
            product.setDescription(description);
            product.setPrice(price);
            product.setQuantity(quantity);
            product.setCategory(category);
            product.setSeller(seller);

            Product savedProduct = productRepository.save(product);
            return ResponseEntity.ok(savedProduct);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error saving product: " + e.getMessage());
        }
    }

    @PostMapping("/addCategory")
    public ResponseEntity<?> createCategory(@RequestBody Category category) {

        if (category.getName() == null || category.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Category name cannot be null or empty.");
        }

        Category saved = categoryRepository.save(category);
        return ResponseEntity.ok(saved);
    }
    @DeleteMapping("/deleteProductByName/{name}")
    public ResponseEntity<?> deleteProductByName(@PathVariable String name) {
        List<Product> products = productRepository.findByName(name);
        if (products.isEmpty()) {
            return ResponseEntity.status(404).body("No product found with name: " + name);
        }

        productRepository.deleteAll(products);
        return ResponseEntity.ok("Deleted " + products.size() + " product(s) named: " + name);
    }

    @DeleteMapping("/deleteCategoryByName/{name}")
    public ResponseEntity<?> deleteCategoryByName(@PathVariable String name) {
        Category category = categoryRepository.findByName(name);
        if (category == null) {
            return ResponseEntity.status(404).body("No category found with name: " + name);
        }

        categoryRepository.delete(category);
        return ResponseEntity.ok("Deleted category named: " + name);
    }
    @GetMapping("/{busnissName}/products")
    public List<Product> getBusnissNameProducts(@PathVariable String busnissName) {
        List<Product> products = sellerService.getProductsByBusinessName(busnissName);
        return products;
    }

    // Get product details with seller information
    @GetMapping("/products/{productId}")
    public ResponseEntity<?> getProductDetails(@PathVariable Long productId) {
        try {
            System.out.println("=== GET PRODUCT DETAILS ENDPOINT CALLED ===");
            System.out.println("Product ID: " + productId);

            Product product = productRepository.findById(productId.intValue()).orElse(null);
            if (product == null) {
                return ResponseEntity.status(404).body("Product not found");
            }

            System.out.println("Product found: " + product.getName());
            System.out.println("Seller: " + product.getSellerFullName());

            // Create response with seller information
            ProductDetailsResponse response = createProductDetailsResponse(product);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Error in getProductDetails: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching product details: " + e.getMessage());
        }
    }

    // Helper method to create ProductDetailsResponse with seller info
    private ProductDetailsResponse createProductDetailsResponse(Product product) {
        ProductDetailsResponse response = new ProductDetailsResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setQuantity(product.getQuantity());
        response.setCategory(product.getCategory());
        response.setImages(product.getImages());

        // Get seller information using reflection to access the @JsonIgnore field
        try {
            java.lang.reflect.Field sellerField = Product.class.getDeclaredField("seller");
            sellerField.setAccessible(true);
            Seller seller = (Seller) sellerField.get(product);

            if (seller != null) {
                ProductDetailsResponse.SellerInfo sellerInfo = new ProductDetailsResponse.SellerInfo(seller);
                response.setSeller(sellerInfo);
            }
        } catch (Exception e) {
            System.out.println("Error accessing seller information: " + e.getMessage());
        }

        return response;
    }

    // JWT-authenticated endpoint for adding products with images
    @PostMapping("/addProductWithImages")
    public ResponseEntity<?> addProductWithImages(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") double price,
            @RequestParam("quantity") int quantity,
            @RequestParam("category") String categoryName,
            @RequestParam(value = "images", required = false) MultipartFile[] images,
            HttpServletRequest request) {

        try {
            System.out.println("=== ADD PRODUCT WITH IMAGES ENDPOINT CALLED ===");

            // Get authenticated user from JWT
            Long userId = (Long) request.getAttribute("userId");
            String userRole = (String) request.getAttribute("userRole");

            System.out.println("User ID from JWT: " + userId);
            System.out.println("User Role from JWT: " + userRole);

            if (userId == null) {
                return ResponseEntity.status(401).body("User not authenticated");
            }

            if (!"seller".equalsIgnoreCase(userRole)) {
                return ResponseEntity.status(403).body("Access denied. Only sellers can add products.");
            }

            // Get the seller
            User currentUser = userService.findById(userId);
            if (currentUser == null || !(currentUser instanceof Seller)) {
                return ResponseEntity.status(404).body("Seller not found");
            }

            Seller seller = (Seller) currentUser;
            System.out.println("Seller found: " + seller.getFullName() + " (ID: " + seller.getId() + ")");

            // Validate required fields
            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Product name cannot be null or empty");
            }
            if (categoryName == null || categoryName.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Category is required");
            }

            // Find category
            Category category = categoryRepository.findByName(categoryName);
            if (category == null) {
                return ResponseEntity.badRequest().body("Category not found: " + categoryName);
            }

            // Create product
            Product product = new Product();
            product.setName(name);
            product.setDescription(description);
            product.setPrice(price);
            product.setQuantity(quantity);
            product.setCategory(category);
            product.setSeller(seller);

            // Save product first to get ID
            Product savedProduct = productRepository.save(product);
            System.out.println("Product saved with ID: " + savedProduct.getId());

            // Handle images if provided
            if (images != null && images.length > 0) {
                System.out.println("Processing " + images.length + " images...");
                for (MultipartFile image : images) {
                    if (!image.isEmpty()) {
                        try {
                            String imageUrl = cloudinaryService.uploadFile(image);
                            System.out.println("Image uploaded to: " + imageUrl);

                            ProductImage productImage = new ProductImage();
                            productImage.setImageUrl(imageUrl);
                            productImage.setProduct(savedProduct);
                            productImageRepository.save(productImage);

                            System.out.println("ProductImage saved to database");
                        } catch (Exception e) {
                            System.out.println("Failed to upload image: " + e.getMessage());
                            // Continue with other images even if one fails
                        }
                    }
                }
            } else {
                System.out.println("No images provided");
            }

            return ResponseEntity.ok(savedProduct);

        } catch (Exception e) {
            System.out.println("Error in addProductWithImages: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error adding product: " + e.getMessage());
        }
    }

}
