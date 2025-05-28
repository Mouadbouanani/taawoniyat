package esi.ma.taawoniyate.controller;

import esi.ma.taawoniyate.model.*;
import esi.ma.taawoniyate.repository.CategoryRepository;
import esi.ma.taawoniyate.repository.ProductImageRepository;
import esi.ma.taawoniyate.repository.ProductRepository;
import esi.ma.taawoniyate.repository.UserRepository;
import esi.ma.taawoniyate.service.CloudinaryService;
import esi.ma.taawoniyate.service.UserService;
import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import static esi.ma.taawoniyate.controller.UserController.session;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:8081",allowCredentials = "true")
public class ProductController {

    private final CloudinaryService cloudinaryService;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    CategoryRepository categoryRepository;

    public ProductController(CloudinaryService cloudinaryService,
                             ProductRepository productRepository,
                             ProductImageRepository productImageRepository,
                             UserRepository userRepository) {
        this.cloudinaryService = cloudinaryService;
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.userRepository = userRepository;

    }

    @PostMapping("/{id}/upload-image")
    public ResponseEntity<String> uploadProductImage(@PathVariable Long id, @RequestParam("image") MultipartFile image) {
        System.out.println("Uploading image for product ID: " + id);

        // Find the product
        Product product = productRepository.findById(id.intValue())
                .orElse(null);

        if (product == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Product not found with ID: " + id);
        }

        try {
            // Upload to Cloudinary
            String imageUrl = cloudinaryService.uploadFile(image);

            // Create and save ProductImage
            ProductImage productImage = new ProductImage();
            productImage.setImageUrl(imageUrl);
            productImage.setProduct(product);
            productImageRepository.save(productImage);

            return ResponseEntity.ok(imageUrl);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload image: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/favorite")
    public ResponseEntity<Map<String, Object>> toggleFavorite(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();

        // Get the authenticated user from the session
        User user = (User) session.getAttribute("user");
        if (user == null || !(user instanceof Client)) {
            response.put("success", false);
            response.put("message", "User not authenticated or not a client");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        Client client = (Client) user;

        // Find the product
        Product product = productRepository.findById(id.intValue())
                .orElse(null);
        if (product == null) {
            response.put("success", false);
            response.put("message", "Product not found with ID: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        try {
            // Initialize produitFavoris if null
            if (client.getProduitFavoris() == null) {
                client.setProduitFavoris(new ArrayList<>());
            }

            // Toggle favorite status
            if (client.getProduitFavoris().contains(product)) {
                // Remove product from favorites
                client.getProduitFavoris().remove(product);
                response.put("success", true);
                response.put("message", "Product removed from favorites successfully");
            } else {
                // Add product to favorites
                client.getProduitFavoris().add(product);
                response.put("success", true);
                response.put("message", "Product added to favorites successfully");
            }

            // Save the updated client
            userRepository.save(client);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to toggle favorite status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/add-with-images")
    public ResponseEntity<?> addProductWithImages(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") double price,
            @RequestParam("quantity") int quantity,
            @RequestParam("category") String categoryName,
            @RequestParam("sellerId") Long sellerId,
            @RequestParam("images") MultipartFile[] images) {
        // Fetch seller
        Seller seller = null;
        try {
            seller = (Seller) userRepository.findById(sellerId);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid seller ID");
        }
        if (seller == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Seller not found");
        }
        // Fetch category
        Category category = null;
        try {

            category = categoryRepository.findByName(categoryName);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid category name");
        }
        if (category == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Category not found");
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
        // Handle images
        if (images != null && images.length > 0) {
            for (MultipartFile image : images) {
                try {
                    String imageUrl = cloudinaryService.uploadFile(image);
                    ProductImage productImage = new ProductImage();
                    productImage.setImageUrl(imageUrl);
                    productImage.setProduct(savedProduct);
                    productImageRepository.save(productImage);
                } catch (IOException e) {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload image: " + e.getMessage());
                }
            }
        }
        // Optionally reload product with images
        Product result = productRepository.findById((int)savedProduct.getId()).orElse(savedProduct);
        return ResponseEntity.ok(result);
    }

    // JWT-authenticated endpoint for adding products with images
    @PostMapping("/add-with-images-jwt")
    public ResponseEntity<?> addProductWithImagesJWT(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") double price,
            @RequestParam("quantity") int quantity,
            @RequestParam("category") String categoryName,
            @RequestParam(value = "images", required = false) MultipartFile[] images,
            HttpServletRequest request) {

        try {
            System.out.println("=== ADD PRODUCT WITH IMAGES JWT ENDPOINT CALLED ===");

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

            // Return the saved product
            Product result = productRepository.findById((int)savedProduct.getId()).orElse(savedProduct);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            System.out.println("Error in addProductWithImagesJWT: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error adding product: " + e.getMessage());
        }
    }

    // JWT-authenticated endpoint for deleting products
    @DeleteMapping("/{productId}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long productId, HttpServletRequest request) {
        try {
            System.out.println("=== DELETE PRODUCT ENDPOINT CALLED ===");
            System.out.println("Product ID: " + productId);

            // Get authenticated user from JWT
            Long userId = (Long) request.getAttribute("userId");
            String userRole = (String) request.getAttribute("userRole");

            System.out.println("User ID from JWT: " + userId);
            System.out.println("User Role from JWT: " + userRole);

            if (userId == null) {
                return ResponseEntity.status(401).body("User not authenticated");
            }

            if (!"seller".equalsIgnoreCase(userRole)) {
                return ResponseEntity.status(403).body("Access denied. Only sellers can delete products.");
            }

            // Find the product
            Product product = productRepository.findById(productId.intValue()).orElse(null);
            if (product == null) {
                return ResponseEntity.status(404).body("Product not found");
            }

            // Get the seller entity to check ownership
            try {
                java.lang.reflect.Field sellerField = Product.class.getDeclaredField("seller");
                sellerField.setAccessible(true);
                Seller productSeller = (Seller) sellerField.get(product);

                if (productSeller == null || productSeller.getId() != userId) {
                    return ResponseEntity.status(403).body("You can only delete your own products");
                }
            } catch (Exception e) {
                System.out.println("Error accessing seller information: " + e.getMessage());
                return ResponseEntity.status(500).body("Error verifying product ownership");
            }

            System.out.println("Deleting product: " + product.getName());

            // Delete the product (this will cascade delete related images and panier items)
            productRepository.deleteById(productId.intValue());

            return ResponseEntity.ok("Product deleted successfully");

        } catch (Exception e) {
            System.out.println("Error in deleteProduct: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error deleting product: " + e.getMessage());
        }
    }

    // JWT-authenticated endpoint for updating products
    @PutMapping("/update/{productId}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long productId,
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") double price,
            @RequestParam("quantity") int quantity,
            @RequestParam("category") String categoryName,
            @RequestParam(value = "newImages", required = false) MultipartFile[] newImages,
            @RequestParam(value = "existingImages", required = false) String[] existingImages,
            HttpServletRequest request) {

        try {
            System.out.println("=== UPDATE PRODUCT ENDPOINT CALLED ===");
            System.out.println("Product ID: " + productId);

            // Get authenticated user from JWT
            Long userId = (Long) request.getAttribute("userId");
            String userRole = (String) request.getAttribute("userRole");

            if (userId == null) {
                return ResponseEntity.status(401).body("User not authenticated");
            }

            if (!"seller".equalsIgnoreCase(userRole)) {
                return ResponseEntity.status(403).body("Access denied. Only sellers can update products.");
            }

            // Find the product
            Product product = productRepository.findById(productId.intValue()).orElse(null);
            if (product == null) {
                return ResponseEntity.status(404).body("Product not found");
            }

            // Check ownership
            try {
                java.lang.reflect.Field sellerField = Product.class.getDeclaredField("seller");
                sellerField.setAccessible(true);
                Seller productSeller = (Seller) sellerField.get(product);

                if (productSeller == null || productSeller.getId() != userId) {
                    return ResponseEntity.status(403).body("You can only update your own products");
                }
            } catch (Exception e) {
                System.out.println("Error accessing seller information: " + e.getMessage());
                return ResponseEntity.status(500).body("Error verifying product ownership");
            }

            // Find category
            Category category = categoryRepository.findByName(categoryName);
            if (category == null) {
                return ResponseEntity.badRequest().body("Category not found: " + categoryName);
            }

            // Update product information
            product.setName(name);
            product.setDescription(description);
            product.setPrice(price);
            product.setQuantity(quantity);
            product.setCategory(category);

            // Save updated product
            Product savedProduct = productRepository.save(product);
            System.out.println("Product updated: " + savedProduct.getName());

            // Handle image updates
            // First, delete all existing images for this product
            List<ProductImage> currentImages = productImageRepository.findByProductId(productId.intValue());
            for (ProductImage img : currentImages) {
                productImageRepository.delete(img);
            }

            // Add existing images that were kept
            if (existingImages != null) {
                for (String imageUrl : existingImages) {
                    if (imageUrl != null && !imageUrl.trim().isEmpty()) {
                        ProductImage productImage = new ProductImage();
                        productImage.setImageUrl(imageUrl);
                        productImage.setProduct(savedProduct);
                        productImageRepository.save(productImage);
                    }
                }
            }

            // Add new images
            if (newImages != null && newImages.length > 0) {
                for (MultipartFile image : newImages) {
                    if (!image.isEmpty()) {
                        try {
                            String imageUrl = cloudinaryService.uploadFile(image);
                            System.out.println("New image uploaded to: " + imageUrl);

                            ProductImage productImage = new ProductImage();
                            productImage.setImageUrl(imageUrl);
                            productImage.setProduct(savedProduct);
                            productImageRepository.save(productImage);
                        } catch (Exception e) {
                            System.out.println("Failed to upload new image: " + e.getMessage());
                        }
                    }
                }
            }

            // Return updated product
            Product result = productRepository.findById(productId.intValue()).orElse(savedProduct);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            System.out.println("Error in updateProduct: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error updating product: " + e.getMessage());
        }
    }
}