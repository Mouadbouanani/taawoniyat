package esi.ma.taawoniyate.controller;

import esi.ma.taawoniyate.model.Client;
import esi.ma.taawoniyate.model.Product;
import esi.ma.taawoniyate.model.ProductImage;
import esi.ma.taawoniyate.model.User;
import esi.ma.taawoniyate.repository.ProductImageRepository;
import esi.ma.taawoniyate.repository.ProductRepository;
import esi.ma.taawoniyate.repository.UserRepository;
import esi.ma.taawoniyate.service.CloudinaryService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:8081")
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final CloudinaryService cloudinaryService;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final UserRepository userRepository;
    private final HttpSession session;

    public ProductController(CloudinaryService cloudinaryService,
                             ProductRepository productRepository,
                             ProductImageRepository productImageRepository,
                             UserRepository userRepository,
                             HttpSession session) {
        this.cloudinaryService = cloudinaryService;
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.userRepository = userRepository;
        this.session = session;
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

    // Get product by ID
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Optional<Product> productData = productRepository.findById(id.intValue());

        if (productData.isPresent()) {
            return new ResponseEntity<>(productData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}