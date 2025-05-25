package esi.ma.taawoniyate.service;

import esi.ma.taawoniyate.model.Product;
import esi.ma.taawoniyate.model.Seller;
import esi.ma.taawoniyate.repository.SellerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class SellerService {

    @Autowired
    private SellerRepository sellerRepository;

    @Cacheable(value = "sellers", key = "#id")
    public Optional<Seller> findById(Integer id) {
        return sellerRepository.findById(id);
    }

    public Page<Seller> findAll(Pageable pageable) {
        return sellerRepository.findAll(pageable);
    }

    @Transactional
    @CacheEvict(value = {"sellers", "clients", "users"}, key = "#seller.id")
    public Seller save(Seller seller) {
        if (seller.getRole() == null) {
            seller.setRole("seller");
        }
        return sellerRepository.save(seller);
    }

    @Transactional
    @CacheEvict(value = {"sellers", "clients", "users"}, key = "#seller.id")
    public Seller update(Seller seller) {
        return sellerRepository.save(seller);
    }

    @Transactional
    @CacheEvict(value = {"sellers", "clients", "users"}, key = "#id")
    public void deleteById(Integer id) {
        sellerRepository.deleteById(id);
    }

    // Business-specific methods
    public List<Product> getSellerProducts(Integer sellerId) {
        Optional<Seller> seller = findById(sellerId);
        return seller.map(Seller::getProducts).orElse(List.of());
    }

    public List<Seller> findByBusinessName(String businessName) {
        return sellerRepository.findAll().stream()
                .filter(seller -> seller.getBusinessName() != null &&
                        seller.getBusinessName().toLowerCase().contains(businessName.toLowerCase()))
                .toList();
    }

    public long countProductsBySeller(Integer sellerId) {
        Optional<Seller> seller = findById(sellerId);
        return seller.map(s -> s.getProducts().size()).orElse(0);
    }

    public boolean existsById(Integer id) {
        return sellerRepository.existsById(id);
    }
}