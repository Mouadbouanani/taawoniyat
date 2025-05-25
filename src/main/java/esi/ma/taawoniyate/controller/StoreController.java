package esi.ma.taawoniyate.controller;

import esi.ma.taawoniyate.model.Category;
import esi.ma.taawoniyate.model.Product;
import esi.ma.taawoniyate.model.Seller;
import esi.ma.taawoniyate.repository.CategoryRepository;
import esi.ma.taawoniyate.repository.ProductRepository;
import esi.ma.taawoniyate.repository.SellerRepository;

import esi.ma.taawoniyate.service.SellerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

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
    public ResponseEntity<?> addProduct(@RequestBody Product product) {
        // Validate required fields
        if (product.getName() == null || product.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Product name cannot be null or empty");
        }
        
        if (product.getSeller() == null) {
            return ResponseEntity.badRequest().body("Seller information is required");
        }

        if (product.getCategory() == null) {
            return ResponseEntity.badRequest().body("Category information is required");
        }

        // Verify seller exists
        Seller seller = sellerRepository.findSelllerByBusinessName(product.getSeller());
        if (seller == null) {
            return ResponseEntity.badRequest().body("Seller not found with Business Name: "+product.getSeller());
        }

        // Verify category exists
        Category category = categoryRepository.findByName(product.getCategory());
        if (category == null) {
            return ResponseEntity.badRequest().body("Category not found with Name: " + product.getCategory());
        }

        try {
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


}
