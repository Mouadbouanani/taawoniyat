//package esi.ma.taawoniyate.controller;
//
//import esi.ma.taawoniyate.model.Product;
//import esi.ma.taawoniyate.service.ProductService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//@RestController
//@RequestMapping("/api")
//public class ProductController {
//
//    @Autowired
//    private ProductService productService;
//
//    @PostMapping("/addProduct")
//    public ResponseEntity<?> addProduct(@RequestBody Product product) {
//        try {
//            Product savedProduct = productService.saveProduct(product);
//            return ResponseEntity.ok(savedProduct);
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body("Error adding product: " + e.getMessage());
//        }
//    }
//
//    @GetMapping("/products")
//    public ResponseEntity<?> getAllProducts() {
//        try {
//            return ResponseEntity.ok(productService.getAllProducts());
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body("Error fetching products: " + e.getMessage());
//        }
//    }
//}
