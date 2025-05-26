package esi.ma.taawoniyate.controller;

import esi.ma.taawoniyate.model.Product;
import esi.ma.taawoniyate.model.Seller;
import esi.ma.taawoniyate.service.SellerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import  jakarta.validation.Valid;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/sellers")
@CrossOrigin(origins = "http://localhost:8081")
public class SellerController {

    @Autowired
    private SellerService sellerService;

    @GetMapping
    public ResponseEntity<Page<Seller>> getAllSellers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() :
                Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Seller> sellers = sellerService.findAll(pageable);

        return ResponseEntity.ok(sellers);
    }

    @PostMapping
    public ResponseEntity<Seller> createSeller(@Valid @RequestBody Seller seller) {
        try {
            Seller savedSeller = sellerService.save(seller);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedSeller);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Seller> updateSeller(@PathVariable Integer id, @Valid @RequestBody Seller seller) {
        try {
            if (!sellerService.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            seller.setId(id);
            Seller updatedSeller = sellerService.update(seller);
            return ResponseEntity.ok(updatedSeller);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Seller> getSellerById(@PathVariable Integer id) {
        Optional<Seller> seller = sellerService.findById(id);
        return seller.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSeller(@PathVariable Integer id) {
        try {
            sellerService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/products")
    public ResponseEntity<List<Product>> getSellerProducts(@PathVariable Integer id) {
        List<Product> products = sellerService.getSellerProducts(id);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}/products/count")
    public ResponseEntity<Long> getProductCount(@PathVariable Integer id) {
        long count = sellerService.countProductsBySeller(id);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/business-name/{businessName}")
    public ResponseEntity<List<Seller>> getSellersByBusinessName(@PathVariable String businessName) {
        List<Seller> sellers = sellerService.findByBusinessName(businessName);
        return ResponseEntity.ok(sellers);
    }

    @GetMapping("/exists/{id}")
    public ResponseEntity<Boolean> checkSellerExists(@PathVariable Integer id) {
        boolean exists = sellerService.existsById(id);
        return ResponseEntity.ok(exists);
    }
}