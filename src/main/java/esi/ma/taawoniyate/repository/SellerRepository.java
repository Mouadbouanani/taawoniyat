package esi.ma.taawoniyate.repository;

import esi.ma.taawoniyate.model.Seller;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SellerRepository extends JpaRepository<Seller, Integer> {
//    Seller findById(long id);
//    Seller findByProducts(String products);
//    Seller findByProductId(int productId);
//    Seller findByUserId(long userId);
    Seller findSelllerByBusinessName(String businessName);
}
